import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    handleMenuClose();
    navigate(path);
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(135deg, #6C63FF 0%, #3F3D9E 100%)',
        boxShadow: '0 4px 20px rgba(108, 99, 255, 0.3)',
      }}
    >
      <Container>
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🚀</span>
            Career AI
          </Typography>

          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  },
                }}
              >
                {isAuthenticated ? (
                  [
                    <MenuItem key="dashboard" onClick={() => handleNavigate('/')}>
                      <DashboardIcon sx={{ mr: 1 }} /> Dashboard
                    </MenuItem>,
                    <MenuItem key="generate" onClick={() => handleNavigate('/generate')}>
                      <TimelineIcon sx={{ mr: 1 }} /> Generate
                    </MenuItem>,
                    <MenuItem key="roadmaps" onClick={() => handleNavigate('/roadmaps')}>
                      <TimelineIcon sx={{ mr: 1 }} /> My Roadmaps
                    </MenuItem>,
                    <MenuItem key="profile" onClick={() => handleNavigate('/profile')}>
                      <PersonIcon sx={{ mr: 1 }} /> Profile
                    </MenuItem>,
                    <MenuItem key="logout" onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1 }} /> Logout
                    </MenuItem>,
                  ]
                ) : (
                  [
                    <MenuItem key="login" onClick={() => handleNavigate('/login')}>
                      Login
                    </MenuItem>,
                    <MenuItem key="register" onClick={() => handleNavigate('/register')}>
                      Register
                    </MenuItem>,
                  ]
                )}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  <Button color="inherit" component={Link} to="/">
                    Dashboard
                  </Button>
                  <Button color="inherit" component={Link} to="/generate">
                    Generate
                  </Button>
                  <Button color="inherit" component={Link} to="/roadmaps">
                    My Roadmaps
                  </Button>
                  <Button color="inherit" component={Link} to="/profile">
                    Profile
                  </Button>
                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                      }}
                    >
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                      {user?.username}
                    </Typography>
                    <Button color="inherit" onClick={logout} sx={{ ml: 1 }}>
                      Logout
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/login">
                    Login
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                    component={Link} 
                    to="/register"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;