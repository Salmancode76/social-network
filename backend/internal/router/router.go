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

	//Serve Images 
	imageHandler := http.StripPrefix("/Image/", http.FileServer(http.Dir("../Image/")))
	mux.Handle("/Image/", imageHandler)
	

	return mux
}