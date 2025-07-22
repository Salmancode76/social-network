package services

import (
	"database/sql"
	"social-network-backend/internal/models"
)

type PostModel struct {
	DB *sql.DB
}

func (p *PostModel) FetchAllPosts(id int)([]models.Post,error){

	//getting all public posts along with all private posts and following posts
stmt := `
	SELECT 
		p.id,
		p.user_id,
		p.content,
		p.image_path,
		p.privacy_type_id,
		p.created_at,
		u.nickname,
		u.first_name || ' ' || u.last_name AS fullname,
		u.avatar
	FROM 
		posts p
	JOIN 
		users u ON u.id = p.user_id
	WHERE 
		( (p.privacy_type_id = 1)
		OR (p.user_id = (?))
		OR (p.id IN (
			SELECT post_id 
			FROM post_privacy 
			WHERE user_id = (?)
		))
                  OR (p.privacy_type_id=2 AND
                  p.user_id in (select f.following_id from followers f where f.follower_id = (?)  AND f.request_status_id =2) ))
		AND p.group_id IS NULL;
`

	var Posts []models.Post
	//fmt.Print(id)
	row,err := p.DB.Query(stmt,id,id,id)

	if err != nil {
	  return  Posts,err
  }

  for row.Next(){
	var Post models.Post
	 err:= row.Scan(&Post.ID,&Post.UserID,&Post.Content,&Post.ImageFile,&Post.PrivacyTypeID,&Post.CreatedAt,&Post.UserNickname,&Post.UserFullname,&Post.UserImage)
		if err!=nil{
			return Posts,err
		}
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
	

	result, err := p.DB.Exec(stmt, &Post.UserID, &Post.Content, &Post.ImageFile, &Post.PrivacyTypeID, nil)
	if err != nil {
		return err
	}
	postID, err := result.LastInsertId()
	if err != nil {
		return err
	}
	if err!=nil{
		return err
	}


	if(Post.PrivacyTypeID == "3" && len(Post.VisibleTo)>0 ){
		//fmt.Print(Post.PrivacyTypeID)

		stmt2:=`
			INSERT INTO post_privacy (
				post_id,
				user_id
			)
			VALUES (?, ?)

		` 
		//fmt.Print(Post.VisibleTo)
		for i:=0;i<len(Post.VisibleTo);i++{
			_, err := p.DB.Exec(stmt2, postID, Post.VisibleTo[i])
			if err!=nil{
				return err
			}
		}
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
                         content,
						 image_path
                     )
                     VALUES (
                         ?,
                          ?,
                           ?,
						    ?);
`

	_,err := p.DB.Exec(stmt,Comment.UserID,Comment.PostID,Comment.Comment,Comment.ImageFile)

	if err!=nil{
		return  err
	}
	return nil
}
func(p*PostModel)FetchPostComments(id string)([]models.Comment,error){
	var Comments [] models.Comment
	stmt:=`
	
		select 
		c.id,
		c.user_id,
		c.post_id,
		c.content,
		c.image_path,
		c.created_at,
		u.nickname,
		u.first_name || ' ' || u.last_name AS fullname,
		u.avatar
		from comments c
		JOIN users u ON c.user_id= u.id
		where c.post_id = (?);
	
	`

	rows,err:= p.DB.Query(stmt,id)

	if err!=nil{
		return Comments,err
	}

	for rows.Next(){
		var comment models.Comment
		rows.Scan(&comment.ID, &comment.UserID, &comment.PostID, &comment.Comment,&comment.ImageFile, &comment.CreatedAt,&comment.UserNickname,&comment.UserFullname,&comment.UserImage)
		
	
		
		//fmt.Println(comment.UserNickname)
		Comments = append(Comments, comment)
	}
	return Comments,nil
}


func (p *PostModel)FetchPostsByUserID (userid string)([]models.Post,error){
	var Posts []models.Post
	stmt:=`SELECT
		 id,
       user_id,
       content,
       image_path,
       privacy_type_id,
       group_id,
       created_at
  FROM posts
  where user_id =(?);
`

	row, err := p.DB.Query(stmt,userid)

	if err != nil {
	  return  Posts,err
  }

  for row.Next(){
	var Post models.Post
	var GroupID sql.NullString
	 err:= row.Scan(&Post.ID,&Post.UserID,&Post.Content,&Post.ImageFile,&Post.PrivacyTypeID,&GroupID,&Post.CreatedAt)
		if err!=nil{
			return Posts,err
		}
		if GroupID.Valid{
			Post.GroupID = GroupID.String
		}
	 Posts = append(Posts, Post)
  }

 



  return Posts,nil
}