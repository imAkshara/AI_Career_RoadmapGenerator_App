import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi ${user?.username || 'there'}! 👋 I'm your Career Assistant. Ask me anything about careers, skills, or roadmaps!`,
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: userMessage, sender: 'user' },
    ]);
    setLoading(true);

    try {
      const response = await api.post('chat/', { message: userMessage });
      const botReply = response.data.response || 'Sorry, I could not process that.';
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: botReply, sender: 'bot' },
      ]);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Network error. Please try again.';
      toast.error(errorMsg);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: '⚠️ ' + errorMsg, sender: 'bot' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #6C63FF 0%, #3F3D9E 100%)',
          '&:hover': {
            boxShadow: '0 8px 28px rgba(108, 99, 255, 0.4)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s',
        }}
      >
        <ChatIcon />
      </Fab>

      {/* Chat Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: 600,
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
              <ChatIcon fontSize="small" />
            </Avatar>
            <Typography variant="h6">Career Assistant</Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2, bgcolor: '#f5f7fa', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    maxWidth: '80%',
                    borderRadius: 3,
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                    color: msg.sender === 'user' ? 'white' : '#1a2332',
                    boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(108,99,255,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                    wordBreak: 'break-word',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <CircularProgress size={20} thickness={4} sx={{ color: '#6C63FF' }} />
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            placeholder="Ask about careers, skills, roadmaps..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            inputRef={inputRef}
            disabled={loading}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 50,
                bgcolor: '#f5f7fa',
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: '#ccc', color: 'white' },
            }}
          >
            <SendIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Chatbot;