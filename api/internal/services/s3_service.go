package services

import (
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/google/uuid"
)

type S3Service struct {
	s3Client   *s3.S3
	uploader   *s3manager.Uploader
	downloader *s3manager.Downloader
	bucket     string
	region     string
	enabled    bool
}

// NewS3Service creates a new S3 service
func NewS3Service(cfg *config.Config) (*S3Service, error) {
	if !cfg.S3Enabled {
		return &S3Service{enabled: false}, nil
	}

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(cfg.AWSRegion),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %v", err)
	}

	s3Client := s3.New(sess)
	uploader := s3manager.NewUploader(sess)
	downloader := s3manager.NewDownloader(sess)

	return &S3Service{
		s3Client:   s3Client,
		uploader:   uploader,
		downloader: downloader,
		bucket:     cfg.S3Bucket,
		region:     cfg.AWSRegion,
		enabled:    true,
	}, nil
}

// UploadFile uploads a file to S3
func (s *S3Service) UploadFile(file multipart.File, header *multipart.FileHeader, folder string) (string, error) {
	if !s.enabled {
		return "", fmt.Errorf("S3 service is disabled")
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	key := fmt.Sprintf("%s/%s", folder, filename)

	// Upload file to S3
	_, err := s.uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
		Body:   file,
		ACL:    aws.String("public-read"),
	})

	if err != nil {
		return "", fmt.Errorf("failed to upload file to S3: %v", err)
	}

	// Return public URL
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key)
	return url, nil
}

// UploadFileFromReader uploads a file from io.Reader to S3
func (s *S3Service) UploadFileFromReader(reader io.Reader, filename, folder, contentType string) (string, error) {
	if !s.enabled {
		return "", fmt.Errorf("S3 service is disabled")
	}

	// Generate unique filename
	ext := filepath.Ext(filename)
	uniqueFilename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	key := fmt.Sprintf("%s/%s", folder, uniqueFilename)

	// Upload file to S3
	_, err := s.uploader.Upload(&s3manager.UploadInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        reader,
		ContentType: aws.String(contentType),
		ACL:         aws.String("public-read"),
	})

	if err != nil {
		return "", fmt.Errorf("failed to upload file to S3: %v", err)
	}

	// Return public URL
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key)
	return url, nil
}

// DeleteFile deletes a file from S3
func (s *S3Service) DeleteFile(url string) error {
	if !s.enabled {
		return fmt.Errorf("S3 service is disabled")
	}

	// Extract key from URL
	key := s.extractKeyFromURL(url)
	if key == "" {
		return fmt.Errorf("invalid S3 URL")
	}

	_, err := s.s3Client.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		return fmt.Errorf("failed to delete file from S3: %v", err)
	}

	return nil
}

// GeneratePresignedURL generates a presigned URL for file access
func (s *S3Service) GeneratePresignedURL(key string, expiration time.Duration) (string, error) {
	if !s.enabled {
		return "", fmt.Errorf("S3 service is disabled")
	}

	req, _ := s.s3Client.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	url, err := req.Presign(expiration)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %v", err)
	}

	return url, nil
}

// IsValidImageType checks if the file type is a valid image
func (s *S3Service) IsValidImageType(contentType string) bool {
	validTypes := []string{
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
	}

	for _, validType := range validTypes {
		if contentType == validType {
			return true
		}
	}
	return false
}

// IsValidVideoType checks if the file type is a valid video
func (s *S3Service) IsValidVideoType(contentType string) bool {
	validTypes := []string{
		"video/mp4",
		"video/mpeg",
		"video/quicktime",
		"video/x-msvideo",
		"video/webm",
	}

	for _, validType := range validTypes {
		if contentType == validType {
			return true
		}
	}
	return false
}

// extractKeyFromURL extracts the S3 key from a public URL
func (s *S3Service) extractKeyFromURL(url string) string {
	// Handle different S3 URL formats
	if strings.Contains(url, fmt.Sprintf("%s.s3.%s.amazonaws.com", s.bucket, s.region)) {
		parts := strings.Split(url, fmt.Sprintf("%s.s3.%s.amazonaws.com/", s.bucket, s.region))
		if len(parts) == 2 {
			return parts[1]
		}
	}
	return ""
}

// IsEnabled returns whether S3 service is enabled
func (s *S3Service) IsEnabled() bool {
	return s.enabled
}