package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

func sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	log.Print("Error: ", message)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}