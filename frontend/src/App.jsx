import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProfileForm from './components/profile/ProfileForm';
import RoadmapGenerator from './components/roadmap/RoadmapGenerator';
import RoadmapList from './components/roadmap/RoadmapList';
import RoadmapView from './components/roadmap/RoadmapView';
import Chatbot from './components/chatbot/Chatbot';
import { Box, CircularProgress } from '@mui/material';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfileForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/generate" 
            element={
              <ProtectedRoute>
                <RoadmapGenerator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/roadmaps" 
            element={
              <ProtectedRoute>
                <RoadmapList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/roadmap/:id" 
            element={
              <ProtectedRoute>
                <RoadmapView />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
      <Chatbot />  {/* ✅ ADD THIS LINE */}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;