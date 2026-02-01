-- Tech Innovators Club Platform - Database Initialization Script

-- Connect to the database (run this after creating the schema)
-- \c tech_innovators_club

-- Insert sample users
INSERT INTO users (name, email, password_hash, role, bio, location, education, occupation) VALUES
('Admin User', 'admin@techinnovators.com', '$2b$12$LQv3c10UZy4p9Y2v7VQwVeF.KXS.yGbKIx7JV8yrPtxh3w0yPzF2.', 'admin', 'System administrator', 'San Francisco, CA', 'MS Computer Science', 'System Administrator'),
('John Doe', 'john@techinnovators.com', '$2b$12$LQv3c10UZy4p9Y2v7VQwVeF.KXS.yGbKIx7JV8yrPtxh3w0yPzF2.', 'member', 'Full-stack developer passionate about creating innovative solutions', 'New York, NY', 'BS Computer Science', 'Software Engineer'),
('Jane Smith', 'jane@techinnovators.com', '$2b$12$LQv3c10UZy4p9Y2v7VQwVeF.KXS.yGbKIx7JV8yrPtxh3w0yPzF2.', 'moderator', 'UI/UX designer and front-end developer', 'Los Angeles, CA', 'BA Design', 'Lead Designer'),
('Bob Johnson', 'bob@techinnovators.com', '$2b$12$LQv3c10UZy4p9Y2v7VQwVeF.KXS.yGbKIx7JV8yrPtxh3w0yPzF2.', 'member', 'DevOps engineer with a passion for automation', 'Chicago, IL', 'BS Information Technology', 'DevOps Specialist');

-- Insert sample skills for users
INSERT INTO user_skills (user_id, skill_id, proficiency_level) VALUES
(2, 1, 5), -- John: JavaScript expert
(2, 5, 5), -- John: React expert
(2, 6, 4), -- John: Node.js advanced
(3, 5, 4), -- Jane: React advanced
(3, 15, 5), -- Jane: UI/UX expert
(4, 10, 4), -- Bob: Git advanced
(4, 11, 5), -- Bob: Docker expert
(4, 12, 4); -- Bob: AWS advanced

-- Insert sample projects
INSERT INTO projects (title, description, user_id, category_id, status, github_url, demo_url, technologies_used, featured) VALUES
('AI-Powered Chatbot', 'An AI chatbot that can answer questions about our products and services. Built with natural language processing and machine learning algorithms.', 2, 3, 'approved', 'https://github.com/example/ai-chatbot', 'https://demo.example.com/chatbot', 'React, Node.js, TensorFlow, Python', true),
('Blockchain Voting System', 'A secure and transparent voting system using blockchain technology to ensure vote integrity and prevent fraud.', 2, 4, 'approved', 'https://github.com/example/blockchain-voting', 'https://demo.example.com/voting', 'Solidity, Ethereum, React, Node.js', true),
('IoT Smart Home Controller', 'Control your home devices with voice commands and smartphone app. Integrates with various smart home ecosystems.', 3, 6, 'pending', 'https://github.com/example/iot-home-controller', 'https://demo.example.com/iot-home', 'Raspberry Pi, Python, React, MQTT', false),
('E-commerce Platform', 'A full-featured e-commerce platform with inventory management, payment processing, and analytics.', 4, 1, 'rejected', 'https://github.com/example/ecommerce', 'https://demo.example.com/ecommerce', 'React, Node.js, PostgreSQL, Stripe', false);

-- Insert sample tags
INSERT INTO tags (name) VALUES
('AI'), ('NLP'), ('JavaScript'), ('Python'), ('React'), ('Node.js'),
('Blockchain'), ('Security'), ('Smart Contracts'), ('IoT'), ('Hardware'),
('Voice Control'), ('Web Development'), ('Mobile'), ('Machine Learning');

-- Associate tags with projects
INSERT INTO project_tags (project_id, tag_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), -- AI Chatbot: AI, NLP, JS, Python
(2, 7), (2, 8), (2, 9), (2, 5), -- Blockchain Voting: Blockchain, Security, Smart Contracts, React
(3, 10), (3, 11), (3, 12), (3, 3); -- IoT Controller: IoT, Hardware, Voice Control, JS

-- Insert sample submissions
INSERT INTO submissions (project_id, file_link, file_name, file_size, file_type, status, reviewer_notes) VALUES
(1, '/uploads/ai-chatbot-submission.zip', 'ai-chatbot-submission.zip', 10485760, 'application/zip', 'accepted', 'Excellent implementation with comprehensive documentation'),
(2, '/uploads/blockchain-voting-submission.zip', 'blockchain-voting-submission.zip', 5242880, 'application/zip', 'accepted', 'Robust security implementation'),
(3, '/uploads/iot-controller-submission.zip', 'iot-controller-submission.zip', 2097152, 'application/zip', 'pending', NULL),
(4, '/uploads/ecommerce-submission.zip', 'ecommerce-submission.zip', 15728640, 'application/zip', 'rejected', 'Needs improvement in security implementation');

-- Insert sample comments
INSERT INTO comments (project_id, user_id, content) VALUES
(1, 3, 'This is an impressive project! The NLP implementation is quite sophisticated.'),
(1, 4, 'I wonder if this could be extended to support multiple languages?'),
(2, 4, 'Great security implementation. Have you considered adding multi-signature support?'),
(3, 2, 'Looking forward to seeing this completed. IoT projects are always interesting.');

-- Insert sample achievements
INSERT INTO achievements (user_id, title, description, category, points, awarded_by) VALUES
(2, 'Top Contributor', 'Most active member of the month', 'community', 100, 1),
(2, 'Project Showcase Winner', 'Best project of the quarter', 'excellence', 200, 1),
(3, 'Design Excellence', 'Outstanding UI/UX design', 'excellence', 150, 1),
(4, 'Innovation Award', 'Most innovative solution to a real-world problem', 'innovation', 300, 1);

-- Insert sample admin actions
INSERT INTO admin_actions (admin_user_id, action_type, target_table, target_id, reason, metadata) VALUES
(1, 'project_approved', 'projects', 1, 'Meets community guidelines and technical standards', '{"reviewer": "admin", "score": 95}'),
(1, 'project_approved', 'projects', 2, 'Excellent security implementation', '{"reviewer": "admin", "score": 98}'),
(1, 'project_rejected', 'projects', 4, 'Security vulnerabilities detected', '{"reviewer": "admin", "score": 45}'),
(1, 'achievement_granted', 'achievements', 1, 'Monthly top contributor', '{"category": "community", "points": 100}');

-- Insert sample project collaborators
INSERT INTO project_collaborators (project_id, user_id, role) VALUES
(1, 3, 'designer'), -- Jane helped with design on AI Chatbot
(1, 4, 'devops'),   -- Bob helped with deployment on AI Chatbot
(2, 3, 'security_reviewer'); -- Jane reviewed security on Blockchain Voting

-- Verify data insertion
SELECT 'Users created:' as info, COUNT(*) FROM users;
SELECT 'Projects created:' as info, COUNT(*) FROM projects;
SELECT 'Submissions created:' as info, COUNT(*) FROM submissions;
SELECT 'Comments created:' as info, COUNT(*) FROM comments;
SELECT 'Achievements created:' as info, COUNT(*) FROM achievements;