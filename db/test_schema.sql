-- Tech Innovators Club Platform - Database Schema Test Queries

-- Test 1: Verify all tables exist and have proper relationships
SELECT 'Testing Users table...' as test_info;
SELECT COUNT(*) as user_count FROM users;

SELECT 'Testing Projects table...' as test_info;
SELECT COUNT(*) as project_count FROM projects;

SELECT 'Testing Submissions table...' as test_info;
SELECT COUNT(*) as submission_count FROM submissions;

SELECT 'Testing Comments table...' as test_info;
SELECT COUNT(*) as comment_count FROM comments;

SELECT 'Testing Achievements table...' as test_info;
SELECT COUNT(*) as achievement_count FROM achievements;

-- Test 2: Verify foreign key relationships
SELECT 'Testing user-project relationship...' as test_info;
SELECT u.name, COUNT(p.id) as project_count
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
GROUP BY u.id, u.name
ORDER BY project_count DESC;

-- Test 3: Verify project-submission relationship
SELECT 'Testing project-submission relationship...' as test_info;
SELECT pr.title, COUNT(s.id) as submission_count
FROM projects pr
LEFT JOIN submissions s ON pr.id = s.project_id
GROUP BY pr.id, pr.title
ORDER BY submission_count DESC;

-- Test 4: Verify user-comment relationship
SELECT 'Testing user-comment relationship...' as test_info;
SELECT u.name, COUNT(c.id) as comment_count
FROM users u
LEFT JOIN comments c ON u.id = c.user_id
GROUP BY u.id, u.name
HAVING COUNT(c.id) > 0
ORDER BY comment_count DESC;

-- Test 5: Verify project-comment relationship
SELECT 'Testing project-comment relationship...' as test_info;
SELECT pr.title, COUNT(c.id) as comment_count
FROM projects pr
LEFT JOIN comments c ON pr.id = c.project_id
GROUP BY pr.id, pr.title
HAVING COUNT(c.id) > 0
ORDER BY comment_count DESC;

-- Test 6: Verify achievements-user relationship
SELECT 'Testing user-achievement relationship...' as test_info;
SELECT u.name, COUNT(a.id) as achievement_count
FROM users u
LEFT JOIN achievements a ON u.id = a.user_id
GROUP BY u.id, u.name
HAVING COUNT(a.id) > 0
ORDER BY achievement_count DESC;

-- Test 7: Verify admin actions
SELECT 'Testing admin actions...' as test_info;
SELECT u.name as admin_name, aa.action_type, aa.target_table, aa.target_id, aa.reason
FROM admin_actions aa
JOIN users u ON aa.admin_user_id = u.id
ORDER BY aa.created_at DESC;

-- Test 8: Verify project collaborators
SELECT 'Testing project collaborators...' as test_info;
SELECT pr.title, u.name as collaborator_name, pc.role
FROM project_collaborators pc
JOIN projects pr ON pc.project_id = pr.id
JOIN users u ON pc.user_id = u.id
ORDER BY pr.title, pc.role;

-- Test 9: Verify project tags
SELECT 'Testing project tags...' as test_info;
SELECT pr.title, t.name as tag_name
FROM project_tags pt
JOIN projects pr ON pt.project_id = pr.id
JOIN tags t ON pt.tag_id = t.id
ORDER BY pr.title, t.name;

-- Test 10: Verify user skills
SELECT 'Testing user skills...' as test_info;
SELECT u.name, s.name as skill_name, us.proficiency_level
FROM user_skills us
JOIN users u ON us.user_id = u.id
JOIN skills s ON us.skill_id = s.id
ORDER BY u.name, s.name;

-- Test 11: Test the project_statistics view
SELECT 'Testing project_statistics view...' as test_info;
SELECT * FROM project_statistics LIMIT 5;

-- Test 12: Test the user_engagement view
SELECT 'Testing user_engagement view...' as test_info;
SELECT * FROM user_engagement ORDER BY projects_count DESC;

-- Test 13: Test complex query - Top projects by engagement
SELECT 'Testing complex query - Top projects by engagement...' as test_info;
SELECT 
    p.title,
    u.name as owner,
    p.views_count,
    p.likes_count,
    ps.comments_count,
    p.status
FROM projects p
JOIN users u ON p.user_id = u.id
JOIN project_statistics ps ON p.id = ps.id
WHERE p.status = 'approved'
ORDER BY (p.views_count + p.likes_count + ps.comments_count) DESC
LIMIT 5;

-- Test 14: Test complex query - Active users
SELECT 'Testing complex query - Active users...' as test_info;
SELECT 
    u.name,
    u.role,
    ue.projects_count,
    ue.comments_count,
    ue.achievements_count,
    ue.total_project_views
FROM user_engagement ue
JOIN users u ON ue.id = u.id
WHERE u.is_active = true
ORDER BY (ue.projects_count + ue.comments_count + ue.achievements_count) DESC
LIMIT 5;

-- Test 15: Test constraint enforcement (should fail if tried to insert invalid data)
-- Uncomment these one at a time to test constraints:
-- INSERT INTO users (name, email, password_hash, role) VALUES ('Test User', 'test@example.com', 'hash', 'invalid_role');
-- INSERT INTO projects (title, description, user_id) VALUES ('Test Project', 'Description', 999); -- Invalid user_id