package handlers

import (
	"database/sql"
	"encoding/json"
	// "fmt"
	"net/http"
	"social-network-backend/internal/models"
	CoreModels "social-network-backend/internal/models/app"
)

func FollowHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.FollowRequest

		if CrosAllow(w, r) {
			return
		}
		
		if r.Method != "POST" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			sendErrorResponse(w, "Invalid request", http.StatusBadRequest)
			return
		}
		statusID := 3
		if req.IsPublic == "1" {
			statusID = 2
		}

		err = app.Follow.MakeFollow(req , statusID)
		if err != nil {
			http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}

func FollowStatusHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if CrosAllow(w, r) {
			return
		}
		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		followerID := r.URL.Query().Get("follower_id")
		followingID := r.URL.Query().Get("following_id")

		 statusID , err := app.Follow.StatusFollow(followerID , followingID) 
		 
		 
		 response := map[string]string{
		"status": "none",
		}
		if err == sql.ErrNoRows {
			//nothing
		}else if err != nil{
			http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
			return
		}else{
			switch statusID {
		case 2:
			response["status"] = "accepted"
		case 3:
			response["status"] = "requested"
		case 4:
			response["status"] = "declined"
		}
		}

		json.NewEncoder(w).Encode(response)
		

	}
}


func GetFollowersHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if CrosAllow(w, r) {
			return
		}

		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		userID := r.URL.Query().Get("user_id")

		Users , err := app.Follow.GetFollowers(userID)
		if err != nil {
			http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"Users": Users,
		})

	}
}


func GetFollowingHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if CrosAllow(w, r) {
			return
		}

		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		userID := r.URL.Query().Get("user_id")

		Users , err := app.Follow.GetFollowing(userID)
		if err != nil {
			http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
   			 "Users": Users,
})

	}
}

func UnfollowHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}

		if r.Method != "DELETE" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req models.FollowRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			sendErrorResponse(w, "Invalid request", http.StatusBadRequest)
			return
		}
		

		err = app.Follow.DeleteFollow(req.FollowerID, req.FollowingID)
		if err != nil {
			http.Error(w, "Failed to unfollow: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func AcceptFollowRequestHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
	var req models.FollowRequest

		if CrosAllow(w, r) {
			return
		}
		
		if r.Method != "POST" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

	err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			sendErrorResponse(w, "Invalid request", http.StatusBadRequest)
			return
		}

		err = app.Follow.AcceptFollow(req.FollowerID, req.FollowingID , req.StatusID)
		if err != nil {
			http.Error(w, "Failed to Accpet Or Decline the Request: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	
	
	}
}