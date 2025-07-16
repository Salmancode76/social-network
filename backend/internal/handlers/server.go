package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"

	"social-network-backend/internal/models"
	CoreModels "social-network-backend/internal/models/app"

	"github.com/gorilla/websocket"
)

var socketsMutex sync.RWMutex

var allUsers []ServerUser
var NotUsers []ServerUser
var sockets = make(map[string]websocket.Conn)

var userSockets = make(map[string]*websocket.Conn)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins (for development only)
	},
}

func registerSocket(userID string, conn *websocket.Conn) {
	socketsMutex.Lock()
	defer socketsMutex.Unlock()

	if existingConn, exists := userSockets[userID]; exists {
		log.Printf("Closing existing connection for user %s", userID)
		existingConn.Close()
	}

	userSockets[userID] = conn
	log.Printf("Registered user %s with WebSocket connection", userID)
}

func removeSocket(userID string) {
	socketsMutex.Lock()
	defer socketsMutex.Unlock()

	if conn, exists := userSockets[userID]; exists {
		conn.Close()
		delete(userSockets, userID)
		log.Printf("Removed connection for user %s", userID)
	}
}

func getSocket(userID string) (*websocket.Conn, bool) {
	socketsMutex.RLock()
	defer socketsMutex.RUnlock()

	conn, exists := userSockets[userID]
	return conn, exists
}

func HandleWebSocket(app *CoreModels.App, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	var currentUserID string

	defer func() {
		if currentUserID != "" {
			removeSocket(currentUserID)
		}
		conn.Close()
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("Connection closed unexpectedly: %v", err)
			}
			break
		}

		var rawJson struct {
			Type string `json:"type"`
		}
		json.Unmarshal(message, &rawJson)
		//fmt.Println(message)

		switch rawJson.Type {
		case "message", "get_users", "get_chat_history", "new_message", "logout":
			var myMessage MyMessage
			json.Unmarshal(message, &myMessage)

			// Register connection only once per user
			if currentUserID == "" {
				currentUserID = myMessage.From
				registerSocket(currentUserID, conn)
			}

			handleWebSocketMessage(app, conn, myMessage)

		case "sendRequestToJoinGroup":
			var request models.Request
			json.Unmarshal(message, &request)

			userIDStr := strconv.Itoa(request.RelatedUserID)
			if currentUserID == "" {
				currentUserID = userIDStr
				registerSocket(currentUserID, conn)
			}

			handleWebSocket_Request_Group(app, conn, request)
			sendNotificationsToUser(request.CreatorID, app)

		case "get_all_notifications":
			var notificationRequest models.Notification
			json.Unmarshal(message, &notificationRequest)

			userIDStr := strconv.Itoa(notificationRequest.UserID)
			if currentUserID == "" {
				currentUserID = userIDStr
				registerSocket(currentUserID, conn)
			}
		case "sendInviteToGroup":
			var Invites models.Invite
			json.Unmarshal(message, &Invites)
			fmt.Println(Invites)
			app.Notifications.SendInvitesInGroup(Invites.SenderID, Invites.UserIDs, Invites.GroupID)
			for i := 0; i < len(Invites.UserIDs); i++ {
				idString, err := strconv.Atoi(Invites.UserIDs[i])
				if err != nil {
					log.Println(err)
				}
				sendNotificationsToUser(idString, app)
			}
		case "sendCreateGroup":
			var group *models.Group
			json.Unmarshal(message, &group)
			fmt.Println(group)
			group_id, err := app.Groups.CreateGroup(group)
			creatorID, err := strconv.Atoi(group.Creator)
			if err != nil {
				log.Println(err)
			}
			err = app.Notifications.SendInvites(creatorID, group.InvitedUsers, group_id)

			for _, userID := range group.InvitedUsers {
				userID, err := strconv.Atoi(userID)
				if err != nil {
					log.Println(err)
				}

				sendNotificationsToUser(userID, app)

			}
		case "createEvent":
			var event models.Event
			json.Unmarshal(message, &event)
			err = app.Groups.CreateEvent(event)
			ids, err := app.Notifications.SendEventNofi(event.CreatorID, event.GroupID)
			fmt.Println(event.CreatorID)
			if err != nil {
				sendErrorResponse(w, "Failed to save event", http.StatusInternalServerError)
				return
			}
			for _, userID := range ids {
				userID, err := strconv.Atoi(userID)
				if err != nil {
					log.Println(err)
				}
				sendNotificationsToUser(userID, app)
			}
		default:
			log.Println("Message Not supported")
		}
	}
}
func sendNotificationsToUser(userID int, app *CoreModels.App) {
	userIDStr := strconv.Itoa(userID)

	conn, ok := getSocket(userIDStr)
	if !ok || conn == nil {
		log.Printf("No active WebSocket connection for user %d", userID)
		return
	}

	notifications, err := app.Notifications.GetAllNotifications(userID)
	if err != nil {
		log.Printf("Error fetching notifications: %v", err)
		return
	}

	payload := map[string]interface{}{
		"type":          "notifications",
		"notifications": notifications,
	}

	err = conn.WriteJSON(payload)
	if err != nil {
		log.Printf("Failed to send notification to user %d: %v", userID, err)
		removeSocket(userIDStr)
	}
}

