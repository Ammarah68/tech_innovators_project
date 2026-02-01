import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Check as CheckIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { adminService, projectService } from '../services/apiService';

const AdminPanel = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProject, setMenuProject] = useState(null);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Get all projects
        const allProjects = await adminService.getPendingProjects();
        setProjects(allProjects);
        setFilteredProjects(allProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // In a real app, you might want to show an error message to the user
      }
    };

    fetchProjects();
  }, [activeTab]);

  const handleTabChange = async (event, newValue) => {
    setActiveTab(newValue);

    try {
      if (newValue === 0) {
        const pendingProjects = await adminService.getPendingProjects();
        setFilteredProjects(pendingProjects);
      } else if (newValue === 1) {
        const approvedProjects = await adminService.getApprovedProjects();
        setFilteredProjects(approvedProjects);
      } else {
        const rejectedProjects = await adminService.getRejectedProjects();
        setFilteredProjects(rejectedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleApprove = async (project) => {
    try {
      await projectService.approveProject(project.id);

      // Update local state
      setProjects(prev => prev.map(p =>
        p.id === project.id ? { ...p, status: 'approved' } : p
      ));

      if (activeTab === 0) {
        setFilteredProjects(prev => prev.filter(p => p.id !== project.id));
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error approving project:', error);
    }
  };

  const handleReject = async (project) => {
    try {
      await projectService.rejectProject(project.id);

      // Update local state
      setProjects(prev => prev.map(p =>
        p.id === project.id ? { ...p, status: 'rejected' } : p
      ));

      if (activeTab === 0) {
        setFilteredProjects(prev => prev.filter(p => p.id !== project.id));
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error rejecting project:', error);
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setOpenDialog(true);
  };

  const handleOpenMenu = (event, project) => {
    setAnchorEl(event.currentTarget);
    setMenuProject(project);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuProject(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
    setSelectedProject(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPendingCount = () => {
    return projects.filter(p => p.status === 'pending').length;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Admin Panel
            </Typography>
            <Badge badgeContent={getPendingCount()} color="error">
              <Chip 
                label={`Pending Reviews: ${getPendingCount()}`} 
                color="primary" 
                variant="outlined" 
              />
            </Badge>
          </Box>
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            indicatorColor="primary" 
            textColor="primary"
          >
            <Tab label="Pending Reviews" />
            <Tab label="Approved Projects" />
            <Tab label="Rejected Projects" />
          </Tabs>
        </Paper>

        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Likes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell component="th" scope="row">
                      {project.title}
                    </TableCell>
                    <TableCell>{project.author}</TableCell>
                    <TableCell>
                      <Chip 
                        label={project.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>{project.submittedAt}</TableCell>
                    <TableCell>{project.likes}</TableCell>
                    <TableCell>
                      <Chip 
                        label={project.status.charAt(0).toUpperCase() + project.status.slice(1)} 
                        color={getStatusColor(project.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleViewDetails(project)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        aria-controls="actions-menu"
                        aria-haspopup="true"
                        onClick={(e) => handleOpenMenu(e, project)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Action Menu */}
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {menuProject?.status === 'pending' && (
          <>
            <MenuItem onClick={() => { handleApprove(menuProject); handleCloseMenu(); }}>
              <CheckIcon sx={{ mr: 1 }} /> Approve
            </MenuItem>
            <MenuItem onClick={() => { handleReject(menuProject); handleCloseMenu(); }}>
              <ClearIcon sx={{ mr: 1 }} /> Reject
            </MenuItem>
          </>
        )}
        <MenuItem onClick={() => { handleViewDetails(menuProject); handleCloseMenu(); }}>
          <VisibilityIcon sx={{ mr: 1 }} /> View Details
        </MenuItem>
      </Menu>

      {/* Project Details Dialog */}
      <Dialog
        open={Boolean(openDialog)}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle>{selectedProject.title}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="h6" gutterBottom>
                  {selectedProject.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  by {selectedProject.author}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Description:</strong> {selectedProject.description}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Technologies:</strong> {selectedProject.technologies}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Category:</strong> {selectedProject.category}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Submitted:</strong> {selectedProject.submittedAt}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Likes:</strong> {selectedProject.likes}
                </Typography>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              {selectedProject.status === 'pending' && (
                <>
                  <Button 
                    onClick={() => handleReject(selectedProject)} 
                    color="error"
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleApprove(selectedProject)} 
                    variant="contained" 
                    color="success"
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminPanel;