package services

import (
	"database/sql"
	"errors"
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

func (U *UserModel) GetUserByEmail(email string) ( error) {
	var user models.User
	err := U.DB.QueryRow("SELECT id FROM users WHERE email = ?", email).
		Scan(&user.ID)
	if err != nil {
		return  errors.New("user not found")
	}
	return  nil
}
func (U *UserModel) GetUserByUsername(nickname string) (error) {
	var user models.User
	err := U.DB.QueryRow("SELECT id  FROM users WHERE nickname = ?", nickname).
		Scan(&user.ID)
	if err != nil {
		return  errors.New("user not found")
	}
	return  nil
}
