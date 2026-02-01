const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Achievement = require('./models/Achievement');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample data
const users = [
  {
    fullName: 'Admin User',
    email: 'admin@techinnovators.com',
    password: 'password123',
    role: 'admin',
    bio: 'Administrator of Tech Innovators Club',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB']
  },
  {
    fullName: 'John Doe',
    email: 'john@techinnovators.com',
    password: 'password123',
    bio: 'Full-stack developer passionate about creating innovative solutions',
    location: 'San Francisco, CA',
    education: 'B.S. Computer Science, Stanford University',
    occupation: 'Senior Software Engineer',
    skills: ['React', 'Node.js', 'Python', 'Machine Learning']
  },
  {
    fullName: 'Jane Smith',
    email: 'jane@techinnovators.com',
    password: 'password123',
    bio: 'UI/UX designer and front-end developer',
    location: 'New York, NY',
    education: 'B.A. Design, Parsons School of Design',
    occupation: 'Lead Designer',
    skills: ['UI/UX', 'React', 'Figma', 'CSS']
  }
];

const projects = [
  {
    title: 'AI-Powered Chatbot',
    description: 'An AI chatbot that can answer questions about our products and services. Built with natural language processing and machine learning algorithms.',
    category: 'Machine Learning',
    tags: ['AI', 'NLP', 'JavaScript', 'Python'],
    githubUrl: 'https://github.com/example/ai-chatbot',
    demoUrl: 'https://demo.example.com/chatbot',
    teamMembers: ['John Doe', 'Jane Smith'],
    technologies: 'React, Node.js, TensorFlow, Python',
    challenges: 'Processing natural language efficiently and maintaining context in conversations',
    achievements: 'Won best AI project award in the quarterly showcase',
    status: 'approved'
  },
  {
    title: 'Blockchain Voting System',
    description: 'A secure and transparent voting system using blockchain technology to ensure vote integrity and prevent fraud.',
    category: 'Blockchain',
    tags: ['Blockchain', 'Security', 'Smart Contracts'],
    githubUrl: 'https://github.com/example/blockchain-voting',
    demoUrl: 'https://demo.example.com/voting',
    teamMembers: ['John Doe'],
    technologies: 'Solidity, Ethereum, React, Node.js',
    challenges: 'Ensuring scalability while maintaining security',
    achievements: 'Implemented zero-knowledge proofs for voter privacy',
    status: 'approved'
  },
  {
    title: 'IoT Smart Home Controller',
    description: 'Control your home devices with voice commands and smartphone app. Integrates with various smart home ecosystems.',
    category: 'IoT',
    tags: ['IoT', 'Hardware', 'Voice Control'],
    githubUrl: 'https://github.com/example/iot-home-controller',
    demoUrl: 'https://demo.example.com/iot-home',
    teamMembers: ['Jane Smith'],
    technologies: 'Raspberry Pi, Python, React, MQTT',
    challenges: 'Integrating with multiple smart home protocols',
    achievements: 'Reduced energy consumption by 25% in test homes',
    status: 'pending'
  }
];

const achievements = [
  {
    title: 'Top Contributor',
    description: 'Most active member of the month',
    category: 'participation',
    points: 100
  },
  {
    title: 'Project Showcase Winner',
    description: 'Best project of the quarter',
    category: 'excellence',
    points: 200
  },
  {
    title: 'Innovation Award',
    description: 'Most innovative solution to a real-world problem',
    category: 'innovation',
    points: 300
  }
];

const seedDB = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Achievement.deleteMany();
    
    console.log('Data cleared...');
    
    // Create users
    const createdUsers = await User.insertMany(users);
    
    // Assign user IDs to projects
    const projectsWithOwners = projects.map((project, index) => ({
      ...project,
      owner: createdUsers[index % createdUsers.length]._id
    }));
    
    // Create projects
    await Project.insertMany(projectsWithOwners);
    
    // Create achievements for users
    const achievementsForUsers = [];
    for (let i = 0; i < createdUsers.length; i++) {
      for (let j = 0; j < achievements.length; j++) {
        achievementsForUsers.push({
          ...achievements[j],
          userId: createdUsers[i]._id
        });
      }
    }
    
    await Achievement.insertMany(achievementsForUsers);
    
    console.log('Data seeded successfully...');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();