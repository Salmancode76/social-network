package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// Open the database

//closeing the data base

func CloseDB(db *sql.DB) {
	db.Close()
}
func SetRead(from string, to string) {

	db := OpenDatabase()
	user := GetUserID(db, from)
	defer CloseDB(db)
	_, err := db.Exec("UPDATE messages SET is_read = 1 WHERE from_id = ? AND to_id = ?", user, to)
	if err != nil {
		fmt.Printf("Server >> Error setting message as read: %s", err)
	}

}

func AddMessageToHistory(fromUSer string, toUser string, messageText string) {
	isread := 0
	db := OpenDatabase()
	defer CloseDB(db)
	//inserting data into table
	_, err := db.Exec("INSERT INTO chatmessages (from_id,to_id,message,time,is_read) VALUES (?,?,?,?,?)", fromUSer, toUser, messageText, time.Now().Format("2006-01-02 15:04:05"), isread)
	if err != nil {
		// Handle error
		fmt.Printf("Server >> Error adding message to database: %s ", err)
	}
}

func AddMessageToGroupHistory(fromUSer string, toUser string, messageText string) {
	db := OpenDatabase()
	defer CloseDB(db)
	//inserting data into table
	_, err := db.Exec("INSERT INTO group_messages (user_id,group_id,text,time) VALUES (?,?,?,?)", fromUSer, toUser, messageText, time.Now().Format("2006-01-02 15:04:05"))
	if err != nil {
		// Handle error
		fmt.Printf("Server >> Error adding message to database: %s ", err)
	}
}

func GetChatHistory(user string, from string, offset int) []Message {
	db := OpenDatabase()
	defer db.Close()
	fmt.Println("fromUser is=", from)
	fmt.Println("toUser is=", user)
	rows, err := db.Query("SELECT from_id, to_id, is_read, message, time FROM chatmessages WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?) ORDER BY time ASC", user, from, from, user)

	if err != nil {
		fmt.Printf("Server >> Error getting chat history: %s", err)
	}

	messages := []Message{}
	for rows.Next() {
		var fromUser, toUser string
		var isread int
		var message string
		var time string
		err = rows.Scan(&fromUser, &toUser, &isread, &message, &time)
		if err != nil {
			fmt.Printf("Server >> Error reading chat history: %s", err)
		}

		toUser = GetUsernameFromId(db, toUser)
		fromUser = GetUsernameFromId(db, fromUser)
		println("fromUser is=", fromUser)
		println("toUser is=", toUser)
		msg := Message{
			From:      fromUser,
			To:        toUser,
			Read:      isread,
			Text:      message,
			CreatedAt: time,
		}
		messages = append(messages, msg)
	}

	// stmt, err := db.Prepare(`
	// 	UPDATE messages
	// 	SET is_read = 1
	// 	WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)
	// `)

	// Execute the prepared statement with the user IDs
	// // result, err := stmt.Exec(user, from, from, user)
	// // if err != nil {
	// // 	fmt.Printf("Server >> Error getting chat history: %s", err)
	// // }
	// fmt.Println("is read executed result", result)

	return messages
}

func GetGroupChatHistory(group string, from string) []Message {
	db := OpenDatabase()
	defer db.Close()
	fmt.Println("fromUser is=", from)
	fmt.Println("The group is=", group)
	rows, err := db.Query("SELECT group_id, user_id, text, time FROM group_messages WHERE (group_id=?) ORDER BY time ASC", group)

	if err != nil {
		fmt.Printf("Server >> Error getting chat history: %s", err)
	}

	messages := []Message{}
	for rows.Next() {
		var GroupID, userID string
		var message string
		var time string
		err = rows.Scan(&GroupID, &userID, &message, &time)
		if err != nil {
			fmt.Printf("Server >> Error reading chat history: %s", err)
		}
		if userID == from {
			userID = "You"
		} else {
			userID = GetUsernameFromId(db, userID)
		}

		msg := Message{
			From:      userID,
			Text:      message,
			CreatedAt: time,
		}
		messages = append(messages, msg)
	}

	// stmt, err := db.Prepare(`
	// 	UPDATE messages
	// 	SET is_read = 1
	// 	WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)
	// `)

	// Execute the prepared statement with the user IDs
	// // result, err := stmt.Exec(user, from, from, user)
	// // if err != nil {
	// // 	fmt.Printf("Server >> Error getting chat history: %s", err)
	// // }
	// fmt.Println("is read executed result", result)

	return messages
}

