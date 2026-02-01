import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Paper,
  Avatar,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';

const Home = () => {
  const [recentProjects, setRecentProjects] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeProjects: 0,
    completedProjects: 0
  });

  // Mock data initialization
  useEffect(() => {
    // In a real app, this would fetch from an API
    setRecentProjects([
      {
        id: 1,
        title: 'AI-Powered Chatbot',
        author: 'John Doe',
        category: 'Artificial Intelligence',
        likes: 24,
        createdAt: '2023-05-15'
      },
      {
        id: 2,
        title: 'Blockchain Voting System',
        author: 'Jane Smith',
        category: 'Blockchain',
        likes: 18,
        createdAt: '2023-05-10'
      },
      {
        id: 3,
        title: 'IoT Smart Home Controller',
        author: 'Mike Johnson',
        category: 'Internet of Things',
        likes: 32,
        createdAt: '2023-05-05'
      }
    ]);
    
    setStats({
      totalMembers: 124,
      activeProjects: 28,
      completedProjects: 42
    });
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, backgroundColor: '#f0f8ff' }}>
          <Typography variant="h3" gutterBottom align="center" color="primary">
            Welcome to Tech Innovators Club
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" paragraph>
            Connect, collaborate, and innovate with fellow technology enthusiasts
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button 
              variant="contained" 
              size="large" 
              component={Link} 
              to="/submit-project"
              sx={{ mr: 2, mt: 1 }}
            >
              Submit Project
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              component={Link} 
              to="/register"
              sx={{ mt: 1 }}
            >
              Join Our Community
            </Button>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <div>
                    <Typography variant="h5" component="div">
                      {stats.totalMembers}
                    </Typography>
                    <Typography color="textSecondary">
                      Members
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <div>
                    <Typography variant="h5" component="div">
                      {stats.activeProjects}
                    </Typography>
                    <Typography color="textSecondary">
                      Active Projects
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <div>
                    <Typography variant="h5" component="div">
                      {stats.completedProjects}
                    </Typography>
                    <Typography color="textSecondary">
                      Completed Projects
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Projects */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Recent Projects
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {recentProjects.map((project) => (
              <Grid item xs={12} md={4} key={project.id}>
                <Card>
                  <CardContent>
                    <Chip 
                      label={project.category} 
                      size="small" 
                      sx={{ mb: 1 }} 
                      color="primary"
                    />
                    <Typography variant="h6" gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      by {project.author}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {project.likes} likes • {project.createdAt}
                    </Typography>
                    <Button 
                      size="small" 
                      sx={{ mt: 2 }}
                      component={Link}
                      to={`/project/${project.id}`}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;