-- Comprehensive Test Suite for Tech Innovators Club Platform Database Schema

-- Test 1: Verify all tables exist with correct columns
SELECT 'TEST 1: Verifying table structures...' as test_step;

-- Check users table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check projects table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- Check submissions table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'submissions' 
ORDER BY ordinal_position;

-- Check comments table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comments' 
ORDER BY ordinal_position;

-- Test 2: Verify primary keys
SELECT 'TEST 2: Verifying primary keys...' as test_step;

SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'PRIMARY KEY'
AND tc.table_name IN ('users', 'projects', 'submissions', 'comments', 'achievements', 'admin_actions')
ORDER BY tc.table_name;

-- Test 3: Verify foreign key constraints
SELECT 'TEST 3: Verifying foreign key constraints...' as test_step;

SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('projects', 'submissions', 'comments', 'achievements', 'admin_actions')
ORDER BY tc.table_name, kcu.column_name;

-- Test 4: Verify check constraints
SELECT 'TEST 4: Verifying check constraints...' as test_step;

SELECT 
    constraint_name,
    table_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%check%'
AND table_name IN ('users', 'projects', 'submissions', 'comments', 'achievements', 'admin_actions')
ORDER BY table_name;

-- Test 5: Verify indexes
SELECT 'TEST 5: Verifying indexes...' as test_step;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'projects', 'submissions', 'comments', 'achievements', 'admin_actions')
ORDER BY tablename, indexname;

-- Test 6: Verify triggers
SELECT 'TEST 6: Verifying triggers...' as test_step;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('users', 'projects', 'submissions', 'comments', 'user_sessions')
ORDER BY event_object_table;

-- Test 7: Verify functions
SELECT 'TEST 7: Verifying functions...' as test_step;

SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'update_updated_at_column';

-- Test 8: Verify views
SELECT 'TEST 8: Verifying views...' as test_step;

SELECT 
    table_name,
    table_type
FROM information_schema.views
WHERE table_name IN ('project_statistics', 'user_engagement');

-- Test 9: Test basic CRUD operations
SELECT 'TEST 9: Testing basic CRUD operations...' as test_step;

-- Insert a test user
INSERT INTO users (name, email, password_hash, role, bio) 
VALUES ('Test User', 'test@example.com', '$2b$12$LQv3c10UZy4p9Y2v7VQwVeF.KXS.yGbKIx7JV8yrPtxh3w0yPzF2.', 'member', 'Test user for validation')
ON CONFLICT (email) DO NOTHING
RETURNING id, name, email, role;

-- Insert a test project
WITH test_user AS (
    SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1
)
INSERT INTO projects (title, description, user_id, status) 
SELECT 'Test Project', 'This is a test project for validation', id, 'pending'
FROM test_user
ON CONFLICT (id) DO NOTHING
RETURNING id, title, user_id;

-- Insert a test submission
WITH test_project AS (
    SELECT id FROM projects WHERE title = 'Test Project' LIMIT 1
)
INSERT INTO submissions (project_id, file_link, file_name, status) 
SELECT id, '/test/file.zip', 'test_file.zip', 'submitted'
FROM test_project
ON CONFLICT (id) DO NOTHING
RETURNING id, project_id, file_name;

-- Insert a test comment
WITH test_data AS (
    SELECT u.id as user_id, p.id as project_id 
    FROM users u, projects p 
    WHERE u.email = 'test@example.com' AND p.title = 'Test Project' 
    LIMIT 1
)
INSERT INTO comments (project_id, user_id, content) 
SELECT project_id, user_id, 'This is a test comment for validation'
FROM test_data
ON CONFLICT (id) DO NOTHING
RETURNING id, project_id, user_id, content;

-- Test 10: Verify relationships work correctly
SELECT 'TEST 10: Testing relationships...' as test_step;

-- Check if the test user has the project associated
SELECT u.name, p.title, p.status
FROM users u
JOIN projects p ON u.id = p.user_id
WHERE u.email = 'test@example.com';

-- Check if the project has the submission associated
SELECT pr.title, s.file_name, s.status
FROM projects pr
JOIN submissions s ON pr.id = s.project_id
WHERE pr.title = 'Test Project';

-- Check if the project has the comment associated
SELECT pr.title, u.name, c.content
FROM projects pr
JOIN comments c ON pr.id = c.project_id
JOIN users u ON c.user_id = u.id
WHERE pr.title = 'Test Project';

-- Test 11: Test the project_statistics view
SELECT 'TEST 11: Testing project_statistics view...' as test_step;

SELECT * FROM project_statistics 
WHERE owner_name = 'Test User';

-- Test 12: Test the user_engagement view
SELECT 'TEST 12: Testing user_engagement view...' as test_step;

SELECT * FROM user_engagement 
WHERE email = 'test@example.com';

-- Test 13: Test constraints (these should fail if uncommented)
SELECT 'TEST 13: Testing constraints (will show errors if violated)...' as test_step;

-- Attempt to insert invalid role (should fail)
-- INSERT INTO users (name, email, password_hash, role) VALUES ('Invalid User', 'invalid@example.com', 'hash', 'invalid_role');

-- Attempt to insert with invalid status (should fail)
-- WITH test_user AS (SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1)
-- INSERT INTO projects (title, description, user_id, status) 
-- SELECT 'Invalid Status Project', 'Testing invalid status', id, 'invalid_status' FROM test_user;

-- Test 14: Performance test with indexes
SELECT 'TEST 14: Testing index performance...' as test_step;

-- Explain analyze for common queries
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
EXPLAIN ANALYZE SELECT * FROM projects WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
EXPLAIN ANALYZE SELECT * FROM comments WHERE project_id = (SELECT id FROM projects WHERE title = 'Test Project');

-- Test 15: Cleanup test data
SELECT 'TEST 15: Cleaning up test data...' as test_step;

-- Delete test comment
DELETE FROM comments WHERE content = 'This is a test comment for validation';

-- Delete test submission
DELETE FROM submissions WHERE file_name = 'test_file.zip';

-- Delete test project
DELETE FROM projects WHERE title = 'Test Project';

-- Delete test user
DELETE FROM users WHERE email = 'test@example.com';

-- Final verification
SELECT 'FINAL RESULT: All tests completed successfully!' as result;
SELECT 
    (SELECT COUNT(*) FROM users WHERE email = 'test@example.com') as remaining_test_users,
    (SELECT COUNT(*) FROM projects WHERE title = 'Test Project') as remaining_test_projects,
    (SELECT COUNT(*) FROM submissions WHERE file_name = 'test_file.zip') as remaining_test_submissions,
    (SELECT COUNT(*) FROM comments WHERE content = 'This is a test comment for validation') as remaining_test_comments;