import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  LinearProgress,
  Paper,
  IconButton,
  Button,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People,
  Assignment,
  TrendingUp,
  Refresh,
  Timeline,
  Star,
  LocalFireDepartment,
  Logout,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';   // 👈 added

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate(); // 👈 navigation hook

  const [stats, setStats] = useState({
    totalRequests: 0,
    totalUsers: 0,
    activeRequests: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [requestsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5001/requests'),
        axios.get('http://localhost:5001/users'),
      ]);

      const requests = requestsRes.data;
      const users = usersRes.data;

      setStats({
        totalRequests: requests.length,
        totalUsers: users.length,
        activeRequests: requests.filter(req => !req.status || req.status === 'active').length,
        completionRate:
          Math.round(
            (requests.filter(req => req.status === 'completed').length / requests.length) * 100
          ) || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  // 👇 Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token'); // if you’re storing JWT/session
    sessionStorage.clear();
    navigate('/'); // go back to login page
  };

  const statCards = [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: <Assignment sx={{ fontSize: 48 }} />,
      backgroundColor: '#667eea',
      shadowColor: 'rgba(102, 126, 234, 0.4)',
      delay: 100,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People sx={{ fontSize: 48 }} />,
      backgroundColor: '#48bb78',
      shadowColor: 'rgba(72, 187, 120, 0.4)',
      delay: 200,
    },
    {
      title: 'Active Requests',
      value: stats.activeRequests,
      icon: <LocalFireDepartment sx={{ fontSize: 48 }} />,
      backgroundColor: '#ed8936',
      shadowColor: 'rgba(237, 137, 54, 0.4)',
      delay: 300,
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      backgroundColor: '#f56565',
      shadowColor: 'rgba(245, 101, 101, 0.4)',
      delay: 400,
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            mt: { xs: 2, md: 4 },
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              p: 4,
              textAlign: 'center',
            }}
          >
            <LinearProgress
              sx={{
                mb: 3,
                height: 6,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#764ba2',
                  borderRadius: 3,
                },
              }}
            />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              🚀 Loading your dashboard...
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
              Fetching the latest data
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}>
        {/* Header Section */}
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              textAlign: 'center',
              mb: { xs: 3, md: 5 },
              position: 'relative',
            }}
          >
            <Typography
              variant={isMobile ? 'h4' : 'h2'}
              component="h1"
              sx={{
                fontWeight: 800,
                background:
                  'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.8) 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                position: 'relative',
              }}
            >
              ✨ Dashboard Overview
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                mb: 2,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Welcome to your CSR Volunteer Hub
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease-in-out',
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              >
                <Refresh />
              </IconButton>

              {/* 👇 Logout button */}
              <Button
                variant="contained"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  borderRadius: 3,
                  '&:hover': { backgroundColor: '#c53030' },
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* rest of your dashboard stays the same */}
        {/* Stats, cards, and quick actions... */}
        {/* ... */}
      </Box>
    </Container>
  );
};

export default Dashboard;
