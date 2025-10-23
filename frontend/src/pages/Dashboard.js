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
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        completionRate: Math.round((requests.filter(req => req.status === 'completed').length / requests.length) * 100) || 0,
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
        <Box sx={{ 
          mt: { xs: 2, md: 4 }, 
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: 400,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 4,
            textAlign: 'center',
          }}>
            <LinearProgress 
              sx={{ 
                mb: 3,
                height: 6,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#764ba2',
                  borderRadius: 3,
                }
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
          <Box sx={{ 
            textAlign: 'center', 
            mb: { xs: 3, md: 5 },
            position: 'relative',
          }}>
            <Typography 
              variant={isMobile ? "h4" : "h2"} 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.8) 90%)',
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
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Welcome to your CSR Volunteer Hub
            </Typography>
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
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 5 } }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Grow
                in={true}
                timeout={800}
                style={{ transitionDelay: `${card.delay}ms` }}
              >
                <Card
                  sx={{
                    height: '100%',
                    minHeight: { xs: 140, md: 160 },
                    backgroundColor: card.backgroundColor,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(255, 255, 255, 0.1)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${card.shadowColor}`,
                      '&::before': {
                        opacity: 1,
                      },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      right: -30,
                      width: 100,
                      height: 100,
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      transform: 'translateY(-50%)',
                    },
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 500,
                            fontSize: { xs: '0.8rem', md: '0.875rem' },
                            mb: 1,
                          }}
                        >
                          {card.title}
                        </Typography>
                        <Typography 
                          variant={isMobile ? "h4" : "h3"} 
                          component="div" 
                          sx={{ 
                            fontWeight: 800,
                            color: 'white',
                            lineHeight: 1,
                          }}
                        >
                          {card.value}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        opacity: 0.8,
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {React.cloneElement(card.icon, { sx: { fontSize: { xs: 32, md: 40 }, color: 'white' } })}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} lg={8}>
            <Fade in={true} timeout={1000} style={{ transitionDelay: '500ms' }}>
              <Card sx={{ mb: { xs: 2, md: 0 } }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Star sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      System Overview
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, mb: 3 }}>
                    Transform your Corporate Social Responsibility initiatives with our intelligent volunteer matching platform. 
                    Connect meaningful opportunities with passionate volunteers seamlessly.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {[
                      { label: '🎯 Smart Matching', color: 'primary' },
                      { label: '📊 Real-time Analytics', color: 'secondary' },
                      { label: '🌍 Global Impact', color: 'success' },
                      { label: '⚡ Instant Updates', color: 'warning' },
                    ].map((chip, index) => (
                      <Chip 
                        key={index}
                        label={chip.label} 
                        color={chip.color} 
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 2,
                          },
                          transition: 'all 0.2s ease',
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Fade in={true} timeout={1000} style={{ transitionDelay: '700ms' }}>
              <Card>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Timeline sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Quick Actions
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { 
                        icon: '📋', 
                        title: 'Manage Requests',
                        desc: 'View and organize volunteer opportunities',
                        backgroundColor: '#667eea'
                      },
                      { 
                        icon: '👥', 
                        title: 'Browse Users',
                        desc: 'Connect with CSR reps and volunteers',
                        backgroundColor: '#48bb78'
                      },
                      { 
                        icon: '📈', 
                        title: 'Track Progress',
                        desc: 'Monitor impact and completion rates',
                        backgroundColor: '#ed8936'
                      },
                    ].map((action, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          backgroundColor: action.backgroundColor,
                          color: 'white',
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Typography sx={{ fontSize: '1.5rem' }}>{action.icon}</Typography>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {action.title}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                              {action.desc}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
