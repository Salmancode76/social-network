package router

import (
	"net/http"
	"social-network-backend/internal/handlers"
	CoreModels "social-network-backend/internal/models/app"
)

func SetupRoutes(app *CoreModels.App) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleWebSocket(app, w, r)
	})

	mux.HandleFunc(("/api/CreatePost"), handlers.CreatePost(app))

	mux.HandleFunc(("/api/FetchAllPosts"), handlers.FetchAllPosts(app))

	mux.HandleFunc(("/api/ViewPost"), handlers.FetchPostByID(app))

	mux.HandleFunc("/api/CreateComment", handlers.CreateComment(app))

	mux.HandleFunc("/api/Register", handlers.RegisterHandler(app))

	mux.HandleFunc("/api/Login", handlers.LoginHandler(app))

	mux.HandleFunc("/api/Logout", handlers.LogoutHandler(app))

	mux.HandleFunc("/api/check-session", handlers.CheckSessionHandler(app))

	mux.HandleFunc(("/api/FetchAllUsers"), handlers.FetchAllUsersHandler(app))

	mux.HandleFunc(("/api/FetchUserByID"), handlers.UserDataHandler(app))
	
	mux.HandleFunc(("/api/FetchPostsByUserID"), handlers.FetchPostsByUserID(app))

	mux.HandleFunc(("/api/GetUserIDFromSession"), handlers.GetuserIDHandler(app))

	mux.HandleFunc("/api/CreateGroup", handlers.CreateGroup(app))
	mux.HandleFunc("/api/FetchAllGroups", handlers.FetchAllGroups(app))
	mux.HandleFunc("/api/group/messages", handlers.GetGroupMessages(app))
	mux.HandleFunc("/api/group/send-message", handlers.SendGroupMessage(app))

	mux.HandleFunc("/api/CreateEvent", handlers.CreateEvent(app))
	mux.HandleFunc("/api/FetchEvents", handlers.FetchEvents(app))
	mux.HandleFunc("/api/OptionsEvent", handlers.OptionsEvent(app))
	
	mux.HandleFunc("/api/update-profile",handlers.UpdateProfile(app))

	mux.HandleFunc("/api/RequestJoin", handlers.SendRequestToJoin(app))
	mux.HandleFunc("/api/GetAllNotifications", handlers.GetAllNotifications(app))
	mux.HandleFunc("/api/ManageRequest", handlers.ManageRequestGroups(app))
	mux.HandleFunc("/api/ManageInvites", handlers.ManageInvitestGroups(app))

	mux.HandleFunc("/api/MarkNotificationAsRead", handlers.MarkNotificationAsRead(app))

	mux.HandleFunc("/api/FetchUninvitedUsersToGroup",handlers.FetchAllUninvitedUsersToGroup(app))
	
	mux.HandleFunc("/api/InviteInGroupUsers",handlers.InGroupInvite(app))

	//Serve Images
	imageHandler := http.StripPrefix("/Image/", http.FileServer(http.Dir("../Image/")))
	mux.Handle("/Image/", imageHandler)

	return mux
}
