package services

import (
	"net/http"
	"time"

	"github.com/gofrs/uuid"
)



var sessions = map[string]string{} // key is the session ID, value is the user ID

var userSessions = map[string]string{}

func generateSessionID() string {
	return uuid.Must(uuid.NewV4()).String()
}

func(U *UserModel)  CreateSession(w http.ResponseWriter, userID string) {
   sessionID := generateSessionID()
	var existingSessionID string
	err := U.DB.QueryRow("SELECT session_id FROM sessions WHERE user_id = ?", userID).Scan(&existingSessionID)
	if err == nil {

		_, err := U.DB.Exec("DELETE FROM sessions WHERE session_id = ?", existingSessionID)
		if err != nil {
			http.Error(w,"Failed to delete old session", http.StatusInternalServerError )
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    "",
			Expires:  time.Now().Add(-1 * time.Hour),
			HttpOnly: true,
		})
	}

	expiresAt := time.Now().Add(24 * time.Hour)

	_, err1 := U.DB.Exec("INSERT INTO sessions (session_id,user_id, expires_at) VALUES (?, ?, ?)", sessionID,userID , expiresAt)
	if err1 != nil {
        http.Error(w, "Failed to create session", http.StatusInternalServerError)
        return
    }

	http.SetCookie(w , &http.Cookie{
		Name: "session_id",
		Value: sessionID,
		Expires: expiresAt,
		HttpOnly: true,
	})
}

func(U *UserModel)  GetUserIDFromSession(w http.ResponseWriter,r *http.Request)  (int, bool) {
    cookie, err := r.Cookie("session_id")
    if err != nil {
        return 0, false
    }
    var userID int
    err = U.DB.QueryRow("SELECT user_id FROM sessions WHERE session_id = ?", cookie.Value).Scan(&userID)    
     if err != nil {
        
        http.SetCookie(w, &http.Cookie{
            Name:     "session_id",
            Value:    "",
            Path:     "/",
            Expires:  time.Now().Add(-1 * time.Hour),
            MaxAge:   -1,
            HttpOnly: true,
        })
        return 0, false
    }
    return userID, true
}

// after the user log we delete 
func(U *UserModel)  DestroySession(w http.ResponseWriter, r *http.Request) {
    cookie, err := r.Cookie("session_id")
    if err != nil {
        return
    }

    userID, exists := sessions[cookie.Value]
	if !exists {
		return
	}
    // Delete session from the session store
    delete(sessions, cookie.Value)

    delete(userSessions, userID)
    // Expire the cookie
    http.SetCookie(w, &http.Cookie{
        Name:     "session_id",
        Value:    "",
        Expires:  time.Now().Add(-1 * time.Hour), // Expire the cookie immediately
        HttpOnly: true,
        
    })
}



