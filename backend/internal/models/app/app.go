package CoreModels

import (
	"database/sql"
	"net/http"
	"social-network-backend/internal/services"
)



type Server struct {
	HTTP *http.Server
}

type App struct {
	Server  *Server
	Users   *services.UserModel
	Posts   *services.PostModel
	Follow  *services.FollowModel
	Groups 	*services.GroupModel
	Notifications *services.NotificationModel
	DB      *sql.DB
	Session map[string]string
	UserID  map[string]string
}
