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
	CreatedAt           time.Time
	UpdatedAt           time.Time

	// Relations - these fields won't be stored in the database
	// but will be used by GORM to load related records
	Accounts     []Account     `gorm:"foreignKey:UserID"`
	ApiKeys      []ApiKey      `gorm:"foreignKey:UserID"`
	Sessions     []Session     `gorm:"foreignKey:UserID"`
	Transactions []Transaction `gorm:"foreignKey:UserID"`
	UsageStats   []UsageStats  `gorm:"foreignKey:UserID"`
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
