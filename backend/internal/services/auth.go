package services

import (
	"database/sql"
	"log"
	"social-network-backend/internal/models"
)

type UserModel struct {
	DB *sql.DB
}

func (U *UserModel) Register(User models.User) error {
	stmt := `INSERT INTO users (email , password_hash , first_name, last_name , date_of_birth, nickname,is_public) VALUES (?,?,?,?,?,?,?)	`
	_, err := U.DB.Exec(stmt, &User.Email, &User.Password, &User.FirstN, &User.LastN, &User.Date, &User.Nickname, &User.IsPublic)
	if err != nil {
		log.Printf("Register error: %v\n", err)
		return err
	}

	return nil
}
