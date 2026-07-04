import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roadmapApi, progressApi, stepApi } from '../../api';
import toast from 'react-hot-toast';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const RoadmapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchRoadmapData();
  }, [id]);

  const fetchRoadmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      const roadmapResponse = await roadmapApi.get(id);
      setRoadmap(roadmapResponse.data);
      const stepsData = roadmapResponse.data.steps || [];
      setSteps(stepsData);
      const progressResponse = await roadmapApi.getProgress(id);
      const progressMap = {};
      progressResponse.data.forEach(p => {
        progressMap[p.step] = p.is_completed;
      });
      setProgress(progressMap);
      const firstIncomplete = stepsData.findIndex((_, index) => !progressMap[stepsData[index]?.id]);
      setActiveStep(firstIncomplete !== -1 ? firstIncomplete : 0);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setError('Failed to load roadmap. Please try again.');
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStep = async (stepId, stepIndex) => {
    try {
      await stepApi.toggleComplete(stepId);
      setProgress(prev => ({ ...prev, [stepId]: !prev[stepId] }));
      setSteps(prev => prev.map((step, idx) => idx === stepIndex ? { ...step, is_completed: !step.is_completed } : step));
      const isCompleted = !progress[stepId];
      if (isCompleted) {
        toast.success('🎉 Step completed!');
        const allCompleted = steps.every((_, idx) => {
          const step = steps[idx];
          return idx === stepIndex ? true : progress[step.id];
        });
        if (allCompleted) {
          toast.success('🏆 Congratulations! You completed all steps!');
        }
      } else {
        toast.info('Step marked as incomplete');
      }
    } catch (error) {
      toast.error('Failed to update step');
      console.error('Error toggling step:', error);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const totalSteps = steps.length;
  const completedSteps = Object.values(progress).filter(v => v === true).length;
  const completionPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: roadmap?.title || 'My Career Roadmap',
        text: `Check out my career roadmap: ${roadmap?.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const data = {
      title: roadmap?.title,
      description: roadmap?.description,
      steps: steps.map((step, index) => ({
        step: index + 1,
        title: step.title,
        description: step.description,
        resources: step.resources || [],
        milestones: step.milestones || [],
        estimated_time: step.estimated_time || '',
        completed: progress[step.id] || false,
      })),
      progress: {
        total: totalSteps,
        completed: completedSteps,
        percentage: Math.round(completionPercentage),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadmap-${roadmap?.title || 'career'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Roadmap downloaded!');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography color="textSecondary">Loading your roadmap...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchRoadmapData}>Retry</Button>}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/roadmaps')} sx={{ mt: 2 }}>Back to Roadmaps</Button>
      </Box>
    );
  }

  if (!roadmap) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Roadmap not found</Typography>
        <Button variant="contained" onClick={() => navigate('/roadmaps')} sx={{ mt: 2 }}>View All Roadmaps</Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, mb: 3, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/roadmaps')} sx={{ mb: 2 }}>Back</Button>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>{roadmap.title}</Typography>
            <Typography variant="body1" color="textSecondary" paragraph>{roadmap.description}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Share Roadmap"><IconButton onClick={handleShare} color="primary"><ShareIcon /></IconButton></Tooltip>
            <Tooltip title="Download Roadmap"><IconButton onClick={handleDownload} color="primary"><DownloadIcon /></IconButton></Tooltip>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="textSecondary">Progress: {completedSteps} of {totalSteps} steps</Typography>
            <Typography variant="body2" color="textSecondary">{Math.round(completionPercentage)}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: '#E0E0E0',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #6C63FF, #3F3D9E)',
                borderRadius: 5,
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <Chip icon={<TrophyIcon />} label={`${Math.round(completionPercentage)}% Complete`} color={completionPercentage === 100 ? "success" : "primary"} />
            <Chip icon={<SchoolIcon />} label={`${totalSteps} Steps`} variant="outlined" />
            {roadmap.created_at && <Chip label={`Created: ${new Date(roadmap.created_at).toLocaleDateString()}`} variant="outlined" />}
          </Box>
        </Box>
      </Paper>

      {steps.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No steps available</Typography>
          <Typography color="textSecondary">This roadmap doesn't have any steps yet.</Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.id || index} completed={progress[step.id] || false}>
                  <StepLabel><Typography variant="h6">{step.title}</Typography></StepLabel>
                  <StepContent>
                    <Typography paragraph>{step.description}</Typography>
                    {step.resources && step.resources.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>📚 Resources:</Typography>
                        <List dense>
                          {step.resources.map((resource, i) => (
                            <ListItem key={i}><ListItemIcon><SchoolIcon fontSize="small" /></ListItemIcon><ListItemText primary={resource} /></ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    {step.milestones && step.milestones.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>🎯 Milestones:</Typography>
                        <List dense>
                          {step.milestones.map((milestone, i) => (
                            <ListItem key={i}><ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon><ListItemText primary={milestone} /></ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    {step.estimated_time && <Chip icon={<ScheduleIcon />} label={`Estimated: ${step.estimated_time}`} size="small" variant="outlined" sx={{ mb: 2 }} />}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant={progress[step.id] ? "outlined" : "contained"}
                        color={progress[step.id] ? "success" : "primary"}
                        onClick={() => handleToggleStep(step.id, index)}
                        startIcon={progress[step.id] ? <CheckCircleIcon /> : <UncheckedIcon />}
                      >
                        {progress[step.id] ? 'Completed ✓' : 'Mark as Complete'}
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {steps.map((step, index) => (
              <Accordion
                key={step.id || index}
                expanded={expanded === `panel${index}`}
                onChange={handleAccordionChange(`panel${index}`)}
                sx={{ mb: 1, border: progress[step.id] ? '2px solid #4caf50' : 'none' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    {progress[step.id] ? <CheckCircleIcon color="success" /> : <UncheckedIcon color="action" />}
                    <Typography variant="subtitle1">Step {index + 1}: {step.title}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>{step.description}</Typography>
                  {step.resources && step.resources.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>📚 Resources:</Typography>
                      <List dense>
                        {step.resources.map((resource, i) => (
                          <ListItem key={i}><ListItemIcon><SchoolIcon fontSize="small" /></ListItemIcon><ListItemText primary={resource} /></ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {step.milestones && step.milestones.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>🎯 Milestones:</Typography>
                      <List dense>
                        {step.milestones.map((milestone, i) => (
                          <ListItem key={i}><ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon><ListItemText primary={milestone} /></ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {step.estimated_time && <Chip icon={<ScheduleIcon />} label={`Estimated: ${step.estimated_time}`} size="small" variant="outlined" sx={{ mb: 2 }} />}
                  <Button
                    fullWidth
                    variant={progress[step.id] ? "outlined" : "contained"}
                    color={progress[step.id] ? "success" : "primary"}
                    onClick={() => handleToggleStep(step.id, index)}
                    startIcon={progress[step.id] ? <CheckCircleIcon /> : <UncheckedIcon />}
                    sx={{ mt: 1 }}
                  >
                    {progress[step.id] ? 'Completed ✓' : 'Mark as Complete'}
                  </Button>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {completionPercentage === 100 && (
            <Paper elevation={0} sx={{ p: 4, mt: 4, textAlign: 'center', borderRadius: 4, bgcolor: '#e8f5e9', border: '2px solid #4caf50' }}>
              <TrophyIcon sx={{ fontSize: 60, color: '#4caf50' }} />
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>🎉 Congratulations! 🎉</Typography>
              <Typography variant="body1">You've completed all steps in your {roadmap.title}! You're now one step closer to achieving your career goals.</Typography>
              <Button variant="contained" color="success" onClick={() => navigate('/generate')} sx={{ mt: 2 }}>Create Another Roadmap</Button>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default RoadmapView;