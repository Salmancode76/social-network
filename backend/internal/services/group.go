package services

import (
	"database/sql"
	"social-network-backend/internal/models"
)

type GroupModel struct {
	DB *sql.DB
}
func (g*GroupModel) CreateGroup(group * models.Group)(error){

	stmt:=`
	
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
	result, err := g.DB.Exec(stmt,group.Title,group.Description,group.Creator)
	if err != nil {
		return err
	}
	group_id, err := result.LastInsertId()
	if err != nil {
		return err
	}
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
		if err != nil{
			return err
		}
		}
	
		return nil
	
}