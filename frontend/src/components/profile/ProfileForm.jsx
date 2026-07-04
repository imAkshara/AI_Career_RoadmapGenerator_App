import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../../api';
import toast from 'react-hot-toast';
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
  Divider,
  IconButton,
  InputAdornment,
  Container,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Interests as InterestsIcon,
  EmojiObjects as GoalIcon,
  TrendingUp as ExperienceIcon,
} from '@mui/icons-material';

const ProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profileId, setProfileId] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    skills: [],
    interests: [],
    experience_level: 'beginner',
    goal: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const response = await profileApi.get();
      if (response.data && response.data.length > 0) {
        const profile = response.data[0];
        setProfileId(profile.id);
        setFormData({
          skills: profile.skills || [],
          interests: profile.interests || [],
          experience_level: profile.experience_level || 'beginner',
          goal: profile.goal || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
      setSkillInput('');
    } else if (formData.skills.includes(trimmed)) {
      toast.error('Skill already added');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill),
    });
  };

  const handleKeyPressSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleAddInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData({ ...formData, interests: [...formData.interests, trimmed] });
      setInterestInput('');
    } else if (formData.interests.includes(trimmed)) {
      toast.error('Interest already added');
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest),
    });
  };

  const handleKeyPressInterest = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.skills.length === 0) {
      setError('Please add at least one skill');
      toast.error('Please add at least one skill');
      return;
    }
    if (!formData.goal.trim()) {
      setError('Please describe your career goal');
      toast.error('Please describe your career goal');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Saving profile...');

    try {
      let response;
      if (profileId) {
        response = await profileApi.update(profileId, formData);
        toast.success('Profile updated successfully! 🎉', { id: toastId });
      } else {
        response = await profileApi.createOrUpdate(formData);
        setProfileId(response.data.id);
        toast.success('Profile created successfully! 🎉', { id: toastId });
      }
      setTimeout(() => navigate('/generate'), 1000);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save profile';
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {profileId ? 'Update Your Profile' : 'Create Your Profile'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {profileId 
                ? 'Update your information to get better roadmap recommendations' 
                : 'Tell us about yourself to generate a personalized career roadmap'}
            </Typography>
          </Box>
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
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Add your current skills (e.g., Python, React, Data Analysis)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter a skill (e.g., Python)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleKeyPressSkill}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleAddSkill}
                        disabled={!skillInput.trim()}
                        size="small"
                        sx={{ color: '#6C63FF' }}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.skills.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ py: 1 }}>
                  No skills added yet. Type a skill and press Enter or click Add.
                </Typography>
              ) : (
                formData.skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    color="primary"
                    deleteIcon={<DeleteIcon />}
                    sx={{ py: 2, borderRadius: 2 }}
                  />
                ))
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InterestsIcon color="secondary" /> Interests
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Add your interests (e.g., Web Development, AI, Data Science)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter an interest (e.g., Web Development)"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyPress={handleKeyPressInterest}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleAddInterest}
                        disabled={!interestInput.trim()}
                        size="small"
                        sx={{ color: '#6C63FF' }}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.interests.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ py: 1 }}>
                  No interests added yet. Type an interest and press Enter or click Add.
                </Typography>
              ) : (
                formData.interests.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    onDelete={() => handleRemoveInterest(interest)}
                    color="secondary"
                    deleteIcon={<DeleteIcon />}
                    sx={{ py: 2, borderRadius: 2 }}
                  />
                ))
              )}
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
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              What's your ultimate career goal? Be specific for better roadmap recommendations.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="e.g., I want to become a Full Stack Developer specializing in AI applications. I aim to build products that use machine learning to solve real-world problems."
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="textSecondary">
              {formData.goal.length}/500 characters
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{ flex: 1, py: 1.5, borderRadius: 50 }}
            >
              {loading 
                ? 'Saving...' 
                : profileId 
                  ? 'Update Profile & Continue' 
                  : 'Create Profile & Continue'
              }
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
              sx={{ py: 1.5, borderRadius: 50, px: 4 }}
            >
              Cancel
            </Button>
          </Box>
        </form>

        <Paper 
          variant="outlined" 
          sx={{ 
            p: 3, 
            mt: 4, 
            borderRadius: 3,
            borderColor: '#6C63FF',
            borderStyle: 'dashed',
            background: 'rgba(108, 99, 255, 0.04)',
          }}
        >
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            💡 Tips for a better roadmap
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><Typography variant="body2" color="textSecondary">Be specific - Instead of "learn programming", say "become a Python developer"</Typography></li>
            <li><Typography variant="body2" color="textSecondary">Add relevant skills - Include both technical and soft skills</Typography></li>
            <li><Typography variant="body2" color="textSecondary">Be honest about experience - This helps AI create achievable roadmaps</Typography></li>
            <li><Typography variant="body2" color="textSecondary">Include interests - This helps tailor the roadmap to what you enjoy</Typography></li>
          </ul>
        </Paper>
      </Paper>
    </Container>
  );
};

export default ProfileForm;