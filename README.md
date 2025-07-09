# MegaPDF Social Network Platform

A comprehensive social network platform built with Go backend and React frontend, featuring social media functionality alongside PDF processing capabilities.

## Features

### Social Network Features

#### Client API (`/api/v1/client/`)
- **Authentication**: Register, login, logout, email verification, password reset
- **User Profiles**: Create, update, view profiles with avatars and covers
- **Posts**: Create, update, delete posts with media support
- **Comments**: Comment on posts, reply to comments, nested threading
- **Likes**: Like/unlike posts and comments
- **Follow System**: Follow/unfollow users, manage followers/following
- **Feed Generation**: Personal feed, following feed, trending content
- **Search**: Search posts, users, hashtags
- **Notifications**: Real-time notifications system
- **File Uploads**: Image and video uploads with AWS S3 integration

#### Admin API (`/api/v1/admin/`)
- **Analytics Dashboard**: User engagement metrics, growth statistics
- **User Management**: User administration, suspension, verification
- **Content Management**: Post moderation, comment management
- **Report System**: Content reporting and moderation
- **Settings Management**: Platform configuration, SMTP, S3 settings

### Technical Stack

#### Backend
- **Framework**: Go with Gin
- **Databases**: 
  - SQLite (existing functionality)
  - MongoDB (social features)
  - Redis (caching)
- **Authentication**: JWT with role-based access control
- **File Storage**: AWS S3 integration
- **Email**: SMTP configuration
- **Caching**: Redis for performance optimization

#### Key Components
- **Clean Architecture**: Separated concerns with handlers, services, repositories
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic implementation
- **Middleware**: Authentication, CORS, rate limiting
- **Comprehensive Error Handling**: Structured error responses
- **API Documentation**: Swagger integration

## Project Structure

```
api/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── config/                  # Configuration management
│   ├── database/                # Database connections (MongoDB, Redis)
│   ├── db/                      # SQLite database (existing)
│   ├── handlers/                # HTTP handlers
│   │   ├── admin_handlers.go    # Admin functionality
│   │   ├── client_handlers.go   # Client-facing handlers
│   │   ├── social_handler.go    # Social network features
│   │   └── ...
│   ├── middleware/              # HTTP middleware
│   ├── models/                  # Data models
│   ├── routes/                  # Route definitions
│   │   ├── admin/               # Admin routes
│   │   ├── client/              # Client routes
│   │   └── setup.go             # Route setup
│   ├── services/                # Business logic services
│   │   ├── cache_service.go     # Redis caching
│   │   ├── s3_service.go        # AWS S3 integration
│   │   └── ...
│   └── utils/                   # Utility functions
├── .env.example                 # Environment configuration template
└── Dockerfile                   # Docker configuration
```

## Database Models

### Social Network Models
- **User**: Extended with social features (username, status, activity)
- **UserProfile**: Extended profile information (bio, location, counters)
- **Post**: Social media posts with media support
- **Comment**: Comments with threading support
- **Like**: Like system for posts and comments
- **Follow**: Follow relationships between users
- **Notification**: Real-time notification system
- **Report**: Content moderation and reporting
- **Settings**: Platform configuration management

## API Endpoints

### Client API Endpoints
```
POST   /api/v1/client/auth/register
POST   /api/v1/client/auth/login
POST   /api/v1/client/auth/logout
GET    /api/v1/client/auth/me
POST   /api/v1/client/posts/
GET    /api/v1/client/posts/
POST   /api/v1/client/posts/:id/like
POST   /api/v1/client/comments/
GET    /api/v1/client/feed/
POST   /api/v1/client/follows/:user_id
GET    /api/v1/client/notifications/
POST   /api/v1/client/upload/image
```

### Admin API Endpoints
```
GET    /api/v1/admin/dashboard/overview
GET    /api/v1/admin/users/
POST   /api/v1/admin/users/:id/suspend
GET    /api/v1/admin/content/posts/
POST   /api/v1/admin/content/reports/:id/resolve
GET    /api/v1/admin/settings/
```

## Configuration

### Environment Variables
```bash
# Database Configuration
MONGO_ENABLED=true
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=megapdf_social

# Redis Configuration
REDIS_ENABLED=true
REDIS_ADDR=localhost:6379

# AWS S3 Configuration
S3_ENABLED=true
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name

# JWT Configuration
JWT_SECRET=your-secret-key

# Platform Settings
SITE_NAME=MegaPDF Social
REGISTRATION_ENABLED=true
```

## Development Setup

### Prerequisites
- Go 1.21+
- MongoDB (optional)
- Redis (optional)
- AWS S3 account (optional)

### Local Development
```bash
# Clone repository
git clone https://github.com/MegaPDF/megapdf-official.git
cd megapdf-official

# Copy environment configuration
cp api/.env.example api/.env

# Install dependencies
cd api && go mod tidy

# Build application
go build -o main ./cmd/api/

# Run application
./main
```

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose-social.yml up --build

# Access services
# Application: http://localhost:8080
# MongoDB Admin: http://localhost:8081
# Redis Admin: http://localhost:8082
```

## Features Status

### Implemented ✅
- Project structure reorganization
- Social network database models
- API route structure (client/admin separation)
- MongoDB and Redis integration
- AWS S3 service integration
- Authentication middleware
- Comprehensive handlers (placeholder implementations)
- Docker configuration
- Environment configuration

### In Progress 🚧
- Handler implementations
- API documentation with Swagger
- Authentication flow improvements
- File upload functionality
- Notification system
- Search functionality
- Feed generation logic

### Planned 📋
- Content moderation features
- Admin dashboard implementation
- Real-time features (WebSocket)
- Mobile API optimizations
- Performance monitoring
- Comprehensive testing
- CI/CD pipeline

## Contributing

This project follows clean architecture principles and maintains backward compatibility with existing PDF processing functionality while adding comprehensive social network features.

## License

[License information]