-- Tech Innovators Club Platform - PostgreSQL Database Schema

-- Drop existing tables if they exist (use with caution in production)
DROP TABLE IF EXISTS admin_actions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS project_collaborators CASCADE;
DROP TABLE IF EXISTS project_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS project_categories CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(100),
    education TEXT,
    occupation VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project categories table
CREATE TABLE project_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User skills junction table
CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES project_categories(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
    github_url TEXT,
    demo_url TEXT,
    technologies_used TEXT,
    challenges TEXT,
    achievements TEXT,
    featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project tags junction table
CREATE TABLE project_tags (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, tag_id)
);

-- Project collaborators junction table
CREATE TABLE project_collaborators (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'contributor',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Submissions table
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_link TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'accepted', 'rejected')),
    reviewer_notes TEXT,
    reviewer_id INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    badge_url TEXT,
    category VARCHAR(50) DEFAULT 'participation' CHECK (category IN ('participation', 'excellence', 'innovation', 'leadership', 'community', 'milestone')),
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    awarded_by INTEGER REFERENCES users(id), -- Who awarded this achievement
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin actions table
CREATE TABLE admin_actions (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('project_approved', 'project_rejected', 'user_banned', 'user_unbanned', 'content_removed', 'achievement_granted')),
    target_table VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    reason TEXT,
    metadata JSONB, -- Additional data about the action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table (for session management)
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO project_categories (name, description) VALUES
('Web Development', 'Projects related to web development'),
('Mobile App', 'Mobile application projects'),
('Machine Learning', 'AI and Machine Learning projects'),
('Blockchain', 'Blockchain and cryptocurrency projects'),
('Cybersecurity', 'Security-related projects'),
('IoT', 'Internet of Things projects'),
('Game Development', 'Video game development projects'),
('Data Science', 'Data analysis and visualization projects'),
('DevOps', 'Infrastructure and deployment projects'),
('Other', 'Other technology projects');

-- Insert default skills
INSERT INTO skills (name) VALUES
('JavaScript'), ('Python'), ('Java'), ('C++'), ('React'), ('Node.js'),
('SQL'), ('MongoDB'), ('PostgreSQL'), ('Git'), ('Docker'), ('AWS'),
('Machine Learning'), ('Data Science'), ('UI/UX'), ('Cybersecurity'),
('Blockchain'), ('Mobile Development'), ('DevOps'), ('Cloud Computing');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_join_date ON users(join_date DESC);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_category_id ON projects(category_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_submissions_project_id ON submissions(project_id);
CREATE INDEX idx_submissions_submission_date ON submissions(submission_date DESC);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag_id ON project_tags(tag_id);
CREATE INDEX idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_admin_actions_admin_user_id ON admin_actions(admin_user_id);
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for project statistics
CREATE VIEW project_statistics AS
SELECT 
    p.id,
    p.title,
    p.user_id,
    u.name AS owner_name,
    p.status,
    p.views_count,
    p.likes_count,
    COUNT(c.id) AS comments_count,
    COUNT(s.id) AS submissions_count,
    p.created_at,
    p.updated_at
FROM projects p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN comments c ON p.id = c.project_id
LEFT JOIN submissions s ON p.id = s.project_id
GROUP BY p.id, u.name;

-- Create a view for user engagement
CREATE VIEW user_engagement AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.join_date,
    COUNT(DISTINCT p.id) AS projects_count,
    COUNT(DISTINCT c.id) AS comments_count,
    COUNT(DISTINCT a.id) AS achievements_count,
    SUM(COALESCE(p.views_count, 0)) AS total_project_views,
    SUM(COALESCE(p.likes_count, 0)) AS total_project_likes
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN achievements a ON u.id = a.user_id
GROUP BY u.id;