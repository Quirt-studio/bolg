package main

import (
	"bolg-api/config"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"bolg-api/internal/router"
	"bolg-api/internal/service"
	"fmt"
	"log"
	"os"
	"time"
)

func main() {
	// Load config
	configPath := "config/config.yaml"
	if len(os.Args) > 1 {
		configPath = os.Args[1]
	}

	cfg, err := config.Load(configPath)
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database
	if err := database.Init(&cfg.Database); err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}
	log.Println("Database connected.")

	// Auto migrate
	if err := database.DB.AutoMigrate(model.AllModels()...); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migrated.")

	// Seed data
	service.Seed()

	// Start background scheduler (checks every minute)
	go startScheduler()

	// Setup router
	r := router.Setup(cfg.Server.Mode)

	// Create upload dir
	os.MkdirAll(cfg.Storage.LocalPath, 0755)

	// Start server
	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func startScheduler() {
	workService := service.NewWorkService()
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		if err := workService.CheckAndPublishScheduled(); err != nil {
			log.Printf("Scheduler error: %v", err)
		}
	}
}
