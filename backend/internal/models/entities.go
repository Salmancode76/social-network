package models

type Post struct {
	ID        int    `json:"id`
	UserID    int    `json:"user_id"`
	Content   string `json:"content"`
	ImageFile string `json:"image_file"`

	PrivacyTypeID int    `json:"privacy_type_id"`
	GroupID       *int   `json:"group_id"`
	CreatedAt     string `json:created_at`
}