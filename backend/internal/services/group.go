package services

import (
	"database/sql"
	"social-network-backend/internal/models"
)

type GroupModel struct {
	DB *sql.DB
}

func (g *GroupModel) CreateGroup(group *models.Group) (int,error) {

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
		return 0,err
	}
	group_id, err := result.LastInsertId()
	if err != nil {
		return 0,err
	}
	//Add the group creator as a member
	stmt3:=`INSERT INTO group_members (
				group_id,
				user_id,
				request_status_id,
				invited_by
			) VALUES (?, ?, ?, ?)`
	_,err= g.DB.Exec(stmt3,group_id,group.Creator,5,group.Creator)
	
		for i:=0;i<len(group.InvitedUsers);i++{
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
			return 0,err
		}
	}

	return int(group_id),nil

}

func (g *GroupModel) GetAllGroups(id int) ([]map[string]interface{}, error) {
	stmt := `
	SELECT 
    g.id,
    g.title,
    g.description,
    CASE
        WHEN (gm.user_id IS NOT NULL AND gm.user_id = ?) OR g.creator_id = ? THEN true
        ELSE false
    END AS is_member,
    g.creator_id,
    g.created_at,
    gm.request_status_id
FROM groups g
LEFT JOIN group_members gm 
    ON gm.group_id = g.id AND gm.user_id = ?
ORDER BY g.created_at DESC


	`
	
	rows, err := g.DB.Query(stmt,id,id,id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []map[string]interface{}
	for rows.Next() {
		var id, title, description, creatorID, createdAt  string
		var request_status_id sql.NullString 
		var isMember bool
		err := rows.Scan(&id, &title, &description,&isMember, &creatorID, &createdAt,&request_status_id)
		if err != nil {
			return nil, err
		}

		var statusID string
		if request_status_id.Valid {
			statusID = request_status_id.String
		} else {
			statusID = ""  // or "0" or whatever default
		}
		
		group := map[string]interface{}{
			"id":          id,
			"title":       title,
			"description": description,
			"creator_id":  creatorID,
			"created_at":  createdAt,
			"isMember":isMember,
			"request_status_id":statusID,
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
