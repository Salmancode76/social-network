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

		 _, err = app.Users.GetUserByEmail(user.Email)
		if err == nil {
			w.Header().Set("Content-Type", "application/json")
			responseData := map[string]interface{}{
				"status" : "401",
				"message": "Email already exist",
			}
			json.NewEncoder(w).Encode(responseData)
			return
		}
		
		 

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Println("Error hashing password:", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		responseData := map[string]interface{}{
			"status" : "ok",
			"message": "Register successful",
		}
		user.Password = string(hashedPassword)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(responseData)
		app.Users.Register(*user)

		
	}
}

func LoginHandler(app *CoreModels.App) http.HandlerFunc {
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

	Check_user , err := app.Users.GetUserByEmail(user.Email)
	if (err != nil) {
		w.Header().Set("Content-Type", "application/json")
			responseData := map[string]interface{}{
				"status" : "401",
				"message": "Email or Password is Uncorrect",
			}
			json.NewEncoder(w).Encode(responseData)
			return
	}
	if err != nil || bcrypt.CompareHashAndPassword([]byte(Check_user.Password), []byte(user.Password)) != nil {
		w.Header().Set("Content-Type", "application/json")
		responseData := map[string]interface{}{
			"status" : "401",
			"message": "Email or Password is Uncorrect",
		}
		json.NewEncoder(w).Encode(responseData)
		return
	}

	responseData := map[string]interface{}{
		"status" : "ok",
		"message": "Login successful",
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(responseData)

}
}