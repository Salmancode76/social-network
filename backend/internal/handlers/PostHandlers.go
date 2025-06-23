package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"social-network-backend/internal/models"
	CoreModels "social-network-backend/internal/models/app"
	"strconv"
	"strings"

	"time"
)

func DownloadImage(ImageFile string) (string,error){

			var fileName string
			if ImageFile == "" {
				return fileName, nil // if there's no image, skip
			}
			filetype := "."+strings.Split((strings.Split((  strings.Split(ImageFile, ",")[0])  ,";")[0]),"/")[1] 
	
			data, err := base64.StdEncoding.DecodeString(strings.Split(ImageFile, ",")[1])
		
		
		
			if err !=nil{
				//sendErrorResponse(w, fmt.Sprintf("Invalid image data: %v", err), http.StatusBadRequest)
				return fileName,err 
			}
		
		
			imageDir := filepath.Join("..","Image", "Posts")
			files,_ := ioutil.ReadDir(imageDir)
			id := len(files)+1
			//Image ID + User ID + Time + format
			fileName = strconv.Itoa(id)+"_"+"1" + "_" + time.Now().Format("20060102_150405") + filetype	
		
			ImageFile = fileName
		
			imagePath := filepath.Join(imageDir, fileName)
			os.WriteFile(imagePath, data, 0644)

			return fileName,nil
			
		

	}

	


func CreatePost(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

	var post *models.Post

	if CrosAllow(w,r){
		return
	}

	// Only process POST requests
	if r.Method != "POST" {
		sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return 
	}

	//Review the request body and decode the JSON into a Post struct
	err := json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return 
	}
	

	var id int
	id ,err = app.Users.GetUserIDFromSession(w,r);
	if err!=nil{
		sendErrorResponse(w, fmt.Sprintf("Invalid image data: %v", err), http.StatusBadRequest)
		return 
	}


	fmt.Println(post.UserID)
	post.ImageFile,err = DownloadImage(post.ImageFile)


	post.UserID = strconv.Itoa(id)

	if err!=nil{
		sendErrorResponse(w, fmt.Sprintf("Invalid image data: %v", err), http.StatusBadRequest)

	}

	fmt.Println("Data:", post)

	app.Posts.InsertPost(*post)	
	//fmt.Print(post.UserID)
}
}

func FetchAllPosts(app * CoreModels.App) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
	
		if CrosAllow(w,r){
			return
		}

		// Only allow GET requests
		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var Posts []models.Post
		Posts,err:= app.Posts.FetchAllPosts()

		if err!=nil{
			sendErrorResponse(w, fmt.Sprintf("Failed to fetch posts: %v", err), http.StatusInternalServerError)
			return
		}

		//fmt.Println("Posts: ",Posts)

		response:= map[string]interface{}{
			"Posts": Posts,
		}

		if err := json.NewEncoder(w).Encode(response); err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to encode Json: %v", err), http.StatusInternalServerError)
			return

		}
		
		
	}
}
func FetchPostByID(app * CoreModels.App) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
		var Post models.Post
		var Comments []models.Comment
		if CrosAllow(w,r){
			return
		}
			// Only allow GET requests
			if r.Method != "GET" {
				sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
				return
			}
			
	

		id:= r.URL.Query().Get("id")

		Post,err:=app.Posts.FetchPostByID(id)
		if Post.ID == "" {
			sendErrorResponse(w, fmt.Sprintf("Post not found: %v", err), http.StatusNotFound)

			return
		}
		
		
		Comments,err= app.Posts.FetchPostComments(id)
		Post.Comments = Comments
		if err!=nil{
			sendErrorResponse(w, fmt.Sprintf("Failed to Fetch the Post: %v", err), http.StatusBadRequest)
			return
		}
		response:= map[string]interface{}{
			"Post": Post,
		}
		
		json.NewEncoder(w).Encode(response)
	}

}

func CreateComment(app * CoreModels.App) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request) {

		var Comment models.Comment
		if CrosAllow(w,r){
			return
		}
			// Only allow POST requests
			if r.Method != "POST" {
				sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
				return
			}
		//id,err:= strconv.Atoi(r.URL.Query().Get("id"))

		/*
		if err!=nil{
			log.Fatal("Failed to parse id to int :",err)
		}
			*/
		err:= json.NewDecoder(r.Body).Decode(&Comment)
		//log.Printf("Decoded comment: %+v", Comment)

		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Invalid request payload: %v", err), http.StatusBadRequest)
			return 
		}

		//fmt.Println(Comment)

		Comment.ImageFile,err = DownloadImage(Comment.ImageFile)
		if err!=nil{
			sendErrorResponse(w, fmt.Sprintf("Invalid image data: %v", err), http.StatusBadRequest)
	
		}
	

		err=app.Posts.CreateComment(Comment)

		
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to create a comment: %v", err), http.StatusBadRequest)
			return
		}
		
	}
}

