package handlers

import (
	"encoding/base64"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"social-network-backend/internal/models"
	CoreModels "social-network-backend/internal/models/app"
	"strconv"
	"strings"

	"time"
)


func CreatePost(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

	var post *models.Post

	if CrosAllow(w,r){
		return
	}

	// Only process POST requests
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return 
	}

	//fmt.Println("Received post:", post.ImageFile)

	//fmt.Println(strings.Split(post.ImageFile, ",")[0])


		//Review the request body and decode the JSON into a Post struct
		err := json.NewDecoder(r.Body).Decode(&post)
		if err != nil {
			log.Println("Error decoding JSON:", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return 
		}

	filetype := "."+strings.Split((strings.Split((  strings.Split(post.ImageFile, ",")[0])  ,";")[0]),"/")[1] 

	data, err := base64.StdEncoding.DecodeString(strings.Split(post.ImageFile, ",")[1])



	if err !=nil{
		log.Println("Error decoding base64 image:", err)
		http.Error(w, "Invalid image data", http.StatusBadRequest)
		return 
	}


	imageDir := filepath.Join("..","Image", "Posts")
	files,_ := ioutil.ReadDir(imageDir)
	id := len(files)+1
	//Image ID + User ID + Time + format
	fileName := strconv.Itoa(id)+"_"+ strconv.Itoa(post.UserID) + "_" + time.Now().Format("20060102_150405") + filetype	

	post.ImageFile = fileName

	//fmt.Println("Data:", post)
	imagePath := filepath.Join(imageDir, fileName)
	os.WriteFile(imagePath, data, 0644)
	
	app.Posts.InsertPost(*post)	
}
}

func FetchAllPosts(app * CoreModels.App) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
	
		if CrosAllow(w,r){
			return
		}

		// Only allow GET requests
		if r.Method != "GET" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var Posts []models.Post
		Posts,err:= app.Posts.FetchAllPosts()

		if err!=nil{
			log.Fatal("Error Fetch Posts: ",Posts)
		}

		//fmt.Println("Posts: ",Posts)

		response:= map[string]interface{}{
			"Posts": Posts,
		}

		json.NewEncoder(w).Encode(response)
		
	}
}