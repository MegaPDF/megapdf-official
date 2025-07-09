package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/database"
	"github.com/redis/go-redis/v9"
)

type CacheService struct {
	client  *redis.Client
	enabled bool
}

// NewCacheService creates a new cache service
func NewCacheService() *CacheService {
	if database.RedisClient == nil {
		return &CacheService{enabled: false}
	}

	return &CacheService{
		client:  database.RedisClient,
		enabled: true,
	}
}

// Set stores a key-value pair in the cache
func (cs *CacheService) Set(key string, value interface{}, expiration time.Duration) error {
	if !cs.enabled {
		return nil // Gracefully handle disabled cache
	}

	ctx := context.Background()
	
	// Convert value to JSON for complex types
	var data []byte
	var err error
	
	switch v := value.(type) {
	case string:
		data = []byte(v)
	case []byte:
		data = v
	default:
		data, err = json.Marshal(v)
		if err != nil {
			return fmt.Errorf("failed to marshal value: %v", err)
		}
	}

	return cs.client.Set(ctx, key, data, expiration).Err()
}

// Get retrieves a value from the cache
func (cs *CacheService) Get(key string) (string, error) {
	if !cs.enabled {
		return "", fmt.Errorf("cache not enabled")
	}

	ctx := context.Background()
	return cs.client.Get(ctx, key).Result()
}

// GetJSON retrieves a JSON value from the cache and unmarshals it
func (cs *CacheService) GetJSON(key string, dest interface{}) error {
	if !cs.enabled {
		return fmt.Errorf("cache not enabled")
	}

	ctx := context.Background()
	data, err := cs.client.Get(ctx, key).Result()
	if err != nil {
		return err
	}

	return json.Unmarshal([]byte(data), dest)
}

// Delete removes a key from the cache
func (cs *CacheService) Delete(key string) error {
	if !cs.enabled {
		return nil // Gracefully handle disabled cache
	}

	ctx := context.Background()
	return cs.client.Del(ctx, key).Err()
}

// Exists checks if a key exists in the cache
func (cs *CacheService) Exists(key string) (bool, error) {
	if !cs.enabled {
		return false, nil
	}

	ctx := context.Background()
	result := cs.client.Exists(ctx, key)
	return result.Val() > 0, result.Err()
}

// Increment increments a counter in the cache
func (cs *CacheService) Increment(key string) (int64, error) {
	if !cs.enabled {
		return 0, fmt.Errorf("cache not enabled")
	}

	ctx := context.Background()
	return cs.client.Incr(ctx, key).Result()
}

// Expire sets an expiration time for a key
func (cs *CacheService) Expire(key string, expiration time.Duration) error {
	if !cs.enabled {
		return nil
	}

	ctx := context.Background()
	return cs.client.Expire(ctx, key, expiration).Err()
}

// GetKeys retrieves all keys matching a pattern
func (cs *CacheService) GetKeys(pattern string) ([]string, error) {
	if !cs.enabled {
		return nil, fmt.Errorf("cache not enabled")
	}

	ctx := context.Background()
	return cs.client.Keys(ctx, pattern).Result()
}

// FlushAll clears all keys from the cache
func (cs *CacheService) FlushAll() error {
	if !cs.enabled {
		return nil
	}

	ctx := context.Background()
	return cs.client.FlushAll(ctx).Err()
}

// IsEnabled returns whether the cache service is enabled
func (cs *CacheService) IsEnabled() bool {
	return cs.enabled
}

// SetWithNX sets a key only if it doesn't exist (atomic operation)
func (cs *CacheService) SetWithNX(key string, value interface{}, expiration time.Duration) (bool, error) {
	if !cs.enabled {
		return false, fmt.Errorf("cache not enabled")
	}

	ctx := context.Background()
	
	// Convert value to JSON for complex types
	var data []byte
	var err error
	
	switch v := value.(type) {
	case string:
		data = []byte(v)
	case []byte:
		data = v
	default:
		data, err = json.Marshal(v)
		if err != nil {
			return false, fmt.Errorf("failed to marshal value: %v", err)
		}
	}

	return cs.client.SetNX(ctx, key, data, expiration).Result()
}

// GetTTL returns the time to live for a key
func (cs *CacheService) GetTTL(key string) (time.Duration, error) {
	if !cs.enabled {
		return 0, fmt.Errorf("cache not enabled")
	}

	ctx := context.Background()
	return cs.client.TTL(ctx, key).Result()
}

// HSet sets a field in a hash
func (cs *CacheService) HSet(key, field string, value interface{}) error {
	if !cs.enabled {
		return nil
	}

	ctx := context.Background()
	return cs.client.HSet(ctx, key, field, value).Err()
}

// HGet gets a field from a hash
func (cs *CacheService) HGet(key, field string) (string, error) {
	if !cs.enabled {
		return "", fmt.Errorf("cache not enabled")
	}

	ctx := context.Background()
	return cs.client.HGet(ctx, key, field).Result()
}

// HGetAll gets all fields from a hash
func (cs *CacheService) HGetAll(key string) (map[string]string, error) {
	if !cs.enabled {
		return nil, fmt.Errorf("cache not enabled")
	}

	ctx := context.Background()
	return cs.client.HGetAll(ctx, key).Result()
}