package services

import (
	"database/sql"
	"social-network-backend/internal/models"
)

type GroupModel struct {
	DB *sql.DB
}

func (g *GroupModel) CreateGroup(group *models.Group) error {

	stmt := `
	
	INSERT INTO groups (
                       title,
                       description,
                       creator_id
                   )
                   VALUES (
                      (?),
                      (?),
                      (?)
                   );	
	
	`
	result, err := g.DB.Exec(stmt, group.Title, group.Description, group.Creator)
	if err != nil {
		return err
	}
	group_id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	for i := 0; i < len(group.InvitedUsers); i++ {
		_, err := g.DB.Exec(`
			INSERT INTO group_members (
				group_id,
				user_id,
				request_status_id,
				invited_by
			) VALUES (?, ?, ?, ?)`,
			group_id,
			group.InvitedUsers[i],
			1,
			group.Creator,
		)
		if err != nil {
			return err
		}
	}

	return nil

}

func (g *GroupModel) GetAllGroups() ([]map[string]interface{}, error) {
	stmt := `
    SELECT 
        g.id,
        g.title,
        g.description,
        g.creator_id,
        u.first_name || ' ' || u.last_name AS creator_name,
        g.created_at
    FROM groups g
    JOIN users u ON g.creator_id = u.id
    ORDER BY g.created_at DESC
`

	rows, err := g.DB.Query(stmt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []map[string]interface{}
	for rows.Next() {
		var id, title, description, creatorID, creatorName, createdAt string
		err := rows.Scan(&id, &title, &description, &creatorID,  &creatorName, &createdAt)
		if err != nil {
			return nil, err
		}

		group := map[string]interface{}{
			"id":           id,
			"title":        title,
			"description":  description,
			"creator_id":   creatorID,
			"creator_name": creatorName, 
			"created_at": createdAt,
		}
		groups = append(groups, group)
	}

	return groups, nil
}

func (g *GroupModel) CreateGroupMessage(groupID, senderID, content string) error {
	tx, err := g.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert into messages table first
	messageStmt := `
		INSERT INTO messages (sender_id, content, message_type)
		VALUES (?, ?, 'text')
	`
	result, err := tx.Exec(messageStmt, senderID, content)
	if err != nil {
		return err
	}

	messageID, err := result.LastInsertId()
	if err != nil {
		return err
	}

	// Insert into group_messages table
	groupMessageStmt := `
		INSERT INTO group_messages (message_id, group_id)
		VALUES (?, ?)
	`
	_, err = tx.Exec(groupMessageStmt, messageID, groupID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (g *GroupModel) GetGroupMessages(groupID string) ([]map[string]interface{}, error) {
	stmt := `
		SELECT 
			m.id,
			m.content,
			m.created_at,
			u.first_name || ' ' || u.last_name AS user_name,
			u.id as user_id
		FROM messages m
		JOIN group_messages gm ON m.id = gm.message_id
		JOIN users u ON m.sender_id = u.id
		WHERE gm.group_id = ?
		ORDER BY m.created_at ASC
	`

	rows, err := g.DB.Query(stmt, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []map[string]interface{}
	for rows.Next() {
		var id, content, createdAt, userName, userID string
		err := rows.Scan(&id, &content, &createdAt, &userName, &userID)
		if err != nil {
			return nil, err
		}

		message := map[string]interface{}{
			"id":         id,
			"content":    content,
			"created_at": createdAt,
			"user_name":  userName,
			"user_id":    userID,
		}
		messages = append(messages, message)
	}

	return messages, nil
}
