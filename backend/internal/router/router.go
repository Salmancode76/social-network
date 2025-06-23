package router

import (
	"net/http"
	"social-network-backend/internal/handlers"
	CoreModels "social-network-backend/internal/models/app"
)



func SetupRoutes(app *CoreModels.App) *http.ServeMux {
	mux := http.NewServeMux()


	mux.HandleFunc(("/api/CreatePost"),handlers.CreatePost(app))

	mux.HandleFunc(("/api/FetchAllPosts"),handlers.FetchAllPosts(app))

	mux.HandleFunc(("/api/ViewPost"),handlers.FetchPostByID(app))

	mux.HandleFunc("/api/CreateComment",handlers.CreateComment(app))

	mux.HandleFunc("/api/Register",handlers.RegisterHandler(app))

	mux.HandleFunc("/api/Login",handlers.LoginHandler(app))

	mux.HandleFunc("/api/Logout",handlers.LogoutHandler(app))

	mux.HandleFunc("/api/check-session",handlers.CheckSessionHandler(app))

	
	// mux.HandleFunc(("/api/FetchAllUsers"),handlers.FetchAllUsersHandler(app))

	//Serve Images 
	imageHandler := http.StripPrefix("/Image/", http.FileServer(http.Dir("../Image/")))
	mux.Handle("/Image/", imageHandler)
	

	return mux
}