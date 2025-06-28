// internal/models/admin_models.go
package models

import (
	"time"
)

// AdminSettings stores all admin configurable settings
type AdminSettings struct {
	ID          string `gorm:"primaryKey;type:text"`
	Key         string `gorm:"uniqueIndex;type:text"`
	Value       string `gorm:"type:text"`
	Category    string `gorm:"type:text;index"`
	Type        string `gorm:"type:text"` // string, number, boolean, json
	Description string `gorm:"type:text"`
	IsPublic    bool   `gorm:"default:false"` // Can be accessed by non-admin users
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// SystemStats for admin dashboard
type SystemStats struct {
	TotalUsers         int64           `json:"totalUsers"`
	ActiveUsers        int64           `json:"activeUsers"`
	TotalOperations    int64           `json:"totalOperations"`
	TotalRevenue       float64         `json:"totalRevenue"`
	OperationsToday    int64           `json:"operationsToday"`
	RevenueToday       float64         `json:"revenueToday"`
	OperationsThisWeek int64           `json:"operationsThisWeek"`
	RevenueThisWeek    float64         `json:"revenueThisWeek"`
	TopOperations      []OperationStat `json:"topOperations"`
}

type OperationStat struct {
	Operation string  `json:"operation"`
	Count     int64   `json:"count"`
	Revenue   float64 `json:"revenue"`
}

// AdminUser for user management
type AdminUserView struct {
	ID                  string     `json:"id"`
	Name                string     `json:"name"`
	Email               string     `json:"email"`
	Role                string     `json:"role"`
	Balance             float64    `json:"balance"`
	IsEmailVerified     bool       `json:"isEmailVerified"`
	FreeOperationsUsed  int        `json:"freeOperationsUsed"`
	FreeOperationsReset time.Time  `json:"freeOperationsReset"`
	LastLogin           *time.Time `json:"lastLogin"`
	CreatedAt           time.Time  `json:"createdAt"`
	TotalOperations     int64      `json:"totalOperations"`
	TotalSpent          float64    `json:"totalSpent"`
}

// AdminSettingsGroup for organized settings display
type AdminSettingsGroup struct {
	Category string          `json:"category"`
	Settings []AdminSettings `json:"settings"`
}

// PayPalConfig for PayPal settings
type PayPalConfig struct {
	ClientID     string `json:"clientId"`
	ClientSecret string `json:"clientSecret"`
	APIBase      string `json:"apiBase"`
	Enabled      bool   `json:"enabled"`
}

// SMTPConfig for email settings
type SMTPConfig struct {
	Host      string `json:"host"`
	Port      int    `json:"port"`
	User      string `json:"user"`
	Password  string `json:"password"`
	Secure    bool   `json:"secure"`
	FromName  string `json:"fromName"`
	FromEmail string `json:"fromEmail"`
}

// AppConfig for general app settings
type AppConfig struct {
	SiteName                 string   `json:"siteName"`
	SiteDescription          string   `json:"siteDescription"`
	AppURL                   string   `json:"appUrl"`
	APIURL                   string   `json:"apiUrl"`
	MaintenanceMode          bool     `json:"maintenanceMode"`
	RegistrationEnabled      bool     `json:"registrationEnabled"`
	RequireEmailVerification bool     `json:"requireEmailVerification"`
	MaxFileSize              int64    `json:"maxFileSize"`
	RateLimitRequests        int      `json:"rateLimitRequests"`
	SessionTimeout           int      `json:"sessionTimeout"`
	CORSAllowedOrigins       []string `json:"corsAllowedOrigins"`
}

// SecurityConfig for security settings
type SecurityConfig struct {
	JWTSecret                string `json:"jwtSecret"`
	PasswordMinLength        int    `json:"passwordMinLength"`
	PasswordRequireUppercase bool   `json:"passwordRequireUppercase"`
	PasswordRequireNumbers   bool   `json:"passwordRequireNumbers"`
	PasswordRequireSymbols   bool   `json:"passwordRequireSymbols"`
	MaxLoginAttempts         int    `json:"maxLoginAttempts"`
}

// RecentActivity for admin dashboard
type RecentActivity struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	UserName  string    `json:"userName"`
	UserEmail string    `json:"userEmail"`
	Operation string    `json:"operation"`
	Status    string    `json:"status"`
	Amount    float64   `json:"amount,omitempty"`
	ErrorMsg  string    `json:"errorMsg,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

// AdminDashboardData complete dashboard data
type AdminDashboardData struct {
	Stats          SystemStats      `json:"stats"`
	RecentActivity []RecentActivity `json:"recentActivity"`
	ActiveUsers    int64            `json:"activeUsers"`
	SystemHealth   SystemHealth     `json:"systemHealth"`
}

type SystemHealth struct {
	DatabaseStatus  string  `json:"databaseStatus"`
	APIResponseTime float64 `json:"apiResponseTime"`
	DiskUsage       float64 `json:"diskUsage"`
	MemoryUsage     float64 `json:"memoryUsage"`
	ErrorRate       float64 `json:"errorRate"`
}

// AdminSettingsUpdate for batch settings updates
type AdminSettingsUpdate struct {
	Settings []AdminSettingsItem `json:"settings"`
}

type AdminSettingsItem struct {
	Key   string      `json:"key"`
	Value interface{} `json:"value"`
}

// UserManagementAction for user actions
type UserManagementAction struct {
	Action string      `json:"action"` // update_balance, update_role, reset_password, etc.
	Value  interface{} `json:"value"`
}
