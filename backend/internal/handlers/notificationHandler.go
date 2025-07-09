package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network-backend/internal/models"
	CoreModels "social-network-backend/internal/models/app"
)

func GetAllNotifications(app *CoreModels.App) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w,r){
			return
		}
		
		// Only process GET requests
		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return 
		}
		var id int
		id ,err := app.Users.GetUserIDFromSession(w,r);
		if err!=nil{
			sendErrorResponse(w, fmt.Sprintf("Invalid id data: %v", err), http.StatusBadRequest)
			return 
		}

		var Notifications []models.Notification

		Notifications,err = app.Notifications.GetAllNotifications(id)
	
		response:= map[string]interface{}{
			"Notifications": Notifications,
		}

		if err := json.NewEncoder(w).Encode(response); err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to encode Json: %v", err), http.StatusInternalServerError)
			return

		}

		}
	
	}

	func ManageRequestGroups(app *CoreModels.App)http.HandlerFunc{
		return func(w http.ResponseWriter, r *http.Request) {
			if CrosAllow(w,r){
				return
			}
			
			// Only process GET requests
			if r.Method != "POST" {
				sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
				return 
			}
			var request models.Request
			err := json.NewDecoder(r.Body).Decode(&request)
			if err != nil {
				sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
				return 
			}

			err=app.Notifications.ManageRequest(request.NotificationID,request.RelatedGroupID,request.RelatedUserID,request.Accepted)

			if err != nil {
				sendErrorResponse(w, "Failed to handle request: " + err.Error(), http.StatusBadRequest)
				return 
			}
		}
	}

	func ManageInvitestGroups(app *CoreModels.App)http.HandlerFunc{
		return func(w http.ResponseWriter, r *http.Request) {
			if CrosAllow(w,r){
				return
			}
			
			// Only process POST requests
			if r.Method != "POST" {
				sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
				return 
			}
			var request models.Request
			err := json.NewDecoder(r.Body).Decode(&request)
			if err != nil {
				sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
				return 
			}

			err=app.Notifications.ManageInvites(request.NotificationID,request.RelatedGroupID,request.RelatedUserID,request.Accepted)

			if err != nil {
				sendErrorResponse(w, "Failed to handle request: " + err.Error(), http.StatusBadRequest)
				return 
			}
		}
	}

	func MarkNotificationAsRead(app *CoreModels.App)http.HandlerFunc{
		return func(w http.ResponseWriter, r *http.Request) {
			if CrosAllow(w,r){
				return
			}
			
			// Only process POST requests
			if r.Method != "POST" {
				sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
				return 
			}

			type MarkReadRequest struct {
				IDs []int `json:"ids"`
			}
			var req MarkReadRequest



			 if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				sendErrorResponse(w, fmt.Sprintf("Failed to encode Json: %v", err), http.StatusInternalServerError)
				return
	
			}

			err:=app.Notifications.MarkNotificationAsRead(req.IDs)

			if err != nil {
				sendErrorResponse(w, "Failed to handle set Read: " + err.Error(), http.StatusBadRequest)
				return 
			}
		}
	}
