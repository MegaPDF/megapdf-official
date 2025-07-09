// scripts/init-mongo.js
// Initialize MongoDB database for social network

// Create the database
db = db.getSiblingDB('megapdf_social');

// Create collections with indexes
db.createCollection('posts');
db.createCollection('comments');
db.createCollection('likes');
db.createCollection('follows');
db.createCollection('notifications');
db.createCollection('user_profiles');
db.createCollection('reports');

// Create indexes for better performance
db.posts.createIndex({ "user_id": 1, "created_at": -1 });
db.posts.createIndex({ "status": 1, "is_public": 1 });
db.posts.createIndex({ "created_at": -1 });

db.comments.createIndex({ "post_id": 1, "created_at": 1 });
db.comments.createIndex({ "user_id": 1, "created_at": -1 });
db.comments.createIndex({ "parent_id": 1 });

db.likes.createIndex({ "user_id": 1, "post_id": 1 });
db.likes.createIndex({ "user_id": 1, "comment_id": 1 });
db.likes.createIndex({ "created_at": -1 });

db.follows.createIndex({ "follower_id": 1, "following_id": 1 });
db.follows.createIndex({ "following_id": 1, "status": 1 });
db.follows.createIndex({ "follower_id": 1, "status": 1 });

db.notifications.createIndex({ "user_id": 1, "read": 1, "created_at": -1 });
db.notifications.createIndex({ "type": 1, "created_at": -1 });

db.user_profiles.createIndex({ "user_id": 1 });
db.user_profiles.createIndex({ "is_verified": 1 });
db.user_profiles.createIndex({ "is_private": 1 });

db.reports.createIndex({ "user_id": 1, "status": 1 });
db.reports.createIndex({ "post_id": 1, "status": 1 });
db.reports.createIndex({ "comment_id": 1, "status": 1 });
db.reports.createIndex({ "created_at": -1 });

print('MongoDB initialized successfully for social network platform');