package handlers

import (
	"net/http"
)

//ALlow CORS requests from the 3000 port
func CrosAllow(w http.ResponseWriter, r *http.Request) (bool){
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")


	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return true
	}



	return false

}