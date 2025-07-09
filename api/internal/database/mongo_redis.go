package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoClient *mongo.Client
	MongoDB     *mongo.Database
	RedisClient *redis.Client
)

// InitMongoDB initializes MongoDB connection
func InitMongoDB(cfg *config.Config) error {
	if !cfg.MongoEnabled {
		log.Println("MongoDB is disabled, skipping initialization")
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	// Test the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	MongoClient = client
	MongoDB = client.Database(cfg.MongoDBName)
	log.Printf("Connected to MongoDB: %s", cfg.MongoDBName)
	return nil
}

// InitRedis initializes Redis connection
func InitRedis(cfg *config.Config) error {
	if !cfg.RedisEnabled {
		log.Println("Redis is disabled, skipping initialization")
		return nil
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect to Redis: %v", err)
	}

	RedisClient = rdb
	log.Printf("Connected to Redis: %s", cfg.RedisAddr)
	return nil
}

// CloseMongoDB closes MongoDB connection
func CloseMongoDB() error {
	if MongoClient != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		return MongoClient.Disconnect(ctx)
	}
	return nil
}

// CloseRedis closes Redis connection
func CloseRedis() error {
	if RedisClient != nil {
		return RedisClient.Close()
	}
	return nil
}