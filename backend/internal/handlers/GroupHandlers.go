package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"social-network-backend/internal/models"
	CoreModels "social-network-backend/internal/models/app"
	"strconv"
	"strings"
	"time"
)

func CreateGroup(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var group *models.Group
		if CrosAllow(w, r) {
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
		id, err = app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Invalid id data: %v", err), http.StatusBadRequest)
			return
		}
		group.Creator = strconv.Itoa(id)

		group_id, err := app.Groups.CreateGroup(group)

		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to create Group: %v", err), http.StatusBadRequest)
			return
		}

		err = app.Notifications.SendInvites(id, group.InvitedUsers, group_id)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to create Group invite notifications: %v", err), http.StatusBadRequest)
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
		id, err := app.Users.GetUserIDFromSession(w, r)

		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to fetch posts: %v", err), http.StatusInternalServerError)
			return
		}

		groups, err := app.Groups.GetAllGroups(id)
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

func SendRequestToJoin(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}

		if r.Method != "POST" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var id int
		id, err := app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Invalid id data: %v", err), http.StatusBadRequest)
			return
		}
		group_id, err := strconv.Atoi(r.URL.Query().Get("id"))

		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Invalid id data: %v", err), http.StatusBadRequest)
			return
		}

		app.Notifications.SendRequestToJoinGroup(group_id, id)

	}
}

func CreateEvent(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}

		if r.Method != "POST" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var event models.Event
		err := json.NewDecoder(r.Body).Decode(&event)
		if err != nil {
			sendErrorResponse(w, "Invalid event data", http.StatusBadRequest)
			return
		}

		userID, err := app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, "Invalid session", http.StatusUnauthorized)
			return
		}

		event.CreatorID = userID

		err = app.Groups.CreateEvent(event)
		if err != nil {
			sendErrorResponse(w, "Failed to save event", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"status": "event created"})
	}
}

func FetchEvents(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}

		groupIDStr := r.URL.Query().Get("groupId")
		groupID, err := strconv.Atoi(groupIDStr)
		if err != nil {
			sendErrorResponse(w, "Invalid group ID", http.StatusBadRequest)
			return
		}

		// Get user ID from session
		userID, err := app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Fetch all events for this group
		events, err := app.Groups.GetEventsByGroupID(groupID)
		if err != nil {
			sendErrorResponse(w, "Failed to fetch events", http.StatusInternalServerError)
			return
		}

		// For each event, check if the user has responded and include total counts
		type EventWithResponse struct {
			models.Event
			YourResponse string         `json:"your_response,omitempty"`
			Responses    map[string]int `json:"responses,omitempty"`
		}

		var eventsWithResponse []EventWithResponse
		for _, event := range events {
			// Get the user's individual response
			rawResp, err := app.Groups.GetResponseForUser(event.ID, userID)
			if err != nil {
				rawResp = ""
			}
			userChoice := mapIsGoingToLabel(rawResp)

			// Get the total counts of all responses
			counts, err := app.Groups.GetResponseCounts(event.ID)
			if err != nil {
				counts = map[string]int{}
			}

			eventsWithResponse = append(eventsWithResponse, EventWithResponse{
				Event:        event,
				YourResponse: userChoice,
				Responses:    counts,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(eventsWithResponse)
	}
}

func mapIsGoingToLabel(value string) string {
	switch value {
	case "1":
		return "Going"
	case "0":
		return "Not Going"
	default:
		return ""
	}
}

func OptionsEvent(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}

		if r.Method != "POST" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			EventID int    `json:"event_id"`
			Choice  string `json:"choice"` // "Going" or "Not Going"
		}

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			sendErrorResponse(w, "Invalid input", http.StatusBadRequest)
			return
		}

		userID, err := app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		isGoing := 0
		if req.Choice == "Going" {
			isGoing = 1
		}

		err = app.Groups.SaveEventResponse(req.EventID, userID, isGoing)
		if err != nil {
			sendErrorResponse(w, "Failed to save response", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "response saved"})
	}
}

func FetchAllUninvitedUsersToGroup(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if CrosAllow(w, r) {
			return
		}
		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		groupID := r.URL.Query().Get("group_id")

		userID, err := app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, "Invalid session", http.StatusUnauthorized)
			return
		}

		userSTR := strconv.Itoa(userID)

		var users []models.User

		users, err = app.Users.FetchUsersNotInGroup(groupID, userSTR)

		if err != nil {
			sendErrorResponse(w, "Failed to Fetch Unvited users "+err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(users)

	}
}

