# Social Media Post Scheduling Tool Backend

A fully functional backend for a Social Media Post Scheduling Tool using the MERN stack (MongoDB, Express.js, Node.js).

## Features

### Authentication & OAuth Integration
- JWT-based authentication for secure user login and registration
- LinkedIn OAuth 2.0 authentication
- Secure token handling with refresh token strategy

### Post Management (CRUD & Scheduling)
- Full CRUD operations for posts
- Draft, edit, and delete posts
- Post scheduling using Agenda.js
- Automatic publishing to LinkedIn at scheduled times

### LinkedIn API Integration
- LinkedIn API integration for publishing posts
- OAuth 2.0 token authentication
- API rate limit handling

### Database & Models (MongoDB + Mongoose)
- MongoDB with Mongoose ORM
- Models for User, Post, and ScheduledPost

### Error Handling & Logging
- Centralized error handling
- Winston for logging
- Edge case handling

### Security Best Practices
- Password hashing with bcrypt
- Secure API routes with authentication middleware
- Rate limiting and CORS policies

### Background Job Processing
- Agenda.js for job scheduling
- Job persistence across server restarts
- Logging of job success/failure

## Project Structure

```
server/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── jobs/               # Background job definitions
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # API routes
├── services/           # Business logic
├── utils/              # Utility functions
├── .env.example        # Environment variables example
├── index.js            # Entry point
└── README.md           # Documentation
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/linkedin` - Initiate LinkedIn OAuth
- `GET /api/auth/linkedin/callback` - LinkedIn OAuth callback

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get a single post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/publish-now` - Publish post immediately

### Scheduled Posts
- `GET /api/scheduled-posts` - Get scheduled posts
- `DELETE /api/scheduled-posts/:id` - Cancel scheduled post

## LinkedIn Integration

To use LinkedIn integration:
1. Create a LinkedIn Developer App at https://www.linkedin.com/developers/
2. Configure the OAuth 2.0 settings
3. Add the LinkedIn credentials to your `.env` file

## Security

This application implements several security best practices:
- JWT authentication with refresh tokens
- Password hashing
- Rate limiting
- CORS protection
- Input validation
- Error handling

## Background Jobs

The application uses Agenda.js for scheduling posts:
- Jobs persist in MongoDB
- Failed jobs are retried
- Job status is tracked