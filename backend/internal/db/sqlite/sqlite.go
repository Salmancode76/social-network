package sqlite

import (
	"database/sql"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func ConnectDB() *sql.DB {
	dbPath := "../internal/db/sqlite/db.db"
	
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal("Something bad happened while opening the database:", err)
	}
	
	if err = db.Ping(); err != nil {
		log.Fatal("Failed to connect to the database:", err)
	} else {
		log.Println("Successfully connected to the database")
	}

	RunMigration(db)
	return db
}

func RunMigration(db *sql.DB) {
	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		log.Fatal("Failed to create migration driver:", err)
	}
	m, err := migrate.NewWithDatabaseInstance("file:..//internal/db/migrations/sqlite", "sqlite3", driver)
	if err != nil {
		log.Fatal("Failed to create migrate instance:", err)
	}

	_, err = db.Exec("PRAGMA foreign_keys = OFF;")
	err = m.Up()
	if err != nil && err != migrate.ErrNoChange {
		log.Fatal("Failed to run migrations:", err)
	}
	_, err = db.Exec("PRAGMA foreign_keys = ON;")
}