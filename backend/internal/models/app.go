package models

import (
	"database/sql"
	"net/http"
)

type UserModel struct {
	DB *sql.DB
}

type Server struct {
	HTTP *http.Server
}

type App struct {
	Server  *Server
	//Users   *repository.UserModel
	//Posts *repository.PostModel
	DB      *sql.DB
	Session map[string]string
	UserID  map[string]string
}