func InGroupInvite(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var invite models.Invite
		if CrosAllow(w, r) {
			return
		}

		// Only process POST requests
		if r.Method != "POST" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		err := json.NewDecoder(r.Body).Decode(&invite)

		if err != nil {
			sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
			return
		}
		var id int
		id, err = app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Invalid id data: %v", err), http.StatusBadRequest)
			return
		}

		err = app.Notifications.SendInvitesInGroup(id, invite.UserIDs, invite.GroupID)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Falied to send invites: %v", err), http.StatusBadRequest)
			return
		}

	}

}

func DownloadGroupPostImage(imageData string) (string, error) {
	if imageData == "" {
		return "", nil // no image, skip
	}

	// Split into metadata and base64 string
	parts := strings.Split(imageData, ",")
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid image data format")
	}

	meta := parts[0]
	base64Str := parts[1]

	// Extract file extension from metadata
	fileExt := "." + strings.Split(strings.Split(meta, ";")[0], "/")[1]

	// Decode base64 to binary
	data, err := base64.StdEncoding.DecodeString(base64Str)
	if err != nil {
		return "", fmt.Errorf("error decoding base64 image: %w", err)
	}

	// Create / ensure folder exists
	imageDir := filepath.Join("..", "Image", "Posts")
	err = os.MkdirAll(imageDir, 0755)
	if err != nil {
		return "", fmt.Errorf("error creating folder: %w", err)
	}

	// Create unique filename
	fileName := fmt.Sprintf("group_%d_%s%s", time.Now().UnixNano(), time.Now().Format("20060102_150405"), fileExt)
	imagePath := filepath.Join(imageDir, fileName)

	// Write to disk
	err = os.WriteFile(imagePath, data, 0644)
	if err != nil {
		return "", fmt.Errorf("error writing image to disk: %w", err)
	}

	return fileName, nil // return final filename to be saved in DB
}

func CreateGroupPost(app *CoreModels.App) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		var post models.Post

		if CrosAllow(w, r) {
			return
		}
		if r.Method != "POST" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		err := json.NewDecoder(r.Body).Decode(&post)
		if err != nil {
			sendErrorResponse(w, "Invalid post data", http.StatusBadRequest)
			return
		}

		userID, err := app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, "Invalid session", http.StatusUnauthorized)
			return
		}

		// Convert to GroupPost directly (no need to convert groupID)
		convertedPost := models.GroupPost{
			UserID:    userID,
			GroupID:   post.GroupID,
			Content:   post.Content,
			ImageFile: post.ImageFile,
		}

		convertedPost.ImagePath, err = DownloadGroupPostImage(post.ImageFile)
		if err != nil {
			sendErrorResponse(w, "Invalid image data: "+err.Error(), http.StatusBadRequest)
			return
		}
		convertedPost.ImageFile = "" // optional cleanup

		err = app.Groups.CreateGroupPost(&convertedPost)
		if err != nil {
			sendErrorResponse(w, "Failed to create group post: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(convertedPost)
	}
}

func FetchGroupPosts(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}
		if r.Method != "GET" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		groupIDStr := r.URL.Query().Get("group_id")
		groupID, err := strconv.Atoi(groupIDStr)
		if err != nil {
			sendErrorResponse(w, "Invalid group ID", http.StatusBadRequest)
			return
		}

		posts, err := app.Groups.GetPostsByGroupID(groupID)
		if err != nil {
			sendErrorResponse(w, "Failed to fetch posts: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)
	}
}




func CreateGroupComment(app *CoreModels.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if CrosAllow(w, r) {
			return
		}

		if r.Method != "POST" {
			sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var input struct {
			PostID  int    `json:"post_id"`
			Content string `json:"content"`
		}

		err := json.NewDecoder(r.Body).Decode(&input)
		if err != nil {
			sendErrorResponse(w, "Invalid input", http.StatusBadRequest)
			return
		}

		userID, err := app.Users.GetUserIDFromSession(w, r)
		if err != nil {
			sendErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		stmt := `
			INSERT INTO comments (user_id, post_id, content, created_at)
			VALUES (?, ?, ?, datetime('now'))
		`

		_, err = app.DB.Exec(stmt, userID, input.PostID, input.Content)
		if err != nil {
			sendErrorResponse(w, "Failed to save comment: "+err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}
}
