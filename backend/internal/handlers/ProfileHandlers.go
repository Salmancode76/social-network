package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network-backend/internal/models"
	CoreModels "social-network-backend/internal/models/app"

)

func UserDataHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var User *models.User

		if CrosAllow(w, r) {
			return
		}

		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		id:= r.URL.Query().Get("id")
		User, err := app.Users.FetchUserByID(id)

		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to fetch users: %v", err), http.StatusInternalServerError)
			return
		}
		response := map[string]interface{}{
			"User": User,
		}
		 json.NewEncoder(w).Encode(response)
			

	}
}

func FetchPostsByUserID(app * CoreModels.App) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
	var Posts []models.Post

	if CrosAllow(w,r){
			return
		}
			// Only allow GET requests
			if r.Method != "GET" {
				sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
				return
			}
			
	

		Userid:= r.URL.Query().Get("Userid")


		Posts,err:=app.Posts.FetchPostsByUserID(Userid)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Post not found: %v", err), http.StatusNotFound)

			return
		}

		response:= map[string]interface{}{
			"Posts": Posts,
		}
		
		json.NewEncoder(w).Encode(response)
	}
}
func UpdateProfile(app *CoreModels.App) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
		var User models.User
		if CrosAllow(w,r){
			return
		}

		if r.Method != "POST" {
				sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
				return
			}
		err := json.NewDecoder(r.Body).Decode(&User)
		if err != nil {
			sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		err = app.Users.UpdateUserByData(User)
			if err != nil {
				sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
				return
			}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Profile updated successfully",
		})

	}
}