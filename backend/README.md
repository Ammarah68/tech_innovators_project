# Tech Innovators Club Platform - Backend

This is the backend server for the Tech Innovators Club Platform, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Project management system
- Admin panel for project review
- File upload functionality
- Email notifications
- Advanced search and filtering
- User engagement metrics
- Optimized database queries with proper indexing
- Comprehensive error handling
- Security best practices

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tech-innovators-club-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tech-innovators-club

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Cloudinary for file uploads (if needed)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email configuration (if needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@techinnovators.com
CLIENT_URL=http://localhost:3000
```

4. Seed the database with sample data (optional):
```bash
npm run seed
```

## Running the Application

- Development mode:
```bash
npm run dev
```

- Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/projects` - Get user's projects
- `GET /api/users/:id/achievements` - Get user's achievements

### Projects
- `GET /api/projects` - Get all projects (public)
- `GET /api/projects/:id` - Get a specific project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `PATCH /api/projects/:id/like` - Like/unlike a project

### Admin
- `GET /api/admin/pending-projects` - Get pending projects
- `GET /api/admin/approved-projects` - Get approved projects
- `GET /api/admin/rejected-projects` - Get rejected projects
- `PATCH /api/admin/projects/:id/approve` - Approve a project
- `PATCH /api/admin/projects/:id/reject` - Reject a project

### File Upload
- `POST /api/upload` - Upload project files

## Project Structure

```
backend/
├── controllers/     # Request handlers with error handling
├── middleware/      # Authentication, validation, and security
├── models/          # Database schemas with validation and indexes
├── routes/          # API route definitions
├── utils/           # Utility functions for business logic
├── config/          # Configuration files
├── scripts/         # Seed scripts
├── tests/           # Test files
├── .env             # Environment variables
├── .gitignore
├── package.json
└── server.js        # Main server file with proper error handling
```

## Testing

Run the test suite:
```bash
npm test
```

Run refactored tests:
```bash
npm run test:refactored
```

## Code Quality

Lint the code:
```bash
npm run lint
```

Format the code:
```bash
npm run format
```

## Security Features

- Helmet for security headers
- XSS protection
- Rate limiting
- Input validation
- JWT authentication with proper error handling
- SQL injection prevention
- Proper password hashing

## Performance Optimizations

- Database indexing for faster queries
- Aggregation pipelines for complex data operations
- Efficient population of related data
- Pagination for large datasets
- Caching strategies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.