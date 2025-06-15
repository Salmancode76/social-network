package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network-backend/internal/models"
	CoreModels "social-network-backend/internal/models/app"

	"golang.org/x/crypto/bcrypt"
)

func RegisterHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var user *models.User

		if CrosAllow(w, r) {
			return
		}
		if r.Method != "POST" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Println("Error hashing password:", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		user.Password = string(hashedPassword)
		app.Users.Register(*user)
		
	}
}
