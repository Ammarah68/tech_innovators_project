-- Migration script for Tech Innovators Club Platform
-- This script ensures all tables, indexes, and constraints are properly set up

-- Check if the database exists
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'tech_innovators_club') THEN
      RAISE NOTICE 'Database tech_innovators_club does not exist. Please create it first.';
   END IF;
END
$$;

-- Verify all required extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For similarity queries and fuzzy matching

-- Verify all tables exist and have correct structure
DO $$
DECLARE
    table_exists INTEGER;
BEGIN
    -- Check users table
    SELECT COUNT(*) INTO table_exists 
    FROM information_schema.tables 
    WHERE table_name = 'users';
    
    IF table_exists = 0 THEN
        RAISE EXCEPTION 'Table users does not exist';
    ELSE
        RAISE NOTICE '✓ users table exists';
    END IF;

    -- Check projects table
    SELECT COUNT(*) INTO table_exists 
    FROM information_schema.tables 
    WHERE table_name = 'projects';
    
    IF table_exists = 0 THEN
        RAISE EXCEPTION 'Table projects does not exist';
    ELSE
        RAISE NOTICE '✓ projects table exists';
    END IF;

    -- Check submissions table
    SELECT COUNT(*) INTO table_exists 
    FROM information_schema.tables 
    WHERE table_name = 'submissions';
    
    IF table_exists = 0 THEN
        RAISE EXCEPTION 'Table submissions does not exist';
    ELSE
        RAISE NOTICE '✓ submissions table exists';
    END IF;

    -- Check comments table
    SELECT COUNT(*) INTO table_exists 
    FROM information_schema.tables 
    WHERE table_name = 'comments';
    
    IF table_exists = 0 THEN
        RAISE EXCEPTION 'Table comments does not exist';
    ELSE
        RAISE NOTICE '✓ comments table exists';
    END IF;

    -- Check achievements table
    SELECT COUNT(*) INTO table_exists 
    FROM information_schema.tables 
    WHERE table_name = 'achievements';
    
    IF table_exists = 0 THEN
        RAISE EXCEPTION 'Table achievements does not exist';
    ELSE
        RAISE NOTICE '✓ achievements table exists';
    END IF;

    -- Check admin_actions table
    SELECT COUNT(*) INTO table_exists 
    FROM information_schema.tables 
    WHERE table_name = 'admin_actions';
    
    IF table_exists = 0 THEN
        RAISE EXCEPTION 'Table admin_actions does not exist';
    ELSE
        RAISE NOTICE '✓ admin_actions table exists';
    END IF;

    -- Check all required indexes exist
    -- Users indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_email') THEN
        CREATE INDEX idx_users_email ON users(email);
        RAISE NOTICE 'Created index idx_users_email';
    ELSE
        RAISE NOTICE '✓ Index idx_users_email exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_role') THEN
        CREATE INDEX idx_users_role ON users(role);
        RAISE NOTICE 'Created index idx_users_role';
    ELSE
        RAISE NOTICE '✓ Index idx_users_role exists';
    END IF;

    -- Projects indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'projects' AND indexname = 'idx_projects_user_id') THEN
        CREATE INDEX idx_projects_user_id ON projects(user_id);
        RAISE NOTICE 'Created index idx_projects_user_id';
    ELSE
        RAISE NOTICE '✓ Index idx_projects_user_id exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'projects' AND indexname = 'idx_projects_status') THEN
        CREATE INDEX idx_projects_status ON projects(status);
        RAISE NOTICE 'Created index idx_projects_status';
    ELSE
        RAISE NOTICE '✓ Index idx_projects_status exists';
    END IF;

    -- Submissions indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'submissions' AND indexname = 'idx_submissions_project_id') THEN
        CREATE INDEX idx_submissions_project_id ON submissions(project_id);
        RAISE NOTICE 'Created index idx_submissions_project_id';
    ELSE
        RAISE NOTICE '✓ Index idx_submissions_project_id exists';
    END IF;

    -- Comments indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'comments' AND indexname = 'idx_comments_project_id') THEN
        CREATE INDEX idx_comments_project_id ON comments(project_id);
        RAISE NOTICE 'Created index idx_comments_project_id';
    ELSE
        RAISE NOTICE '✓ Index idx_comments_project_id exists';
    END IF;

    -- Verify foreign key constraints
    -- Users table constraints are verified by checking if referenced tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'projects_user_id_fkey') THEN
        ALTER TABLE projects ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint projects_user_id_fkey';
    ELSE
        RAISE NOTICE '✓ Foreign key constraint projects_user_id_fkey exists';
    END IF;

    -- Verify check constraints
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'users_role_check') THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('member', 'moderator', 'admin'));
        RAISE NOTICE 'Added check constraint users_role_check';
    ELSE
        RAISE NOTICE '✓ Check constraint users_role_check exists';
    END IF;

    -- Verify triggers exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created trigger update_users_updated_at';
    ELSE
        RAISE NOTICE '✓ Trigger update_users_updated_at exists';
    END IF;

    -- Verify functions exist
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        RAISE NOTICE 'Created function update_updated_at_column';
    ELSE
        RAISE NOTICE '✓ Function update_updated_at_column exists';
    END IF;

    -- Verify views exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'project_statistics') THEN
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
        RAISE NOTICE 'Created view project_statistics';
    ELSE
        RAISE NOTICE '✓ View project_statistics exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_engagement') THEN
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
        RAISE NOTICE 'Created view user_engagement';
    ELSE
        RAISE NOTICE '✓ View user_engagement exists';
    END IF;

    RAISE NOTICE '✅ All database schema elements verified and/or created successfully!';
