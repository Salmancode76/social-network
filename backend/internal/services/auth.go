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
	stmt := `INSERT INTO users (email , password_hash , first_name, last_name , date_of_birth,avatar, nickname,about_me,is_public) VALUES (?,?,?,?,?,?,?,?,?)	`
	_, err := U.DB.Exec(stmt, &User.Email, &User.Password, &User.FirstN, &User.LastN, &User.Date,&User.Avatar, &User.Nickname,&User.Aboutme, &User.IsPublic)
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



func(U *UserModel) FetchAllUsers( id int) ([]models.User, error) {
	stmt := `SELECT id, first_name, last_name, nickname, email, date_of_birth, 
	          avatar,is_public,about_me, created_at FROM users where id <> (?)`
	var Users []models.User
	rows, err := U.DB.Query(stmt,id)
	
	if err != nil {
		return Users, err
	}
	defer rows.Close() // Important: close rows when done
	
	for rows.Next() {
		var user models.User
		var avatar sql.NullString
		var aboutMe sql.NullString
		
		err := rows.Scan(
			&user.ID,
			&user.FirstN,
			&user.LastN,
			&user.Nickname,
			&user.Email,
			&user.Date,
			&avatar,
			&user.IsPublic,
			&aboutMe,
			&user.CreatedAt,
		)
		if err != nil {
			return Users, err
		}
		
		if aboutMe.Valid{
			user.Aboutme = aboutMe.String
		}

		// Handle the nullable avatar field
		if avatar.Valid {
			user.Avatar = avatar.String
		} else {
			user.Avatar = "profile_notfound.png" // or some default value
		}
		
		Users = append(Users, user)
	}
	
	// Check for errors during iteration
	if err = rows.Err(); err != nil {
		return Users, err
	}

	return Users, nil
}

func(U *UserModel)FetchUserByID( id string) (*models.User, error) {
	stmt := `SELECT id, first_name, last_name, nickname, email, date_of_birth,avatar, 
	          is_public,about_me, created_at FROM users where id = ?`
	var user models.User
	var avatar sql.NullString
	 err := U.DB.QueryRow(stmt,id).Scan(
			&user.ID,
			&user.FirstN,
			&user.LastN,
			&user.Nickname,
			&user.Email,
			&user.Date,
			&avatar,
			&user.IsPublic,
			&user.Aboutme,
			&user.CreatedAt,
		)
	
	if err != nil {
		return &user, err
	}
	
	if (avatar.Valid && avatar.String != ""){
		user.Avatar = avatar.String
	} else {
		user.Avatar = "profile_notfound.png"
	}
	

	return &user, nil
}


func (U *UserModel) FetchUsersNotInGroup (group_id string , user_id string)([]models.User,error){
	stmt :=`SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.date_of_birth,
    u.avatar,
    u.nickname,
    u.about_me,
    u.is_public,
    u.created_at
FROM users u
WHERE u.id <> ?
  AND u.id NOT IN (
      SELECT user_id FROM group_members WHERE group_id = ?
  );
`

var Users []models.User
	rows, err := U.DB.Query(stmt,user_id,group_id)
	
	if err != nil {
		return Users, err
	}
	defer rows.Close() // Important: close rows when done
	
	for rows.Next() {
		var user models.User
		var avatar sql.NullString
		var aboutMe sql.NullString
		
		err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.FirstN,
			&user.LastN,
			&user.Date,
			&avatar,
			&user.Nickname,
			&aboutMe,
			&user.IsPublic,
			&user.CreatedAt,
		)
		if err != nil {
			return Users, err
		}
		
		if aboutMe.Valid{
			user.Aboutme = aboutMe.String
		}

		// Handle the nullable avatar field
		if avatar.Valid {
			user.Avatar = avatar.String
		} else {
			user.Avatar = "profile_notfound.png" // or some default value
		}
		
		Users = append(Users, user)
	}
	
	// Check for errors during iteration
	if err = rows.Err(); err != nil {
		return Users, err
	}

	return Users, nil
}

func (U *UserModel) UpdateUserByData (user models.User)(error){
	stmt := `
		UPDATE users 
		SET first_name = ?, 
		    last_name = ?, 
		    nickname = ?, 
		    about_me = ? 
		WHERE id = ?
	`

	_, err := U.DB.Exec(stmt, user.FirstN, user.LastN, user.Nickname, user.Aboutme, user.ID)
	if err != nil {
		log.Printf("Update error: %v", err)
		return err
	}

	return nil

}