// Get username depending on userID
func GetUsernameFromId(db *sql.DB, id string) string {
	// Prepare the SQL query to retrieve the user ID based on the username

	query := "SELECT nickname FROM Users WHERE id = ?"

	// Execute the query and retrieve the user ID
	var username string
	err := db.QueryRow(query, id).Scan(&username)
	if err != nil {
		fmt.Printf("Server >> Error getting user ID: %s", err)
	}

	return username
}
func GetNickname(id string) string {
	// Prepare the SQL query to retrieve the user ID based on the username
	db := OpenDatabase()
	defer db.Close()
	query := "SELECT nickname FROM Users WHERE id = ?"

	// Execute the query and retrieve the user ID
	var username string
	err := db.QueryRow(query, id).Scan(&username)
	if err != nil {
		fmt.Printf("Server >> Error getting user ID: %s", err)
	}

	return username
}

func GetGroupMembers(id string) []string {
	db := OpenDatabase()
	defer db.Close()
	query := "select user_id FROM group_members where group_id = ?"
	members := []string{}

	rows, err := db.Query(query, id)
	if err != nil {
		fmt.Printf("Server >> Error getting group members: %s", err)
		return members
	}
	user_id := ""
	defer rows.Close()
	for rows.Next() {
		err = rows.Scan(&user_id)
		if err != nil {
			fmt.Printf("Server >> Error reading chat history: %s", err)
		continue
		}
		members = append(members, user_id)
	}
	// Execute the query and retrieve the user ID

	return members
}

func GetUserName(db *sql.DB, From string) string {
	query := "SELECT Username FROM Users WHERE UserID = ?"

	// Execute the query and retrieve the user ID
	var username string
	err := db.QueryRow(query, From).Scan(&username)
	if err != nil {
		fmt.Printf("Server >> Error getting user ID: %s", err)
	}

	return username
}

func GetUserID(db *sql.DB, username string) string {
	fmt.Println("getting user id for", username)
	// Prepare the SQL query to retrieve the user ID based on the username
	query := "SELECT id FROM Users WHERE nickname = ?"
	// Execute the query and retrieve the user ID
	var userID string
	err := db.QueryRow(query, username).Scan(&userID)
	if err != nil {
		fmt.Printf("Server >> Error getting user ID: %s", err)
	}

	return userID
}

func GetID(username string) string {
	db := OpenDatabase()
	defer db.Close()
	fmt.Println("getting user id for", username)
	// Prepare the SQL query to retrieve the user ID based on the username
	query := "SELECT id FROM Users WHERE nickname = ?"
	// Execute the query and retrieve the user ID
	var userID string
	err := db.QueryRow(query, username).Scan(&userID)
	if err != nil {
		fmt.Printf("Server >> Error getting user ID: %s", err)
	}

	return userID
}

