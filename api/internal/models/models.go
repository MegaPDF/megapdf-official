// internal/models/models.go - SQLite optimized version
package models

import "time"

type User struct {
	ID                  string `gorm:"primaryKey;type:text"`
	Name                string `gorm:"type:text"`
	Email               string `gorm:"uniqueIndex;type:text"`
	EmailVerified       *time.Time
	Image               string  `gorm:"type:text"`
	Password            string  `gorm:"type:text"`
	Role                string  `gorm:"type:text;default:'user'"`
	VerificationToken   *string `gorm:"type:text"`
	IsEmailVerified     bool    `gorm:"default:false"`
	Balance             float64 `gorm:"type:decimal(10,3);default:0"`
	FreeOperationsUsed  int     `gorm:"default:0"`
	FreeOperationsReset time.Time
	// Social Network fields
	Username     string `gorm:"type:text;uniqueIndex"`
	IsActive     bool   `gorm:"default:true"`
	IsSuspended  bool   `gorm:"default:false"`
	LastLoginAt  *time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time

	// Relations - these fields won't be stored in the database
	// but will be used by GORM to load related records
	Accounts      []Account      `gorm:"foreignKey:UserID"`
	ApiKeys       []ApiKey       `gorm:"foreignKey:UserID"`
	Sessions      []Session      `gorm:"foreignKey:UserID"`
	Transactions  []Transaction  `gorm:"foreignKey:UserID"`
	UsageStats    []UsageStats   `gorm:"foreignKey:UserID"`
	Profile       *UserProfile   `gorm:"foreignKey:UserID"`
	Posts         []Post         `gorm:"foreignKey:UserID"`
	Comments      []Comment      `gorm:"foreignKey:UserID"`
	Likes         []Like         `gorm:"foreignKey:UserID"`
	Followers     []Follow       `gorm:"foreignKey:FollowingID"`
	Following     []Follow       `gorm:"foreignKey:FollowerID"`
	Notifications []Notification `gorm:"foreignKey:UserID"`
	Reports       []Report       `gorm:"foreignKey:UserID"`
}

