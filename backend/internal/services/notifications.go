package services

import (
	"database/sql"
	"fmt"
	"social-network-backend/internal/models"
)

type NotificationModel struct {
	DB *sql.DB
}

func (n *NotificationModel) SendRequestToJoinGroup(group_id int, sender_id int) error {
    stmt := `
    INSERT INTO notifications (
        user_id,
        notification_type_id,
        related_user_id,
        related_group_id,
        related_event_id,
        is_read,
        message
    )
    SELECT
        ?, ?, g.creator_id, g.id, NULL, FALSE, ?
    FROM groups g
    WHERE g.id = ?
    `
    result, err := n.DB.Exec(stmt, sender_id, 3, "Request to join group", group_id, group_id)
    if err != nil {
        return fmt.Errorf("failed to insert notification: %w", err)
    }
    rows, _ := result.RowsAffected()
	
    if rows == 0 {
        return fmt.Errorf("no notification inserted (group may not exist)")
    }

	stmt2:=`
INSERT INTO group_members (
    group_id,
    user_id,
    request_status_id
)
VALUES (
    ?, ?, ?
);	
	`
	result, err = n.DB.Exec(stmt2, group_id, sender_id, 4)
    if err != nil {
        return fmt.Errorf("failed to insert notification: %w", err)
    }
    rows, _ = result.RowsAffected()
	
    if rows == 0 {
        return fmt.Errorf("no notification inserted (group may not exist)")
    }


    return nil
}

func (n *NotificationModel) GetAllNotifications(id int) ([]models.Notification, error) {
	var notifications []models.Notification

	stmt := `
	SELECT n.id,
		n.user_id,
	u.first_name || ' ' || u.last_name AS sender_full_name,
                 g.title,
		n.notification_type_id,
		n.message,
		n.related_user_id,
		n.related_group_id,
		n.related_event_id,
		n.is_read,
		n.created_at
	FROM notifications n
         JOIN users u on
         u.id = n.user_id
         JOIN groups g on
         g.id = n.related_group_id
	WHERE n.related_user_id = (?);
	`

	rows, err := n.DB.Query(stmt, id)
	if err != nil {
		return notifications, err
	}
	defer rows.Close()

	for rows.Next() {
		var notification models.Notification
		err := rows.Scan(
			&notification.ID,
			&notification.UserID,
			&notification.UserFullName,
			&notification.GroupTitle,
			&notification.NotificationTypeID,
			&notification.Message,  
			&notification.RelatedUserID,
			&notification.RelatedGroupID,
			&notification.RelatedEventID,
			&notification.IsRead,
			&notification.CreatedAt,
		)
		
		if err != nil {
			return notifications, err
		}
		notifications = append(notifications, notification)
	}

	return notifications, nil
}