func getAllUsers(db *sql.DB, id string) []string {

	//get public
	fmt.Println("getting all users")
	//get all follwoing
	query := "SELECT following_id FROM followers WHERE follower_id = ? "
	var names []string
	rows, err := db.Query(query, id)
	if err != nil {
		fmt.Printf("Server >> Error getting all users: %s\n", err)
	} else {
		defer rows.Close()
		for rows.Next() {
			var id int
			err = rows.Scan(&id)
			if err != nil {
				fmt.Printf("Server >> Error scanning user ID: %s\n", err)
				continue
			}

			// Convert int to string properly
			name := GetNickname(fmt.Sprintf("%d", id))
			names = append(names, name)
		}
	}

	// get all following
	query = "SELECT follower_id FROM followers WHERE following_id = ? "

	rows, err = db.Query(query, id)
	if err != nil {
		fmt.Printf("Server >> Error getting all users: %s", err)
	}
	for rows.Next() {
		var id int
		err = rows.Scan(&id)
		if err != nil {
			fmt.Printf("Server >> Error getting all users: %s", err)
		}

		name := GetNickname(strconv.Itoa(id))
		if isRedunat(names, name) {
			continue
		}
		names = append(names, name)
	}
	//get public

	query = "SELECT nickname FROM users WHERE is_public = 1   AND id != ?"
	rows, err = db.Query(query, id)
	if err != nil {
		fmt.Printf("Server >> Error getting all users: %s", err)
	}
	for rows.Next() {
		var name string
		err = rows.Scan(&name)
		if err != nil {
			fmt.Printf("Server >> Error getting all users: %s", err)
		}

		if isRedunat(names, name) {
			continue
		}
		names = append(names, name)
	}
	return names
}
func isRedunat(AllUsers []string, name string) bool {
	for _, i := range AllUsers {
		if i == name {
			return true
		}
	}
	return false
}

// func getFriends(db *sql.DB, to string) []string {

// 	query := "SELECT Username FROM User WHERE UserID != ?"
// 	var names []string
// 	rows, err := db.Query(query,to)
// 	if err != nil {
// 		fmt.Printf("Server >> Error getting all users: %s", err)
// 	}
// 	for rows.Next() {
// 		var name string
// 		err = rows.Scan(&name)
// 		if err != nil {
// 			fmt.Printf("Server >> Error getting all users: %s", err)
// 		}
// 		names = append(names, name)
// 	}
// 	return names
// }

func GetLastMessage(db *sql.DB, senderId string, receiverId string) (int, string, int) {

	var message string
	var read int
	var messageID int
	//fmt.Println(senderId)
	err := db.QueryRow(`
    SELECT  messageID,message, is_read FROM messages
    WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)
    ORDER BY messageID DESC
    LIMIT 1`,
		senderId, receiverId, receiverId, senderId,
	).Scan(&messageID, &message, &read)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, "", 1
		} else {
			log.Fatal(err)
		}
	}
	if read == 0 {
		fmt.Println("found one unread message from senderID and reciverID", senderId, receiverId)
	}
	return messageID, message, read
}

// func GetOtherUsersData(UserId int, activeUsers []int) []User {
// 	var Friends []User
// 	var Stranger []User

// 	// Query the database for post data
// 	rows, err := Accountsdb.Query("SELECT id, Username, UserImg FROM accounts WHERE id != ?", UserId)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer rows.Close()

// 	// Iterate over the rows and populate the Posts slice
// 	for rows.Next() {
// 		var User User
// 		err := rows.Scan(&User.UserId, &User.Username, &User.ProfileImg)
// 		if err != nil {
// 			log.Println("Error scanning row:", err)
// 			continue
// 		}
// 		User.MessageID, User.LastMessage = GetLastMessage(UserId, User.UserId)
// 		if IsUserActive(User.UserId, activeUsers) {
// 			User.Status = "Online"
// 		} else {
// 			User.Status = "Offline"
// 		}
// 		User.Notifications = GetNumOfNotifications(User.UserId, UserId)

// 		if User.LastMessage == "" {
// 			Stranger = append(Stranger, User)
// 		} else {
// 			Friends = append(Friends, User)
// 		}
// 	}
// 	if err = rows.Err(); err != nil {
// 		log.Fatal(err)
// 	}
// 	Users := CombineUsers(Friends, Stranger)

// 	return Users
// }
