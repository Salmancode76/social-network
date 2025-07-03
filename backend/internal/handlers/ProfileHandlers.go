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

		User, err = app.Users.FetchUserByID(id)

		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to fetch users: %v", err), http.StatusInternalServerError)
			return
		}
		response := map[string]interface{}{
			"Users": User,
		}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to encode Json: %v", err), http.StatusInternalServerError)
			return

		}

	}
}