# Tech Innovators Project

A comprehensive MERN stack application featuring user authentication, project management, and admin capabilities.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## Features

- User Authentication (Register, Login, Logout)
- JWT-based secure authentication
- Admin panel for managing users and projects
- Project submission and management system
- File upload functionality
- Role-based access control
- Comprehensive validation and error handling
- Email notifications
- Responsive UI design

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- BCrypt for password hashing
- Multer for file uploads
- Validator for input validation
- CORS for cross-origin resource sharing
- Morgan for logging

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- CSS for styling

### Testing & Development
- Jest for testing
- Nodemon for development
- ESLint for linting

## Project Structure

```
tech_innovators_project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Achievement.js
│   │   ├── Project.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── upload.js
│   │   └── users.js
│   ├── utils/
│   │   ├── emailUtils.js
│   │   ├── fileUploadUtils.js
│   │   ├── generateToken.js
│   │   ├── projectUtils.js
│   │   └── userUtils.js
│   ├── tests/
│   ├── scripts/
│   ├── .env
│   ├── jest.config.js
│   ├── package.json
│   └── server.js
├── db/
│   ├── database.js
│   ├── schema.sql
│   ├── migrate.sql
│   └── init_data.sql
├── src/
│   ├── components/
│   │   ├── AdminPanel.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Navbar.js
│   │   ├── Profile.js
│   │   ├── ProjectSubmission.js
│   │   └── Register.js
│   ├── services/
│   │   └── apiService.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── .gitignore
├── package.json
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Ammarah68/tech_innovators_project.git
```

2. Navigate to the project directory:
```bash
cd tech_innovators_project
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Install frontend dependencies:
```bash
cd ../
npm install
```

5. Set up environment variables in `backend/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
```

6. Start the backend server:
```bash
cd backend
npm run dev
```

7. In a new terminal, start the frontend:
```bash
npm start
```

## Usage

1. Register a new account or log in with existing credentials
2. Submit projects through the project submission form
3. Access the admin panel (requires admin privileges) to manage users and projects
4. View and manage your profile information

## API Routes

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login to an existing account
- `POST /logout` - Logout from the current session
- `GET /me` - Get current user information
- `PUT /me` - Update current user information
- `DELETE /me` - Delete current user account
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password with token

### User Routes (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /:id` - Get user by ID (admin only)
- `PUT /:id` - Update user by ID (admin only)
- `DELETE /:id` - Delete user by ID (admin only)

### Project Routes (`/api/projects`)
- `GET /` - Get all projects
- `GET /:id` - Get project by ID
- `POST /` - Create a new project
- `PUT /:id` - Update project by ID
- `DELETE /:id` - Delete project by ID

### Admin Routes (`/api/admin`)
- `GET /users` - Get all users
- `GET /projects` - Get all projects
- `PUT /users/:id/role` - Update user role
- `DELETE /users/:id` - Delete user
- `DELETE /projects/:id` - Delete project

### Upload Routes (`/api/upload`)
- `POST /` - Upload files

## Database Schema

### User Model
- `_id`: ObjectId (Primary Key)
- `name`: String (Required)
- `email`: String (Required, Unique)
- `password`: String (Required)
- `role`: String (Default: 'user')
- `avatar`: Object (Optional)
- `resetPasswordToken`: String (Optional)
- `resetPasswordExpire`: Date (Optional)
- `createdAt`: Date (Default: Date.now)

### Project Model
- `_id`: ObjectId (Primary Key)
- `title`: String (Required)
- `description`: String (Required)
- `category`: String (Required)
- `githubLink`: String (Required)
- `demoLink`: String (Optional)
- `tags`: [String] (Optional)
- `images`: [Object] (Optional)
- `userId`: ObjectId (Reference to User)
- `likes`: [ObjectId] (Reference to User)
- `status`: String (Default: 'pending')
- `approvedAt`: Date (Optional)
- `createdAt`: Date (Default: Date.now)

### Achievement Model
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Reference to User)
- `projectId`: ObjectId (Reference to Project)
- `achievementType`: String (Required)
- `description`: String (Required)
- `dateAwarded`: Date (Default: Date.now)

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who helped develop this project
- Special thanks to the open-source community for the libraries and tools used in this project