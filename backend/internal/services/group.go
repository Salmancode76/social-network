package services

import (
	"database/sql"
	"fmt"
	"social-network-backend/internal/models"
)

type GroupModel struct {
	DB *sql.DB
}

func (g *GroupModel) CreateGroup(group *models.Group) (int, error) {

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
		return 0, err
	}
	group_id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	//Add the group creator as a member
	stmt3 := `INSERT INTO group_members (
				group_id,
				user_id,
				request_status_id,
				invited_by
			) VALUES (?, ?, ?, ?)`
	_, err = g.DB.Exec(stmt3, group_id, group.Creator, 5, group.Creator)

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
			return 0, err
		}
	}

	return int(group_id), nil

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

	rows, err := g.DB.Query(stmt, id, id, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []map[string]interface{}
	for rows.Next() {
		var id, title, description, creatorID, createdAt string
		var request_status_id sql.NullString
		var isMember bool
		err := rows.Scan(&id, &title, &description, &isMember, &creatorID, &createdAt, &request_status_id)
		if err != nil {
			return nil, err
		}

		var statusID string
		if request_status_id.Valid {
			statusID = request_status_id.String
		} else {
			statusID = "" // or "0" or whatever default
		}

		group := map[string]interface{}{
			"id":                id,
			"title":             title,
			"description":       description,
			"creator_id":        creatorID,
			"created_at":        createdAt,
			"isMember":          isMember,
			"request_status_id": statusID,
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

func (g *GroupModel) CreateEvent(event models.Event) error {
	stmt := `
		INSERT INTO events (
			group_id,
			creator_id,
			title,
			description,
			event_datetime
		) VALUES (?, ?, ?, ?, ?)
	`
	_, err := g.DB.Exec(stmt,
		event.GroupID,
		event.CreatorID,
		event.Title,
		event.Description,
		event.EventDatetime,
	)

	return err
}

func (g *GroupModel) GetEventsByGroupID(groupID int) ([]models.Event, error) {
	stmt := `
		SELECT 
			id,
			group_id,
			creator_id,
			title,
			description,
			event_datetime,
			created_at
		FROM events
		WHERE group_id = ?
		ORDER BY event_datetime ASC
	`

	rows, err := g.DB.Query(stmt, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var e models.Event
		err := rows.Scan(
			&e.ID,
			&e.GroupID,
			&e.CreatorID,
			&e.Title,
			&e.Description,
			&e.EventDatetime,
			&e.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, e)
	}

	return events, nil
}

func (gm *GroupModel) GetResponseForUser(eventID, userID int) (string, error) {
	var isGoing sql.NullInt64
	query := `SELECT is_going FROM event_responses WHERE event_id = ? AND user_id = ? LIMIT 1`
	err := gm.DB.QueryRow(query, eventID, userID).Scan(&isGoing)
	if err != nil {
		return "", err
	}

	if !isGoing.Valid {
		return "", nil
	}
	return fmt.Sprintf("%d", isGoing.Int64), nil // returns "1" or "0"
}

func (g *GroupModel) SaveEventResponse(eventID, userID, isGoing int) error {
	stmt := `
	INSERT INTO event_responses (event_id, user_id, is_going, created_at)
	VALUES (?, ?, ?, datetime('now'))
	ON CONFLICT(event_id, user_id)
	DO UPDATE SET is_going = excluded.is_going, created_at = excluded.created_at;
	`
	_, err := g.DB.Exec(stmt, eventID, userID, isGoing)
	return err
}

func (g *GroupModel) GetResponseCounts(eventID int) (map[string]int, error) {
	rows, err := g.DB.Query(`
		SELECT 
			CASE WHEN is_going = 1 THEN 'Going' ELSE 'Not Going' END as choice,
			COUNT(*) 
		FROM event_responses
		WHERE event_id = ?
		GROUP BY choice
	`, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := map[string]int{}
	for rows.Next() {
		var choice string
		var count int
		if err := rows.Scan(&choice, &count); err != nil {
			return nil, err
		}
		result[choice] = count
	}
	return result, nil
}

func (g *GroupModel) CreateGroupPost(post *models.GroupPost) error {
	stmt := `
		INSERT INTO posts (user_id, content, image_path, group_id, created_at)
		VALUES (?, ?, ?, ?, datetime('now'))
	`
	result, err := g.DB.Exec(stmt, post.UserID, post.Content, post.ImagePath, post.GroupID)
	if err != nil {
		return err
	}

	lastID, err := result.LastInsertId()
	if err != nil {
		return err
	}

	post.ID = int(lastID)
	// Fetch the timestamp from DB after insert
	row := g.DB.QueryRow(`SELECT created_at FROM posts WHERE id = ?`, post.ID)
	err = row.Scan(&post.CreatedAt)
	if err != nil {
		return err
	}
	return nil
}

func (g *GroupModel) GetPostsByGroupID(groupID int) ([]models.GroupPost, error) {
	stmt := `
		SELECT id, user_id, content, image_path, group_id, created_at
		FROM posts
		WHERE group_id = ?
		ORDER BY created_at DESC
	`

	rows, err := g.DB.Query(stmt, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.GroupPost
	for rows.Next() {
		var post models.GroupPost
		err := rows.Scan(&post.ID, &post.UserID, &post.Content, &post.ImagePath, &post.GroupID, &post.CreatedAt)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}
