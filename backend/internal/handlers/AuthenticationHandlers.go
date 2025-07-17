package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
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
				"status":  "401",
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

		user.Avatar, err = DownloadImageAvatar(user.Avatar)

		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Invalid image data: %v", err), http.StatusBadRequest)

		}

		responseData := map[string]interface{}{
			"status":  "ok",
			"message": "Register successful",
		}
		user.Password = string(hashedPassword)
		app.Users.Register(*user)
		user1, err := app.Users.GetUserByEmail(user.Email)

		app.Users.CreateSession(w, user1.ID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(responseData)

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

		Check_user, err := app.Users.GetUserByEmail(user.Email)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			responseData := map[string]interface{}{
				"status":  "401",
				"message": "Email or Password is Uncorrect",
			}
			json.NewEncoder(w).Encode(responseData)
			return
		}
		if bcrypt.CompareHashAndPassword([]byte(Check_user.Password), []byte(user.Password)) != nil {
			w.Header().Set("Content-Type", "application/json")
			responseData := map[string]interface{}{
				"status":  "401",
				"message": "Email or Password is Uncorrect",
			}
			json.NewEncoder(w).Encode(responseData)
			return
		}

		responseData := map[string]interface{}{
			"status":  "ok",
			"message": "Login successful",
		}
		app.Users.CreateSession(w, Check_user.ID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(responseData)

	}
}

func FetchAllUsersHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}
		// Only allow GET requests
		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var Users []models.User

		id, err := app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to fetch users: %v", err), http.StatusInternalServerError)
			return
		}

		Users, err = app.Users.FetchAllUsers(id)

		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to fetch users: %v", err), http.StatusInternalServerError)
			return
		}
		response := map[string]interface{}{
			"Users": Users,
		}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to encode Json: %v", err), http.StatusInternalServerError)
			return

		}
	}
}

func LogoutHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if CrosAllow(w, r) {
			return
		}

		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var sessionID string
		if cookie, err := r.Cookie("session_id"); err == nil {
			sessionID = cookie.Value
		}

		if sessionID == "" {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "No active session"})
			return
		}

		if _, err := app.Users.DB.Exec("DELETE FROM sessions WHERE session_id = ?", sessionID); err != nil {
			log.Printf("Error deleting session: %v", err)
		}

		expiration := time.Now().Add(-24 * time.Hour)
		cookie := &http.Cookie{
			Name:     "session_id",
			Value:    "",
			Path:     "/",
			Domain:   "localhost",
			Expires:  expiration,
			MaxAge:   -1,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			Secure:   false,
		}
		http.SetCookie(w, cookie)

		w.Header().Add("Set-Cookie", cookie.String()+"; SameSite=Lax")
		w.Header().Add("Clear-Site-Data", "\"cookies\"")

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": "Logged out successfully",
		})
	}
}

func CheckSessionHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if CrosAllow(w, r) {
			return
		}
		userID, err := app.Users.GetUserIDFromSession(w, r)
		if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"authenticated": false,
			})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": true,
			"userID":        userID,
		})
	}
}

func DownloadImageAvatar(ImageFile string) (string, error) {

	var fileName string
	if ImageFile == "" {
		return fileName, nil // if there's no image, skip
	}
	filetype := "." + strings.Split((strings.Split((strings.Split(ImageFile, ",")[0]), ";")[0]), "/")[1]

	data, err := base64.StdEncoding.DecodeString(strings.Split(ImageFile, ",")[1])

	if err != nil {
		return fileName, err
	}

	imageDir := filepath.Join("..", "Image", "Users")
	files, _ := ioutil.ReadDir(imageDir)
	id := len(files) + 1
	//Image ID + User ID + Time + format
	fileName = strconv.Itoa(id) + "_" + "1" + "_" + time.Now().Format("20060102_150405") + filetype

	ImageFile = fileName

	imagePath := filepath.Join(imageDir, fileName)
	os.WriteFile(imagePath, data, 0644)

	return fileName, nil

}
func GetuserIDHandler(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if CrosAllow(w, r) {
			return
		}
		userID, _ := app.Users.GetUserIDFromSession(w, r)

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"UserID": strconv.Itoa(userID),
		})
	}
}

func SearchUsers(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}

		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		query := r.URL.Query().Get("query")
		if query == "" {
			sendErrorResponse(w, "Query parameter is required", http.StatusBadRequest)
			return
		}

		users, err := app.Users.SearchUsers(query)
		if err != nil {
			sendErrorResponse(w, "Failed to search users", http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"status": "ok",
			"users":  users,
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
		
	}
}
