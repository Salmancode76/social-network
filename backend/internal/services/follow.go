package services

import (
	"database/sql"
	"log"
	"social-network-backend/internal/models"
)

type FollowModel struct {
	DB *sql.DB
}

func (F *FollowModel) MakeFollow(req models.FollowRequest, status int) error {
	stmt := `INSERT OR REPLACE INTO followers (follower_id, following_id, request_status_id) VALUES (?, ?, ?)	`
	_, err := F.DB.Exec(stmt, &req.FollowerID, &req.FollowingID, &status)
	if err != nil {
		log.Printf("Following error: %v\n", err)
		return err
	}

	return nil
}

func (F *FollowModel) StatusFollow(followerID string ,followingID string) ( int , error) {

	stmt := `SELECT request_status_id FROM followers WHERE follower_id = ? AND following_id = ?`

	var statusID int
	err := F.DB.QueryRow(stmt, followerID, followingID).Scan(&statusID)
	if err != nil {
		return 0 , err
	}
	return statusID , err

}


func (F *FollowModel) GetFollowers(userID string) ( []models.User, error) {
	var Users []models.User
	stmt := `SELECT u.id, u.first_name, u.last_name, u.nickname ,avatar  FROM followers f JOIN users u ON f.follower_id = u.id WHERE f.following_id = ? AND f.request_status_id = 2`

	rows, err := F.DB.Query(stmt,userID)
	if err != nil {
		return Users, err
	}
	defer rows.Close()

	for rows.Next() {
			var user models.User
			var avatar sql.NullString

			err := rows.Scan(
			&user.ID,
			&user.FirstN,
			&user.LastN,
			&user.Nickname,	
			&avatar,
		)
		if err != nil {
			return Users, err
		}

		if (avatar.Valid && avatar.String != ""){
		user.Avatar = avatar.String
		} else {
			user.Avatar = "profile_notfound.png"
		}
		Users = append(Users, user)

		}
		return Users, nil

}

func (F *FollowModel) GetFollowing(userID string) ( []models.User, error) {
	var Users []models.User
	stmt := `SELECT u.id, u.first_name, u.last_name, u.nickname ,avatar  FROM followers f JOIN users u ON f.following_id = u.id WHERE f.follower_id = ? AND f.request_status_id = 2`

	rows, err := F.DB.Query(stmt,userID)
	if err != nil {
		return Users, err
	}
	defer rows.Close()

	for rows.Next() {
			var user models.User
			var avatar sql.NullString

			err := rows.Scan(
			&user.ID,
			&user.FirstN,
			&user.LastN,
			&user.Nickname,	
			&avatar,
		)
		if err != nil {
			return Users, err
		}

		if (avatar.Valid && avatar.String != ""){
		user.Avatar = avatar.String
		} else {
			user.Avatar = "profile_notfound.png"
		}
		Users = append(Users, user)

		}
		return Users, nil

}

func (F *FollowModel) DeleteFollow(followerID string, followingID string) error {
	query := `DELETE FROM followers WHERE follower_id = $1 AND following_id = $2`
	_, err := F.DB.Exec(query, followerID, followingID)
	return err
}

func (F *FollowModel)RequestFollow(requesterID string, receiverID string)(error){
	stmt :=` UPDATE followers
			SET 
				request_status_id = 3
			WHERE 
			follower_id = (?) AND following_id = (?);`

	_,err:=F.DB.Exec(stmt,requesterID,receiverID)

	if err!=nil{
		return err
	}

	return nil

}