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