func handleWebSocket_Request_Group(app *CoreModels.App, conn *websocket.Conn, Request models.Request) {
	err := app.Notifications.SendRequestToJoinGroup(Request.RelatedGroupID, Request.RelatedUserID)
	if err != nil {
		log.Println(err)
	}

	CreatorStr := strconv.Itoa(Request.CreatorID)
	creatorConn, ok := getSocket(CreatorStr)

	fmt.Println("Currently registered connections:")
	socketsMutex.RLock()
	for userID, _ := range userSockets {
		fmt.Printf("  User ID: %s\n", userID)
	}
	socketsMutex.RUnlock()

	if ok {
		response := map[string]interface{}{
			"type":     "recivesReq",
			"group_id": Request.RelatedGroupID,
			"status":   "sent",
		}
		fmt.Printf("Looking for key: %s\n", CreatorStr)

		err := creatorConn.WriteJSON(response)
		if err != nil {
			log.Printf("Failed to send group request to user %s: %v", CreatorStr, err)
			removeSocket(CreatorStr)
		}
	} else {
		log.Printf("No active connection found for CreatorID %s", CreatorStr)
	}
}
func handleWebSocketMessage(app *CoreModels.App, conn *websocket.Conn, message MyMessage) {

	switch message.Type {
	case "get_group_chat_history":
		fmt.Println("Get group chat history request received", message)
	case "message":

		// handleMessageMessage(conn, message)
		// notifyMassage(conn, message)
	case "get_users":
		handleGetFriends(conn, message.From)
		// handleGetUsersMessage(conn)
		// onlineusers(app, conn)
	case "get_chat_history":

		handleGetChatHistoryMessage(conn, message)
		// SetRead(message.From, message.To)
	case "new_message":
		fmt.Println("New message received: ", message)
		handleNewMessage(conn, message)
		//send message to receiver
		notifyNewMessage(message)
	case "logout":
		// logoutUser(message.From, app)
		// UpdateOfflineUsers(app, message.From)

	default:
		log.Printf("Unsupported message type: %s", message.Type)

	}
}

func handleGetFriends(conn *websocket.Conn, userID string) {
	db := OpenDatabase()
	defer db.Close()
	users := getAllUsers(db, userID)
	message := ServerMessage{Type: "allusers", AllUsers: users}
	conn.WriteJSON(message)
	fmt.Println(users)
}

func OpenDatabase() *sql.DB {
	db, err := sql.Open("sqlite3", "../internal/db/sqlite/db.db")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return nil
	}
	return db
}

func handleGetChatHistoryMessage(conn *websocket.Conn, m MyMessage) {
	db := OpenDatabase()
	defer db.Close()
	From := m.From
	To := GetUserID(db, string(m.To))
	fmt.Println(To)
	fmt.Println(From)
	fmt.Println("New message  ", m)

	messages := GetChatHistory(To, From, m.Set)

	message := ServerMessage{Type: "oldmessages", ChatHistory: messages}

	conn.WriteJSON(message)
	// fmt.Println(message)

}

func handleNewMessage(conn *websocket.Conn, m MyMessage) {
	db := OpenDatabase()
	defer db.Close()
	From := m.From
	To := GetUserID(db, string(m.To))
	fmt.Println(To)
	fmt.Println(From)
	fmt.Println("New message  ", m.Text)
	AddMessageToHistory(From, To, m.Text)
}

func notifyNewMessage(m MyMessage) {
	from := GetNickname(m.From)
	message := MyMessage{Type: "new", From: from, To: m.To, Text: m.Text}
	to := GetID(m.To)
	conn := (userSockets)[to]
	conn.WriteJSON(message)
}