END
$$;

-- Insert default categories if they don't exist
INSERT INTO project_categories (name, description) 
SELECT 'Web Development', 'Projects related to web development'
WHERE NOT EXISTS (SELECT 1 FROM project_categories WHERE name = 'Web Development');

INSERT INTO project_categories (name, description) 
SELECT 'Mobile App', 'Mobile application projects'
WHERE NOT EXISTS (SELECT 1 FROM project_categories WHERE name = 'Mobile App');

INSERT INTO project_categories (name, description) 
SELECT 'Machine Learning', 'AI and Machine Learning projects'
WHERE NOT EXISTS (SELECT 1 FROM project_categories WHERE name = 'Machine Learning');

INSERT INTO project_categories (name, description) 
SELECT 'Blockchain', 'Blockchain and cryptocurrency projects'
WHERE NOT EXISTS (SELECT 1 FROM project_categories WHERE name = 'Blockchain');

INSERT INTO project_categories (name, description) 
SELECT 'Cybersecurity', 'Security-related projects'
WHERE NOT EXISTS (SELECT 1 FROM project_categories WHERE name = 'Cybersecurity');

INSERT INTO project_categories (name, description) 
SELECT 'IoT', 'Internet of Things projects'
WHERE NOT EXISTS (SELECT 1 FROM project_categories WHERE name = 'IoT');

INSERT INTO project_categories (name, description) 
SELECT 'Game Development', 'Video game development projects'
WHERE NOT EXISTS (SELECT 1 FROM project_categories WHERE name = 'Game Development');

INSERT INTO project_categories (name, description) 
SELECT 'Data Science', 'Data analysis and visualization projects'
WHERE NOT EXISTS (SELECT 1 FROM project_categories WHERE name = 'Data Science');

INSERT INTO project_categories (name, description) 
SELECT 'DevOps', 'Infrastructure and deployment projects'
WHERE NOT EXISTS (SELECT 1 FROM project_categories WHERE name = 'DevOps');

INSERT INTO project_categories (name, description) 
SELECT 'Other', 'Other technology projects'
WHERE NOT EXISTS (SELECT 1 FROM project_categories WHERE name = 'Other');

-- Insert default skills if they don't exist
INSERT INTO skills (name) 
SELECT 'JavaScript'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'JavaScript');

INSERT INTO skills (name) 
SELECT 'Python'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Python');

INSERT INTO skills (name) 
SELECT 'Java'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Java');

INSERT INTO skills (name) 
SELECT 'C++'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'C++');

INSERT INTO skills (name) 
SELECT 'React'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'React');

INSERT INTO skills (name) 
SELECT 'Node.js'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Node.js');

INSERT INTO skills (name) 
SELECT 'SQL'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'SQL');

INSERT INTO skills (name) 
SELECT 'MongoDB'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'MongoDB');

INSERT INTO skills (name) 
SELECT 'PostgreSQL'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'PostgreSQL');

INSERT INTO skills (name) 
SELECT 'Git'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Git');

-- Final verification
DO $$
BEGIN
    RAISE NOTICE '🔍 Final verification of database setup:';
    RAISE NOTICE 'Total users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Total projects: %', (SELECT COUNT(*) FROM projects);
    RAISE NOTICE 'Total submissions: %', (SELECT COUNT(*) FROM submissions);
    RAISE NOTICE 'Total comments: %', (SELECT COUNT(*) FROM comments);
    RAISE NOTICE 'Total achievements: %', (SELECT COUNT(*) FROM achievements);
    RAISE NOTICE 'Total categories: %', (SELECT COUNT(*) FROM project_categories);
    RAISE NOTICE 'Total skills: %', (SELECT COUNT(*) FROM skills);
    RAISE NOTICE '✅ Database migration and verification complete!';
END
$$;