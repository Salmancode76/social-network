package main

import (
	"log"
	"net/http"
	"social-network-backend/internal/db/sqlite"
	CoreModels "social-network-backend/internal/models/app"
	"social-network-backend/internal/router"
	"social-network-backend/internal/services"
	"time"

	_ "github.com/mattn/go-sqlite3"
)
var App *CoreModels.App
func main() {
	DB :=  sqlite.ConnectDB()
	App = &CoreModels.App{
		DB:     DB,
		Session: make(map[string]string),
		Posts: &services.PostModel{DB:DB},
		Users:  &services.UserModel{DB: DB},
		Groups: &services.GroupModel{DB: DB},
		
	}
	s:= CoreModels.Server{
		HTTP: &http.Server{
			Addr:         ":8080",
			Handler:      router.SetupRoutes(App),
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