package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

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
				//delete(app.UserID, cookie.Value)
				//fmt.Println(app.UserID)
			}
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
		handleWebSocketMessage(app, conn, myMessage)

	}
}

func handleWebSocketMessage(app *CoreModels.App, conn *websocket.Conn, message MyMessage) {

	switch message.Type {
	case "message":
		
		// handleMessageMessage(conn, message)
		// notifyMassage(conn, message)
	case "get_users":
		message := ServerMessage{Type: "allusers"}
		conn.WriteJSON(message)
		fmt.Println("message sent to client", message)
		// handleGetFriends(conn, message.To)
		// handleGetUsersMessage(conn)
		// onlineusers(app, conn)
	case "get_chat_history":
		// handleGetChatHistoryMessage(conn, message)
		// SetRead(message.From, message.To)
	case "read_message":
		// SetRead(message.From, message.To)
	case "logout":
		// logoutUser(message.From, app)
		// UpdateOfflineUsers(app, message.From)

	default:
		log.Printf("Unsupported message type: %s", message.Type)

	}
}
