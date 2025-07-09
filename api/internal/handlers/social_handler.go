package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SocialHandler struct {
	db         *gorm.DB
	s3Service  *services.S3Service
	redisCache *services.CacheService
}

// NewSocialHandler creates a new social handler
func NewSocialHandler(db *gorm.DB, s3Service *services.S3Service, redisCache *services.CacheService) *SocialHandler {
	return &SocialHandler{
		db:         db,
		s3Service:  s3Service,
		redisCache: redisCache,
	}
}

// CreatePost creates a new post
func (h *SocialHandler) CreatePost(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		Content   string   `json:"content" binding:"required"`
		MediaURLs []string `json:"media_urls"`
		IsPublic  bool     `json:"is_public"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Determine media type
	mediaType := "none"
	if len(req.MediaURLs) > 0 {
		mediaType = "mixed" // Default to mixed, can be refined
	}

	post := models.Post{
		ID:        uuid.New().String(),
		UserID:    userID,
		Content:   req.Content,
		MediaURLs: strings.Join(req.MediaURLs, ","),
		MediaType: mediaType,
		IsPublic:  req.IsPublic,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.db.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	// Update user's posts count
	h.db.Model(&models.UserProfile{}).Where("user_id = ?", userID).Update("posts_count", gorm.Expr("posts_count + ?", 1))

	c.JSON(http.StatusCreated, gin.H{
		"message": "Post created successfully",
		"post":    post,
	})
}

// GetPosts retrieves posts for the feed
func (h *SocialHandler) GetPosts(c *gin.Context) {
	userID := c.GetString("userID")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	var posts []models.Post
	query := h.db.Where("status = ?", "active").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Preload("User")

	// If user is authenticated, show their posts and public posts
	if userID != "" {
		query = query.Where("is_public = ? OR user_id = ?", true, userID)
	} else {
		query = query.Where("is_public = ?", true)
	}

	if err := query.Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": posts,
		"page":  page,
		"limit": limit,
	})
}

// GetPost retrieves a specific post
func (h *SocialHandler) GetPost(c *gin.Context) {
	postID := c.Param("id")
	userID := c.GetString("userID")

	var post models.Post
	query := h.db.Where("id = ? AND status = ?", postID, "active").
		Preload("User").
		Preload("Comments", func(db *gorm.DB) *gorm.DB {
			return db.Where("status = ?", "active").Order("created_at ASC")
		}).
		Preload("Comments.User")

	if err := query.First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch post"})
		}
		return
	}

	// Check if user can view this post
	if !post.IsPublic && post.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to view this post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"post": post})
}

// UpdatePost updates a post
func (h *SocialHandler) UpdatePost(c *gin.Context) {
	postID := c.Param("id")
	userID := c.GetString("userID")

	var req struct {
		Content  string `json:"content"`
		IsPublic bool   `json:"is_public"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var post models.Post
	if err := h.db.Where("id = ? AND user_id = ?", postID, userID).First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch post"})
		}
		return
	}

	post.Content = req.Content
	post.IsPublic = req.IsPublic
	post.UpdatedAt = time.Now()

	if err := h.db.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Post updated successfully",
		"post":    post,
	})
}

// DeletePost deletes a post
func (h *SocialHandler) DeletePost(c *gin.Context) {
	postID := c.Param("id")
	userID := c.GetString("userID")

	var post models.Post
	if err := h.db.Where("id = ? AND user_id = ?", postID, userID).First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch post"})
		}
		return
	}

	// Soft delete by updating status
	post.Status = "deleted"
	post.UpdatedAt = time.Now()

	if err := h.db.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	// Update user's posts count
	h.db.Model(&models.UserProfile{}).Where("user_id = ?", userID).Update("posts_count", gorm.Expr("posts_count - ?", 1))

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}

// LikePost likes or unlikes a post
func (h *SocialHandler) LikePost(c *gin.Context) {
	postID := c.Param("id")
	userID := c.GetString("userID")

	// Check if post exists
	var post models.Post
	if err := h.db.Where("id = ? AND status = ?", postID, "active").First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch post"})
		}
		return
	}

	// Check if user already liked this post
	var existingLike models.Like
	likeExists := h.db.Where("user_id = ? AND post_id = ?", userID, postID).First(&existingLike).Error == nil

	if likeExists {
		// Unlike the post
		if err := h.db.Delete(&existingLike).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike post"})
			return
		}
		
		// Decrease likes count
		h.db.Model(&post).Update("likes_count", gorm.Expr("likes_count - ?", 1))
		
		c.JSON(http.StatusOK, gin.H{
			"message": "Post unliked successfully",
			"liked":   false,
		})
	} else {
		// Like the post
		like := models.Like{
			ID:        uuid.New().String(),
			UserID:    userID,
			PostID:    &postID,
			CreatedAt: time.Now(),
		}

		if err := h.db.Create(&like).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like post"})
			return
		}

		// Increase likes count
		h.db.Model(&post).Update("likes_count", gorm.Expr("likes_count + ?", 1))

		c.JSON(http.StatusOK, gin.H{
			"message": "Post liked successfully",
			"liked":   true,
		})
	}
}