type Transaction struct {
	ID           string  `gorm:"primaryKey;type:text"`
	UserID       string  `gorm:"type:text;index"`
	Amount       float64 `gorm:"type:real"`
	BalanceAfter float64 `gorm:"type:real"`
	Description  string  `gorm:"type:text"`
	PaymentID    string  `gorm:"type:text"`
	Status       string  `gorm:"type:text;default:'completed'"`
	CreatedAt    time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type Account struct {
	ID                string  `gorm:"primaryKey;type:text"`
	UserID            string  `gorm:"type:text;index"`
	Type              string  `gorm:"type:text"`
	Provider          string  `gorm:"type:text"`
	ProviderAccountID string  `gorm:"type:text"`
	RefreshToken      *string `gorm:"type:text"`
	AccessToken       *string `gorm:"type:text"`
	ExpiresAt         *int
	TokenType         *string `gorm:"type:text"`
	Scope             *string `gorm:"type:text"`
	IDToken           *string `gorm:"type:text"`
	SessionState      *string `gorm:"type:text"`
	CreatedAt         time.Time
	UpdatedAt         time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type Session struct {
	ID           string `gorm:"primaryKey;type:text"`
	SessionToken string `gorm:"uniqueIndex;type:text"`
	UserID       string `gorm:"type:text;index"`
	Expires      time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// ApiKey model stores API keys for users
type ApiKey struct {
	ID        string `gorm:"primaryKey;type:text"`
	UserID    string `gorm:"type:text;index"`
	Name      string `gorm:"type:text"`
	Key       string `gorm:"uniqueIndex;type:text"`
	LastUsed  *time.Time
	ExpiresAt *time.Time
	CreatedAt time.Time
	UpdatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type UsageStats struct {
	ID        string `gorm:"primaryKey;type:text"`
	UserID    string `gorm:"type:text;index"`
	Operation string `gorm:"type:text;index"`
	Count     int
	Date      time.Time `gorm:"index"`
	CreatedAt time.Time
	UpdatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type PasswordResetToken struct {
	ID        string `gorm:"primaryKey;type:text"`
	Email     string `gorm:"type:text;index"`
	Token     string `gorm:"uniqueIndex;type:text"`
	Expires   time.Time
	CreatedAt time.Time
}

type VerificationToken struct {
	Identifier string `gorm:"uniqueIndex;type:text"`
	Token      string `gorm:"uniqueIndex;type:text"`
	Expires    time.Time
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type PaymentWebhookEvent struct {
	ID           string `gorm:"primaryKey;type:varchar(100)"`
	EventId      string `gorm:"type:varchar(100)"`
	EventType    string `gorm:"type:varchar(100)"`
	ResourceType string `gorm:"type:varchar(100)"`
	ResourceId   string `gorm:"type:varchar(100)"`
	RawData      string `gorm:"type:text"` // Change from longtext to text for SQLite
	CreatedAt    time.Time
}

// LowBalanceAlert tracks when low balance warnings have been sent
type LowBalanceAlert struct {
	ID        string `gorm:"primaryKey;type:text"`
	UserID    string `gorm:"type:text;index"`
	CreatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// OperationsAlert tracks when operation limit warnings or exhausted notifications have been sent
type OperationsAlert struct {
	ID        string `gorm:"primaryKey;type:text"`
	UserID    string `gorm:"type:text;index"`
	Type      string `gorm:"type:text"` // "warning" or "exhausted"
	CreatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// Social Network Models

// Post represents a post in the social network
type Post struct {
	ID          string `gorm:"primaryKey;type:text"`
	UserID      string `gorm:"type:text;index"`
	Content     string `gorm:"type:text"`
	MediaURLs   string `gorm:"type:text"` // JSON array of media URLs
	MediaType   string `gorm:"type:text"` // "image", "video", "mixed", or "none"
	IsPublic    bool   `gorm:"default:true"`
	LikesCount  int    `gorm:"default:0"`
	CommentsCount int  `gorm:"default:0"`
	SharesCount int    `gorm:"default:0"`
	Status      string `gorm:"type:text;default:'active'"` // "active", "deleted", "reported", "hidden"
	CreatedAt   time.Time
	UpdatedAt   time.Time

	// Relations
	User     User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Comments []Comment `gorm:"foreignKey:PostID"`
	Likes    []Like    `gorm:"foreignKey:PostID"`
	Reports  []Report  `gorm:"foreignKey:PostID"`
}

// Comment represents a comment on a post
type Comment struct {
	ID         string `gorm:"primaryKey;type:text"`
	PostID     string `gorm:"type:text;index"`
	UserID     string `gorm:"type:text;index"`
	ParentID   *string `gorm:"type:text;index"` // For nested comments/replies
	Content    string  `gorm:"type:text"`
	LikesCount int     `gorm:"default:0"`
	Status     string  `gorm:"type:text;default:'active'"` // "active", "deleted", "reported", "hidden"
	CreatedAt  time.Time
	UpdatedAt  time.Time

	// Relations
	Post     Post      `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE"`
	User     User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Parent   *Comment  `gorm:"foreignKey:ParentID"`
	Replies  []Comment `gorm:"foreignKey:ParentID"`
	Likes    []Like    `gorm:"foreignKey:CommentID"`
	Reports  []Report  `gorm:"foreignKey:CommentID"`
}

// Like represents a like on a post or comment
type Like struct {
	ID        string `gorm:"primaryKey;type:text"`
	UserID    string `gorm:"type:text;index"`
	PostID    *string `gorm:"type:text;index"`
	CommentID *string `gorm:"type:text;index"`
	CreatedAt time.Time

	// Relations
	User    User     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Post    *Post    `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE"`
	Comment *Comment `gorm:"foreignKey:CommentID;constraint:OnDelete:CASCADE"`
}

// Follow represents a follow relationship between users
type Follow struct {
	ID          string `gorm:"primaryKey;type:text"`
	FollowerID  string `gorm:"type:text;index"`
	FollowingID string `gorm:"type:text;index"`
	Status      string `gorm:"type:text;default:'active'"` // "active", "pending", "blocked"
	CreatedAt   time.Time
	UpdatedAt   time.Time

	// Relations
	Follower  User `gorm:"foreignKey:FollowerID;constraint:OnDelete:CASCADE"`
	Following User `gorm:"foreignKey:FollowingID;constraint:OnDelete:CASCADE"`
}

// Notification represents a notification for a user
type Notification struct {
	ID        string `gorm:"primaryKey;type:text"`
	UserID    string `gorm:"type:text;index"`
	Type      string `gorm:"type:text;index"` // "like", "comment", "follow", "mention", "post"
	Title     string `gorm:"type:text"`
	Message   string `gorm:"type:text"`
	Data      string `gorm:"type:text"` // JSON data for the notification
	Read      bool   `gorm:"default:false"`
	CreatedAt time.Time
	UpdatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// Report represents a report on a post or comment
type Report struct {
	ID        string `gorm:"primaryKey;type:text"`
	UserID    string `gorm:"type:text;index"`
	PostID    *string `gorm:"type:text;index"`
	CommentID *string `gorm:"type:text;index"`
	Reason    string  `gorm:"type:text"`
	Details   string  `gorm:"type:text"`
	Status    string  `gorm:"type:text;default:'pending'"` // "pending", "reviewed", "resolved", "dismissed"
	CreatedAt time.Time
	UpdatedAt time.Time

	// Relations
	User    User     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Post    *Post    `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE"`
	Comment *Comment `gorm:"foreignKey:CommentID;constraint:OnDelete:CASCADE"`
}

// UserProfile represents extended user profile information
type UserProfile struct {
	ID               string `gorm:"primaryKey;type:text"`
	UserID           string `gorm:"type:text;index"`
	Bio              string `gorm:"type:text"`
	Location         string `gorm:"type:text"`
	Website          string `gorm:"type:text"`
	AvatarURL        string `gorm:"type:text"`
	CoverURL         string `gorm:"type:text"`
	FollowersCount   int    `gorm:"default:0"`
	FollowingCount   int    `gorm:"default:0"`
	PostsCount       int    `gorm:"default:0"`
	IsPrivate        bool   `gorm:"default:false"`
	IsVerified       bool   `gorm:"default:false"`
	LastActiveAt     *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time

	// Relations
	User *User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// Settings represents platform settings
type Settings struct {
	ID          string `gorm:"primaryKey;type:text"`
	Key         string `gorm:"uniqueIndex;type:text"`
	Value       string `gorm:"type:text"`
	Type        string `gorm:"type:text"` // "string", "int", "bool", "json"
	Description string `gorm:"type:text"`
	IsPublic    bool   `gorm:"default:false"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
