import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  // Mock user state - in real app this would come from context or state management
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  
  const handleLogout = () => {
    // Handle logout logic here
    setIsLoggedIn(false);
  };

  return (
    <AppBar position="static" sx={{ marginBottom: 3 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          Tech Innovators Club
        </Typography>
        
        <Box>
          {!isLoggedIn ? (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/submit-project">
                Submit Project
              </Button>
              <Button color="inherit" component={Link} to="/profile">
                <AccountCircleIcon sx={{ mr: 1 }} />
                Profile
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
          
          {/* Admin link - only visible if user has admin role */}
          <Button color="inherit" component={Link} to="/admin">
            Admin Panel
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;