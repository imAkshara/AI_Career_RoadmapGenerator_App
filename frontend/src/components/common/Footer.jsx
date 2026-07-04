import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: 'auto',
        backgroundColor: '#2D3748',
        color: 'white',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2026 Career Roadmap AI - Your Path to Success
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
              About
            </Link>
            <Link href="#" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
              Privacy
            </Link>
            <Link href="#" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
              Terms
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;