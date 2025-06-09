package CoreModels

import (
	"database/sql"
	"net/http"
	"social-network-backend/internal/services"
)

type UserModel struct {
	DB *sql.DB
}

type Server struct {
	HTTP *http.Server
}

type App struct {
	Server  *Server
	//Users   *services.UserModel
	Posts *services.PostModel
	DB      *sql.DB
	Session map[string]string
	UserID  map[string]string
}
