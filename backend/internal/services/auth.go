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

func (U *UserModel) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := U.DB.QueryRow("SELECT id,password_hash FROM users WHERE email = ?", email).
		Scan(&user.ID ,&user.Password)
	if err != nil {
		return  nil , errors.New("user not found")
	}
	return  &user,nil
}
// func (U *UserModel) GetUserByUsername(nickname string) (error) {
// 	var user models.User
// 	err := U.DB.QueryRow("SELECT id  FROM users WHERE nickname = ?", nickname).
// 		Scan(&user.ID)
// 	if err != nil {
// 		return  errors.New("user not found")
// 	}
// 	return  nil
// }



func(U *UserModel) FetchAllUsers() ([]models.User, error) {
	stmt := `SELECT id, first_name, last_name, nickname, email, date_of_birth, 
	         password_hash, is_public, created_at FROM users`
	var Users []models.User
	rows, err := U.DB.Query(stmt)
	
	if err != nil {
		return Users, err
	}
	defer rows.Close() // Important: close rows when done
	
	for rows.Next() {
		var user models.User
		var avatar sql.NullString
		
		err := rows.Scan(
			&user.ID,
			&user.FirstN,
			&user.LastN,
			&user.Nickname,
			&user.Email,
			&user.Date,
			&user.Password,
			&user.IsPublic,
			&user.CreatedAt,
		)
		if err != nil {
			return Users, err
		}
		
		// Handle the nullable avatar field
		if avatar.Valid {
			user.Avatar = avatar.String
		} else {
			user.Avatar = "" // or some default value
		}
		
		Users = append(Users, user)
	}
	
	// Check for errors during iteration
	if err = rows.Err(); err != nil {
		return Users, err
	}

	return Users, nil
}