import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roadmapApi } from '../../api';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  LinearProgress,
  Chip,
  IconButton,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Visibility, Timeline } from '@mui/icons-material';
import toast from 'react-hot-toast';

const RoadmapList = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const response = await roadmapApi.getAll();
      setRoadmaps(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const id = deleteDialog.id;
    if (!id) return;
    try {
      await roadmapApi.delete(id);
      setRoadmaps(roadmaps.filter((r) => r.id !== id));
      toast.success('Roadmap deleted');
    } catch (error) {
      toast.error('Failed to delete roadmap');
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          My Roadmaps
        </Typography>
        <Typography color="textSecondary">
          {roadmaps.length} roadmap{roadmaps.length !== 1 ? 's' : ''} found
        </Typography>
      </Box>

      {roadmaps.length === 0 ? (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #F5F7FA 0%, #EBEEF0 100%)',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ color: '#6C63FF' }}>
            No Roadmaps Yet
          </Typography>
          <Typography color="textSecondary" paragraph>
            Generate your first AI-powered career roadmap
          </Typography>
          <Button variant="contained" component={Link} to="/generate" size="large">
            Get Started
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {roadmaps.map((roadmap) => (
            <Grid item xs={12} md={6} key={roadmap.id}>
              <Card elevation={0} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {roadmap.title}
                    </Typography>
                    <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: roadmap.id })} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {roadmap.description?.slice(0, 150)}...
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={roadmap.completion_percentage || 0}
                        sx={{ 
                          flex: 1, 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: '#E0E0E0',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #6C63FF, #3F3D9E)',
                            borderRadius: 4,
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {roadmap.completion_percentage || 0}%
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={`${roadmap.progress_count?.completed || 0}/${roadmap.progress_count?.total || 0} steps`}
                        sx={{ borderRadius: 2 }}
                      />
                      <Chip
                        size="small"
                        label={new Date(roadmap.created_at).toLocaleDateString()}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    to={`/roadmap/${roadmap.id}`}
                    startIcon={<Visibility />}
                    sx={{ borderRadius: 50 }}
                  >
                    View Roadmap
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
        <DialogTitle>Delete Roadmap?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. Are you sure you want to delete this roadmap?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoadmapList;