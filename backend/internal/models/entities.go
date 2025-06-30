package models

import "database/sql"

type Post struct {
	ID            string `json:"id`
	UserID        string `json:"user_id"`
	Content       string `json:"content"`
	ImageFile     string `json:"image_file"`
	UserNickname  string `json:"UserNickname"`
	UserFullname  string `json:UserFname`
	PrivacyTypeID string `json:"privacy_type_id"`
	GroupID       string `json:"group_id"`
	CreatedAt     string `json:created_at`
	Comments      []Comment
	VisibleTo     []string       `json:"visible_to"`
	UserEmail     string         `json:"userEmail"`
	UserImage     sql.NullString `json:"userImage"`
}
type Comment struct {
	ID           string `json:"id`
	PostID       string `json:"PostID"`
	Comment      string `json:"content"`
	UserID       string `json:"user_id"`
	ImageFile    string `json:"image_file"`
	UserFullname string `json:"UserFname"`
	UserImage     sql.NullString `json:"userImage"`

	UserNickname string `json:"UserNickname"`
	Date         string `json:"date"`
	CreatedAt    string `json:created_at`
}
type User struct {
	ID        string `json:"id"`
	FirstN    string `json:"first_name"`
	LastN     string `json:"last_name"`
	Nickname  string `json:"nickname"`
	Email     string `json:"email"`
	Date      string `json:"date_of_birth"`
	Password  string `json:"password"`
	Avatar    string `json:"avatar"`
	Aboutme   string `json:"about_me"`
	IsPublic  string `json:"is_public"`
	CreatedAt string `json:created_at`
}
type Group struct {
	ID           string   `json:"id"`
	Creator      string   `json:"creator"`
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	InvitedUsers []string `json:"invited_users"`
	Members      string   `json:"members"`
	CreatedAt    string   `json:"created_at"`
}
