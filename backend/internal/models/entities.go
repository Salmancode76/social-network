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
	ID           string         `json:"id`
	PostID       string         `json:"PostID"`
	Comment      string         `json:"content"`
	UserID       string         `json:"user_id"`
	ImageFile    string         `json:"image_file"`
	UserFullname string         `json:"UserFname"`
	UserImage    sql.NullString `json:"userImage"`

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
	ID                string         `json:"id"`
	Creator           string         `json:"creator"`
	Title             string         `json:"title"`
	Description       string         `json:"description"`
	InvitedUsers      []string       `json:"invited_users"`
	Members           string         `json:"members"`
	CreatedAt         string         `json:"created_at"`
	request_status_id sql.NullString `json:request_status_id`
}

type Event struct {
	ID            int    `json:"id"`
	GroupID       int    `json:"group_id"`
	CreatorID     int    `json:"creator_id"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	EventDatetime string `json:"event_datetime"`
	CreatedAt     string `json:"created_at"`
}
type GroupPostComment struct {
	UserID    int    `json:"user_id"`
	Content   string `json:"text"`
	Image     string `json:"image"`      // ✅ added field for image
	CreatedAt string `json:"created_at"`
}


type GroupPost struct {
	ID        int    `json:"id"`
	UserID    int    `json:"user_id"`
	Content   string `json:"content"`
	ImageFile string `json:"image_file"` 
	ImagePath string `json:"image"`      
	GroupID   string `json:"group_id"`
	CreatedAt string `json:"created_at"`
	Comments  []GroupPostComment  `json:"comments"`
}


type Notification struct {
	ID                 int    `json:"id"`
	UserID             int    `json:"user_id"`
	UserFullName       string `json:"user_fullName"`
	GroupTitle         string `json:"group_title"`
	NotificationTypeID int    `json:"notification_type_id"`
	NotificationType   string `json:"notification_type"`
	Message            string `json:"message"`
	RelatedUserID      *int   `json:"related_user_id"`
	RelatedGroupID     *int   `json:"related_group_id"`
	RelatedEventID     *int   `json:"related_event_id"`
	IsRead             bool   `json:"is_read"`
	CreatedAt          string `json:"created_at"`
}

type Request struct {
	NotificationID int  `json:"notification_id"`
	RelatedGroupID int  `json:"related_group_id"`
	RelatedUserID  int  `json:"related_user_id"`
	Accepted       bool `json:"accepted"`
	CreatorID      int `json:"creator_id"`
}

type Invite struct {
	SenderID int 	`json:"sender_id"`
	UserIDs []string `json:"user_ids"`
	GroupID int      `json:"group_id"`
}

type FollowRequest struct {
	FollowerID  string   `json:"follower_id"`
	FollowingID string   `json:"following_id"`
	IsPublic    string   `json:"is_public"`
	UserID 		int 		`json:"userID"`
	StatusID	string	 `json:"statusID"`
}
