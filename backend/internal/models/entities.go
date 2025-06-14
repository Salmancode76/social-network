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
