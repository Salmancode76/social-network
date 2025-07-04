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