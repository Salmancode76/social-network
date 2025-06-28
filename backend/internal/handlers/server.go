package handlers

import (
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
}
