import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  ListItemText,
  ListItemIcon,
  Checkbox
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ScienceIcon from '@mui/icons-material/Science';
import { projectService } from '../services/apiService';

const ProjectSubmission = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
    githubUrl: '',
    demoUrl: '',
    teamMembers: '',
    technologies: '',
    challenges: '',
    achievements: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Available categories for the project
  const categories = [
    'Web Development',
    'Mobile App',
    'Machine Learning',
    'Blockchain',
    'Cybersecurity',
    'IoT',
    'Game Development',
    'Data Science',
    'DevOps',
    'Other'
  ];

  // Available tags for the project
  const allTags = [
    'React', 'Node.js', 'Python', 'AI', 'ML', 'JavaScript', 
    'TypeScript', 'Java', 'C++', 'Database', 'API', 'UI/UX',
    'Backend', 'Frontend', 'Fullstack', 'Cloud', 'AWS', 'Azure'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleTagChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      tags: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.technologies.trim()) {
      newErrors.technologies = 'Technologies used are required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await projectService.createProject(formData);

      setLoading(false);
      setSuccess(true);

      // Redirect after successful submission
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setLoading(false);
      setErrors({ submit: err.message || 'Project submission failed. Please try again.' });
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ScienceIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography component="h1" variant="h4">
              Submit Your Project
            </Typography>
          </Box>
          
          {success ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Project submitted successfully! Redirecting to dashboard...
            </Alert>
          ) : (
            <>
              {errors.submit && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.submit}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="title"
                  label="Project Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                />
                
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  multiline
                  rows={4}
                  id="description"
                  label="Project Description"
                  name="description"
                  placeholder="Describe your project, its purpose, and what problem it solves..."
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                />
                
                <FormControl fullWidth margin="normal" required error={!!errors.category}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography variant="caption" color="error">
                      {errors.category}
                    </Typography>
                  )}
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="tags-label">Tags</InputLabel>
                  <Select
                    labelId="tags-label"
                    id="tags"
                    name="tags"
                    multiple
                    value={formData.tags}
                    onChange={handleTagChange}
                    input={<OutlinedInput label="Tags" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {allTags.map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        <Checkbox checked={formData.tags.indexOf(tag) > -1} />
                        <ListItemText primary={tag} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="githubUrl"
                  label="GitHub Repository URL"
                  name="githubUrl"
                  placeholder="https://github.com/username/repository"
                  value={formData.githubUrl}
                  onChange={handleChange}
                />
                
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="demoUrl"
                  label="Demo URL (if available)"
                  name="demoUrl"
                  placeholder="https://example.com/demo"
                  value={formData.demoUrl}
                  onChange={handleChange}
                />
                
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="teamMembers"
                  label="Team Members (comma separated)"
                  name="teamMembers"
                  placeholder="John Doe, Jane Smith, Mike Johnson"
                  value={formData.teamMembers}
                  onChange={handleChange}
                />
                
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="technologies"
                  label="Technologies Used"
                  name="technologies"
                  placeholder="React, Node.js, PostgreSQL, etc."
                  value={formData.technologies}
                  onChange={handleChange}
                  error={!!errors.technologies}
                  helperText={errors.technologies}
                />
                
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  multiline
                  rows={3}
                  id="challenges"
                  label="Challenges Faced"
                  name="challenges"
                  placeholder="What challenges did you encounter during development?"
                  value={formData.challenges}
                  onChange={handleChange}
                />
                
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  multiline
                  rows={3}
                  id="achievements"
                  label="Key Achievements"
                  name="achievements"
                  placeholder="What are the key accomplishments of your project?"
                  value={formData.achievements}
                  onChange={handleChange}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? 'Submitting Project...' : 'Submit Project'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ProjectSubmission;