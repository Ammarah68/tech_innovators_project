import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { userService } from '../services/apiService';
import { projectService } from '../services/apiService';
import { authService } from '../services/apiService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user info
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // Get user's projects
        const userProjects = await projectService.getUserProjects(currentUser.id);
        setProjects(userProjects);

        // Get user's achievements
        const userAchievements = await userService.getUserAchievements(currentUser.id);
        setAchievements(userAchievements);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // In a real app, you might want to show an error message to the user
      }
    };

    fetchUserData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6">Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Profile Header */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar 
                sx={{ width: 120, height: 120, fontSize: 40 }} 
                alt={`${user.firstName} ${user.lastName}`}
              >
                {user.firstName.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {user.occupation}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Member since {user.joinDate}
              </Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary">
                Edit Profile
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Profile Details */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <PersonIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary={`${user.firstName} ${user.lastName}`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <EmailIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary={user.email} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <LocationIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary={user.location} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <SchoolIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary={user.education} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <WorkIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary={user.occupation} />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.skills.map((skill, index) => (
                    <Chip 
                      key={index} 
                      label={skill} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={3}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                indicatorColor="primary" 
                textColor="primary"
                centered
              >
                <Tab label="Projects" />
                <Tab label="Achievements" />
                <Tab label="Activity" />
              </Tabs>
              
              <Box sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      My Projects ({projects.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {projects.map((project) => (
                        <Grid item xs={12} key={project.id}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                  <Typography variant="h6">{project.title}</Typography>
                                  <Chip 
                                    label={project.status} 
                                    size="small" 
                                    color={project.status === 'Completed' ? 'success' : 'info'} 
                                    sx={{ mr: 1 }}
                                  />
                                  <Chip 
                                    label={project.category} 
                                    size="small" 
                                    variant="outlined" 
                                    color="primary" 
                                  />
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="body2" color="textSecondary">
                                    {project.likes} likes
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    {project.createdAt}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                {activeTab === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Achievements
                    </Typography>
                    <Grid container spacing={2}>
                      {achievements.map((achievement) => (
                        <Grid item xs={12} key={achievement.id}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CodeIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                                <Box>
                                  <Typography variant="h6">{achievement.title}</Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    {achievement.description}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    Awarded: {achievement.date}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                {activeTab === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Submitted new project: AI-Powered Chatbot" 
                          secondary="2 days ago" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Joined the Tech Innovators Club" 
                          secondary="3 months ago" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Participated in the monthly hackathon" 
                          secondary="1 month ago" 
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;