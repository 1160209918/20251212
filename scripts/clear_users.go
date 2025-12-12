package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	dbPath := "data/data.db"
	if len(os.Args) > 1 {
		dbPath = os.Args[1]
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// First, show current users
	fmt.Println("Current users in database:")
	rows, err := db.Query("SELECT id, email, otp_verified, created_at FROM users")
	if err != nil {
		log.Fatalf("Failed to query users: %v", err)
	}

	var userCount int
	for rows.Next() {
		var id, email, createdAt string
		var otpVerified bool
		if err := rows.Scan(&id, &email, &otpVerified, &createdAt); err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}
		fmt.Printf("  - ID: %s, Email: %s, OTP Verified: %v, Created: %s\n", id, email, otpVerified, createdAt)
		userCount++
	}
	rows.Close()

	if userCount == 0 {
		fmt.Println("No users found in database.")
		return
	}

	fmt.Printf("\nTotal users: %d\n", userCount)
	fmt.Print("\nDo you want to delete ALL users? (yes/no): ")

	var confirm string
	fmt.Scanln(&confirm)

	if confirm != "yes" {
		fmt.Println("Operation cancelled.")
		return
	}

	// Delete all users
	result, err := db.Exec("DELETE FROM users")
	if err != nil {
		log.Fatalf("Failed to delete users: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	fmt.Printf("\n✅ Successfully deleted %d user(s).\n", rowsAffected)

	// Also clear related data
	fmt.Println("\nCleaning up related data...")

	// Clear strategies
	result, _ = db.Exec("DELETE FROM strategies WHERE user_id != ''")
	if affected, _ := result.RowsAffected(); affected > 0 {
		fmt.Printf("  - Deleted %d user strategies\n", affected)
	}

	// Clear traders
	result, _ = db.Exec("DELETE FROM traders")
	if affected, _ := result.RowsAffected(); affected > 0 {
		fmt.Printf("  - Deleted %d traders\n", affected)
	}

	// Clear positions
	result, _ = db.Exec("DELETE FROM positions")
	if affected, _ := result.RowsAffected(); affected > 0 {
		fmt.Printf("  - Deleted %d positions\n", affected)
	}

	// Clear decisions
	result, _ = db.Exec("DELETE FROM decisions")
	if affected, _ := result.RowsAffected(); affected > 0 {
		fmt.Printf("  - Deleted %d decisions\n", affected)
	}

	// Clear equity snapshots
	result, _ = db.Exec("DELETE FROM equity_snapshots")
	if affected, _ := result.RowsAffected(); affected > 0 {
		fmt.Printf("  - Deleted %d equity snapshots\n", affected)
	}

	fmt.Println("\n✅ Database cleanup completed!")
}