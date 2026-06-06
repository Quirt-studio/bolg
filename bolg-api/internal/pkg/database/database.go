package database

import (
	"bolg-api/config"
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(cfg *config.DatabaseConfig) error {
	var err error
	DB, err = gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		PrepareStmt: true,
	})
	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get db instance: %w", err)
	}
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)

	// Force UTF-8 encoding for all connections
	sqlDB.Exec("SET NAMES utf8mb4")
	sqlDB.Exec("SET CHARACTER SET utf8mb4")
	sqlDB.Exec("SET character_set_client = utf8mb4")
	sqlDB.Exec("SET character_set_connection = utf8mb4")
	sqlDB.Exec("SET character_set_results = utf8mb4")

	return nil
}

func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
