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
	result, err = n.DB.Exec(stmt2, group_id, sender_id, 3)
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

func (n*NotificationModel)ManageRequest(id int,group_id int,user_id int,accept bool)(error){


	
		if accept{
			stmt:=`
			UPDATE group_members
		SET request_status_id = ?
		WHERE group_id = ? AND user_id = ?;
       
		`
			_,err:=n.DB.Exec(stmt,2,group_id,user_id)
			if err!=nil{
				return err
			}
		}else{
			stmt:=`
		DELETE FROM group_members
      WHERE group_id = (?) AND 
            user_id =(?);
		   
			`
				_,err:=n.DB.Exec(stmt,group_id,user_id)
				if err!=nil{
					return err
				}
		}

		stmt:=`
		DELETE FROM notifications
      WHERE id = (?);
		`
		_,err := n.DB.Exec(stmt,id)
		
		if err!=nil{
			return err
		}
		
		return nil


}

func (n*NotificationModel)SendInvites( sender_id int,id  []string,group_id int)(error){
	
	stmt:=`

		INSERT INTO notifications (
		user_id,
		notification_type_id,
		message,
		related_user_id,
		related_group_id
	)
	VALUES (?, ?, ?, ?, ?);
`

	for i:=0;i<len(id);i++{
		_,err := n.DB.Exec(stmt,sender_id,2,"Invite to group",id[i],group_id)
			
		if err!=nil{
			return err
		}
	}
	
	return nil


}


func (n*NotificationModel)ManageInvites(id int,group_id int,user_id int,accept bool)(error){


	
	if accept{
		stmt:=`
		UPDATE group_members
	SET request_status_id = ?
	WHERE group_id = ? AND user_id = ?;
   
	`
		_,err:=n.DB.Exec(stmt,2,group_id,user_id)
		if err!=nil{
			return err
		}
	}else{
		stmt:=`
	DELETE FROM group_members
  WHERE group_id = (?) AND 
		user_id =(?);
	   
		`
			_,err:=n.DB.Exec(stmt,group_id,user_id)
			if err!=nil{
				return err
			}
	}

	stmt:=`
	DELETE FROM notifications
  WHERE id = (?);
	`
	_,err := n.DB.Exec(stmt,id)
	
	if err!=nil{
		return err
	}
	
	return nil


}

func (n *NotificationModel) MarkNotificationAsRead(ids []int) error {
	for i:=0;i<len(ids);i++ {
		stmt := `UPDATE notifications SET is_read = 1 WHERE id = ?`
		if _, err := n.DB.Exec(stmt, ids[i]); err != nil {
			return err
		}
	}
	return nil
}


func (n*NotificationModel)SendInvitesInGroup( sender_id int,id  []string,group_id int)(error){
	
	stmt:=`

		INSERT INTO notifications (
		user_id,
		notification_type_id,
		message,
		related_user_id,
		related_group_id
	)
	VALUES (?, ?, ?, ?, ?);
`

	for i:=0;i<len(id);i++{
		_,err := n.DB.Exec(stmt,sender_id,2,"Invite to group",id[i],group_id)
			
		if err!=nil{
			return err
		}
	}
	

	for i := 0; i < len(id); i++ {
		_, err := n.DB.Exec(`
			INSERT INTO group_members (
				group_id,
				user_id,
				request_status_id,
				invited_by
			) VALUES (?, ?, ?, ?)`,
			group_id,
			id[i],
			1,
			sender_id,
		)

		if err != nil {
			return  err
		}
	}
	return nil


}