import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi, roadmapApi } from '../../api';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Interests as InterestsIcon,
  EmojiObjects as GoalIcon,
  TrendingUp as ExperienceIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const RoadmapGenerator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    skills: [],
    interests: [],
    experience_level: 'beginner',
    goal: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileApi.get();
      const data = response.data[0] || {};
      setProfile(data);
      setFormData({
        skills: data.skills || [],
        interests: data.interests || [],
        experience_level: data.experience_level || 'beginner',
        goal: data.goal || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill),
    });
  };

  const handleAddInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData({ ...formData, interests: [...formData.interests, trimmed] });
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    if (!formData.goal.trim()) {
      setError('Please describe your career goal');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Generating your AI-powered roadmap...');

    try {
      await profileApi.createOrUpdate(formData);
      const response = await roadmapApi.generate();
      toast.success('Roadmap generated successfully! 🎉', { id: toastId });
      navigate(`/roadmap/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to generate roadmap. Please try again.', { id: toastId });
      setError(error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        }}
      >
        <Box 
          sx={{ 
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #6C63FF 0%, #3F3D9E 100%)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            🎯 Generate Your Career Roadmap
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            Tell us about yourself and we'll create a personalized AI-powered roadmap
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="primary" /> Skills *
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter a skill (e.g., Python)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddSkill} disabled={!skillInput.trim()} size="small" sx={{ color: '#6C63FF' }}>
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.skills.map((skill) => (
                <Chip key={skill} label={skill} onDelete={() => handleRemoveSkill(skill)} color="primary" deleteIcon={<DeleteIcon />} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InterestsIcon color="secondary" /> Interests
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter an interest (e.g., Web Development)"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddInterest} disabled={!interestInput.trim()} size="small" sx={{ color: '#6C63FF' }}>
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.interests.map((interest) => (
                <Chip key={interest} label={interest} onDelete={() => handleRemoveInterest(interest)} color="secondary" deleteIcon={<DeleteIcon />} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ExperienceIcon color="info" /> Experience Level
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select your experience level</InputLabel>
              <Select
                value={formData.experience_level}
                label="Select your experience level"
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
              >
                <MenuItem value="beginner">🌱 Beginner - Just starting out</MenuItem>
                <MenuItem value="intermediate">🚀 Intermediate - Some experience</MenuItem>
                <MenuItem value="advanced">💪 Advanced - Strong experience</MenuItem>
                <MenuItem value="expert">🏆 Expert - Industry professional</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GoalIcon color="success" /> Career Goal *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="e.g., I want to become a Full Stack Developer specializing in AI applications."
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, borderRadius: 50, mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '🚀 Generate My Roadmap'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default RoadmapGenerator;