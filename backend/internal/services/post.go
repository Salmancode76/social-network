package services

import (
	"database/sql"
	"fmt"
	"log"
	"social-network-backend/internal/models"
)

type PostModel struct {
	DB *sql.DB
}

func (p *PostModel) FetchAllPosts()([]models.Post,error){
	stmt:= "select * from posts"

	var Posts []models.Post
	
	row,err := p.DB.Query(stmt)

	if err != nil {
	  return  Posts,fmt.Errorf("failed to fetch all post: %w", err)
  }

  for row.Next(){
	var Post models.Post
	row.Scan(&Post.ID,&Post.UserID,&Post.Content,&Post.ImageFile,&Post.PrivacyTypeID,&Post.GroupID,&Post.CreatedAt)

	Posts = append(Posts, Post)
  }

  return Posts,nil

}

func (p* PostModel) InsertPost(Post models.Post) (error){

	stmt:=`
	
	INSERT INTO posts (
                      user_id,
                      content,
                      image_path,
                      privacy_type_id,
                      group_id
                  )
                   VALUES (?, ?, ?, ?, ?)  

`
	_,err := p.DB.Exec(stmt,Post.UserID,Post.Content,Post.ImageFile,Post.PrivacyTypeID,Post.GroupID)

	if err!=nil{
		log.Fatal("Failed to insert post:" , err.Error())
	}



	return nil
}