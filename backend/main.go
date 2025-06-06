package main

import (
	"log"
	"net/http"
	"social-network-backend/internal/db/sqlite"
	"social-network-backend/internal/models"
	"time"

	_ "github.com/mattn/go-sqlite3"
)
var App *models.App
func main() {
	App = &models.App{
		DB:      sqlite.ConnectDB(),
		Session: make(map[string]string),
	}

	s:= models.Server{
		HTTP: &http.Server{
			Addr:         ":8080",
			//Handler:      app.Routes(),
			WriteTimeout: 10 * time.Second,
			ReadTimeout:  10 * time.Second,
		},
	}
	App.Server = &s
	log.Println("Starting server on", App.Server.HTTP.Addr)

	if err := App.Server.HTTP.ListenAndServe(); err != nil {
		log.Fatal("Failed to start server:", err)
	}


}