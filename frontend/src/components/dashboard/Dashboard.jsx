import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roadmapApi } from '../../api';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Chip,
  LinearProgress,
  Avatar,
  Stack,
  Fade,
} from '@mui/material';
import {
  AddCircle,
  Timeline,
  FolderOpen,
  CheckCircle,
  Pending,
  School,
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
  });

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const response = await roadmapApi.getAll();
      const data = response.data.results || response.data || [];
      setRoadmaps(data);

      let completed = 0;
      let inProgress = 0;
      data.forEach((roadmap) => {
        const completion = roadmap.completion_percentage || 0;
        if (completion === 100) completed++;
        else if (completion > 0) inProgress++;
      });

      setStats({
        total: data.length,
        completed,
        inProgress,
      });
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={48} thickness={4} sx={{ color: '#6C63FF' }} />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Roadmaps',
      value: stats.total,
      icon: <FolderOpen sx={{ fontSize: 36 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: <Pending sx={{ fontSize: 36 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: <CheckCircle sx={{ fontSize: 36 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Welcome Section */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332', fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
            Welcome back, {user?.username}! 👋
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1.1rem', mt: 0.5 }}>
            Track your career progress and generate new AI-powered roadmaps
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 3,
                background: card.gradient,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'scale(1.02)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
                },
                height: 120,
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                }}
              >
                {card.icon}
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {card.value}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500, fontSize: '1rem' }}>
                  {card.title}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ mb: 5 }}>
        <Button
          variant="contained"
          component={Link}
          to="/generate"
          size="large"
          startIcon={<AddCircle />}
          sx={{
            borderRadius: 50,
            px: 5,
            py: 1.5,
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #6C63FF 0%, #3F3D9E 100%)',
            boxShadow: '0 8px 25px rgba(108, 99, 255, 0.3)',
            '&:hover': {
              boxShadow: '0 12px 35px rgba(108, 99, 255, 0.45)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s',
            flex: 1,
          }}
        >
          Generate New Roadmap
        </Button>
        <Button
          variant="outlined"
          component={Link}
          to="/roadmaps"
          size="large"
          startIcon={<Timeline />}
          sx={{
            borderRadius: 50,
            px: 5,
            py: 1.5,
            fontSize: '1rem',
            borderColor: '#6C63FF',
            color: '#6C63FF',
            '&:hover': {
              borderColor: '#3F3D9E',
              backgroundColor: 'rgba(108, 99, 255, 0.04)',
            },
            flex: 1,
          }}
        >
          View All Roadmaps
        </Button>
      </Stack>

      {/* Recent Roadmaps */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a2332' }}>
        Your Recent Roadmaps
      </Typography>

      {roadmaps.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%)',
            border: '1px dashed #6C63FF',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ color: '#6C63FF', fontWeight: 600 }}>
            No Roadmaps Yet
          </Typography>
          <Typography color="textSecondary" paragraph sx={{ fontSize: '1rem' }}>
            Generate your first AI-powered career roadmap to get started
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/generate"
            size="large"
            sx={{ borderRadius: 50, px: 5 }}
          >
            Get Started
          </Button>
        </Paper>
      ) : (
        // Wider grid – use md={4} for 3 columns, but since container is full width, cards will be wider
        <Grid container spacing={3}>
          {roadmaps.slice(0, 6).map((roadmap) => (
            <Grid item xs={12} sm={6} md={4} key={roadmap.id}>
              <Card
                className="roadmap-card"
                elevation={0}
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(0,0,0,0.04)',
                  backgroundColor: '#fff',
                }}
              >
                <CardContent sx={{ flex: 1, p: 3.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2332', fontSize: '1.15rem' }}>
                    {roadmap.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      mb: 2.5,
                      minHeight: 48,
                      fontSize: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {roadmap.description?.slice(0, 140)}...
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={roadmap.completion_percentage || 0}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 3,
                        backgroundColor: '#e8eaed',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #6C63FF, #3F3D9E)',
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#6C63FF', fontSize: '0.95rem' }}>
                      {roadmap.completion_percentage || 0}%
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip
                      size="medium"
                      icon={<School sx={{ fontSize: 16 }} />}
                      label={`${roadmap.progress_count?.completed || 0}/${roadmap.progress_count?.total || 0} steps`}
                      sx={{ borderRadius: 2, bgcolor: '#f0f2f5', fontSize: '0.85rem', height: 34 }}
                    />
                    <Chip
                      size="medium"
                      label={new Date(roadmap.created_at).toLocaleDateString()}
                      variant="outlined"
                      sx={{ borderRadius: 2, borderColor: '#e0e0e0', fontSize: '0.85rem', height: 34 }}
                    />
                  </Stack>
                </CardContent>
                <CardActions sx={{ p: 3.5, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    to={`/roadmap/${roadmap.id}`}
                    sx={{
                      borderRadius: 50,
                      py: 1.3,
                      fontSize: '0.95rem',
                      background: 'linear-gradient(135deg, #6C63FF 0%, #3F3D9E 100%)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(108, 99, 255, 0.25)',
                      },
                    }}
                  >
                    View Roadmap
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;