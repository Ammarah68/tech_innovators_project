# Tech Innovators Club Platform - Database Setup

This document provides instructions for setting up and using the PostgreSQL database for the Tech Innovators Club Platform.

## Prerequisites

- PostgreSQL 12 or higher
- psql command-line tool (usually comes with PostgreSQL installation)

## Database Setup

### 1. Create the Database

First, connect to PostgreSQL as a superuser and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# In the PostgreSQL prompt, create the database
CREATE DATABASE tech_innovators_club;

# Create a user for the application (optional but recommended)
CREATE USER tech_club_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE tech_innovators_club TO tech_club_user;

# Exit PostgreSQL
\q
```

### 2. Apply the Schema

Apply the database schema using the provided SQL file:

```bash
# Connect to the database and apply the schema
psql -U postgres -d tech_innovators_club -f db/schema.sql
```

Or if you created a specific user:

```bash
psql -U tech_club_user -d tech_innovators_club -f db/schema.sql
```

### 3. Initialize with Sample Data (Optional)

To populate the database with sample data for testing:

```bash
psql -U postgres -d tech_innovators_club -f db/init_data.sql
```

## Database Schema Overview

### Core Tables

#### `users` table
- Stores user information including authentication details
- Fields: id, name, email, password_hash, role, bio, avatar_url, etc.
- Primary key: id
- Unique constraint: email
- Indexes: email, role, join_date

#### `projects` table
- Stores project information submitted by users
- Fields: id, title, description, submission_date, user_id, category_id, status, etc.
- Primary key: id
- Foreign keys: user_id (references users), category_id (references project_categories)
- Indexes: user_id, category_id, status, created_at

#### `submissions` table
- Tracks project submissions with files
- Fields: id, project_id, submission_date, file_link, file_name, file_size, status, etc.
- Primary key: id
- Foreign keys: project_id (references projects), reviewer_id (references users)
- Indexes: project_id, submission_date

#### `comments` table
- Stores comments on projects
- Fields: id, project_id, user_id, parent_comment_id, content, etc.
- Primary key: id
- Foreign keys: project_id (references projects), user_id (references users), parent_comment_id (references comments)
- Indexes: project_id, user_id, parent_comment_id

### Additional Tables

- `project_categories`: Defines project categories
- `skills`: Defines available skills
- `user_skills`: Junction table linking users to their skills
- `tags`: Project tags
- `project_tags`: Junction table linking projects to tags
- `project_collaborators`: Links users as collaborators on projects
- `achievements`: User achievements and awards
- `admin_actions`: Logs administrative actions
- `user_sessions`: Manages user sessions

## Key Features of the Schema

### 1. Security
- Passwords are stored as hashes (never plain text)
- Role-based access control with member/moderator/admin roles
- Session management for secure authentication

### 2. Performance
- Strategic indexes on frequently queried columns
- Views for complex aggregations (project_statistics, user_engagement)
- Proper normalization to reduce redundancy

### 3. Data Integrity
- Foreign key constraints to maintain referential integrity
- Check constraints for valid values (e.g., role, status)
- Unique constraints where appropriate

### 4. Extensibility
- JSONB column in admin_actions for flexible metadata storage
- Modular design allowing for easy addition of new features
- Proper separation of concerns in table design

## Useful Queries

### Get all projects with owner information:
```sql
SELECT p.title, p.description, u.name as owner, p.status, p.created_at
FROM projects p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
```

### Get user engagement statistics:
```sql
SELECT * FROM user_engagement WHERE id = $USER_ID;
```

### Get project statistics:
```sql
SELECT * FROM project_statistics WHERE id = $PROJECT_ID;
```

## Maintenance

### Backup
```bash
pg_dump -U postgres tech_innovators_club > backup.sql
```

### Restore
```bash
psql -U postgres tech_innovators_club < backup.sql
```

## Troubleshooting

### Common Issues:

1. **Permission denied**: Make sure the database user has sufficient privileges
2. **Connection refused**: Verify PostgreSQL is running and accessible
3. **Schema conflicts**: Drop and recreate the database if applying schema fails

### Reset Database:
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# In PostgreSQL prompt:
DROP DATABASE tech_innovators_club;
CREATE DATABASE tech_innovators_club;
\q

# Reapply schema
psql -U postgres -d tech_innovators_club -f db/schema.sql
```

## Testing the Schema

To verify that the schema works correctly, run the test queries:

```bash
psql -U postgres -d tech_innovators_club -f db/test_schema.sql
```

This will run a series of tests to verify all tables, relationships, and views are working correctly.