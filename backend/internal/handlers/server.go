package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	CoreModels "social-network-backend/internal/models/app"

	"github.com/gorilla/websocket"
)

var allUsers []ServerUser
var NotUsers []ServerUser
var sockets = make(map[string]websocket.Conn)

var userSockets *map[string]websocket.Conn = &sockets

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins (for development only)
	},
}

func HandleWebSocket(app *CoreModels.App, w http.ResponseWriter, r *http.Request) {

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("Connection closed unexpectedly: %v", err)

				for i, s := range *userSockets {
					if &s == conn {
						delete(*userSockets, i)
					}
					return
				}
			}
			log.Printf("Read failed: %v", err)
			return
		}
		// //log.Printf("Received: %s", message)
		// if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
		// 	log.Printf("Write failed: %v", err)
		// 	return
		// }

		var myMessage MyMessage
		json.Unmarshal(message, &myMessage)
		fmt.Println(myMessage)
		// cookieValue := r.Header.Get("Cookie")
		// handleWebSocketConnection(conn, cookieValue)
		(*userSockets)[myMessage.From] = *conn
		handleWebSocketMessage(app, conn, myMessage)

	}
}

func handleWebSocketMessage(app *CoreModels.App, conn *websocket.Conn, message MyMessage) {

	switch message.Type {
	case "message":

		// handleMessageMessage(conn, message)
		// notifyMassage(conn, message)
	case "get_users":
		handleGetFriends(conn , message.From)
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

func handleGetFriends(conn *websocket.Conn, id string) {
	db := OpenDatabase()
	defer db.Close()
	users := getAllUsers(db,id)
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
	conn := (*userSockets)[to]
	conn.WriteJSON(message)
}
