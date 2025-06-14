package models


type Post struct {
	ID        string `json:"id`
	UserID    string `json:"user_id"`
	Content   string `json:"content"`
	ImageFile string `json:"image_file"`

	PrivacyTypeID string `json:"privacy_type_id"`
	GroupID       string `json:"group_id"`
	CreatedAt     string `json:created_at`
	Comments      []Comment
}
type Comment struct {
	ID        string `json:"id`
	PostID    string `json:"PostID"`
	Comment   string `json:"content"`
	UserID    string `json:"user_id"`
	Username  string
	Date      string `json:"date"`
	CreatedAt string `json:created_at`
}
type User struct {
	ID		  string `json:"id"`
	Email	  string `json:"email"`
	Password  string `json:"password"`
	FirstN	  string `json:"first_name"`
	LastN	  string `json:"last_name"`
	Date	  string `json:"date_of_birth"`
	Avatar    string `json:"avatar"`
	Nickname  string `json:"nickname"`
	Aboutme   string `json:"about_me"`
	IsPublic  string `json:"is_public"` 
}