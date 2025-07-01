package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network-backend/internal/models"
	CoreModels "social-network-backend/internal/models/app"
	"strconv"
)

func CreateGroup(app * CoreModels.App)http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request) {

		var group *models.Group
		if CrosAllow(w,r){
			return
		}
		
	// Only process POST requests
	if r.Method != "POST" {
		sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return 
	}

	err := json.NewDecoder(r.Body).Decode(&group)
	if err != nil {
		sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return 
	}

	
	var id int
	id ,err = app.Users.GetUserIDFromSession(w,r);
	if err!=nil{
		sendErrorResponse(w, fmt.Sprintf("Invalid id data: %v", err), http.StatusBadRequest)
		return 
	}
	group.Creator = strconv.Itoa(id)

	err = app.Groups.CreateGroup(group)

	if err!=nil{
		sendErrorResponse(w, fmt.Sprintf("Failed to create Group: %v", err), http.StatusBadRequest)
		return 
	}
	}
}

func FetchAllGroups(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}

		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		groups, err := app.Groups.GetAllGroups()
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to fetch groups: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(groups)
	}
}

func SendGroupMessage(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}

		if r.Method != "POST" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var requestData struct {
			GroupID string `json:"group_id"`
			Content string `json:"content"`
		}

		err := json.NewDecoder(r.Body).Decode(&requestData)
		if err != nil {
			sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		// Get user ID from session
		userID, err := app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Invalid session: %v", err), http.StatusUnauthorized)
			return
		}

		err = app.Groups.CreateGroupMessage(requestData.GroupID, strconv.Itoa(userID), requestData.Content)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to send message: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	}
}

func GetGroupMessages(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}

		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		groupID := r.URL.Query().Get("group_id")
		if groupID == "" {
			sendErrorResponse(w, "Group ID is required", http.StatusBadRequest)
			return
		}

		messages, err := app.Groups.GetGroupMessages(groupID)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to fetch messages: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"messages": messages,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}