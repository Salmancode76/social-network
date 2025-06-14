package services

import (
	"database/sql"
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
	  return  Posts,err
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
_, err := p.DB.Exec(stmt, &Post.UserID, &Post.Content, &Post.ImageFile, &Post.PrivacyTypeID, nil)

	if err!=nil{
		return err
	}



	return nil
}

func (p *PostModel)FetchPostByID (id string)(models.Post,error){
	var Post models.Post
	stmt:=`SELECT id,
       user_id,
       content,
       image_path,
       privacy_type_id,
       group_id,
       created_at
  FROM posts
  where id =(?);
`
	row,err:= p.DB.Query(stmt,id)

	if err!=nil{
		return Post,err
	}
	for row.Next(){
		row.Scan(&Post.ID,&Post.UserID,&Post.Content,&Post.ImageFile,&Post.PrivacyTypeID,&Post.GroupID,&Post.CreatedAt)
	}
	return Post,nil
}

func (p* PostModel)CreateComment(Comment models.Comment)(error){

	stmt:=`
	INSERT INTO comments (
                         user_id,
                         post_id,
                         content
                     )
                     VALUES (
                         ?,
                          ?,
                           ?
						    );
`

	_,err := p.DB.Exec(stmt,Comment.UserID,Comment.PostID,Comment.Comment)

	if err!=nil{
		return  err
	}
	return nil
}
func(p*PostModel)FetchPostComments(id string)([]models.Comment,error){
	var Comments [] models.Comment
	stmt:=`
	
		select 
		id,
       user_id,
       post_id,
       content,
       created_at
		from comments
		where post_id = (?);
	
	`

	rows,err:= p.DB.Query(stmt,id)

	if err!=nil{
		return Comments,err
	}

	for rows.Next(){
		var comment models.Comment
		rows.Scan(&comment.ID, &comment.UserID, &comment.PostID, &comment.Comment, &comment.CreatedAt)
		Comments = append(Comments, comment)
	}
	return Comments,nil
}