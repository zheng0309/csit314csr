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
  Button,
  TextField,
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment,
  Add as AddIcon,
  AccessTime,
  Group,
  Favorite,
} from '@mui/icons-material';
import axios from 'axios';

const VolunteerRequests = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/requests');
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'active':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    return status || 'Open';
  };

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
              🚀 Loading opportunities...
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
              Gathering volunteer requests
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}>
        {/* Enhanced Header Section */}
        <Fade in={true} timeout={800}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: { xs: 4, md: 6 },
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
              }}
            >
              🌟 Volunteer Opportunities
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                mb: 4,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Make a difference in your community
            </Typography>
            
            {/* Search and Add Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              mb: 3
            }}>
              <TextField
                variant="outlined"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(0,0,0,0.6)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  minWidth: { xs: '100%', sm: 350 },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 3,
                    '&:hover': {
                      backgroundColor: '#ffffff',
                    },
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ 
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  minWidth: { xs: '100%', sm: 'auto' },
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Create Opportunity
              </Button>
            </Box>
            
            {/* Stats Summary */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 4,
              flexWrap: 'wrap',
              mt: 3
            }}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                minWidth: 120
              }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {filteredRequests.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Total Requests
                </Typography>
              </Paper>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                minWidth: 120
              }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {filteredRequests.filter(req => !req.status || req.status === 'active').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Active Now
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Fade>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {filteredRequests.map((request, index) => (
            <Grid item xs={12} sm={6} lg={4} key={request.id}>
              <Grow
                in={true}
                timeout={600}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card
                  sx={{
                    height: '100%',
                    minHeight: 320,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                      '& .request-icon': {
                        transform: 'rotate(10deg) scale(1.1)',
                      },
                      '& .action-btn': {
                        background: '#667eea',
                        color: 'white',
                        transform: 'translateY(-2px)',
                      },
                      '& .favorite-btn': {
                        color: '#ff4081',
                        transform: 'scale(1.2)',
                      }
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `${getStatusColor(request.status) === 'success' ? '#48bb78' : 
                                   getStatusColor(request.status) === 'primary' ? '#667eea' : 
                                   getStatusColor(request.status) === 'warning' ? '#ed8936' : '#764ba2'}`,
                    }
                  }}
                >
                  {/* Background Pattern */}
                  <Box sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    background: `${getStatusColor(request.status) === 'success' ? '#48bb78' : 
                                 getStatusColor(request.status) === 'primary' ? '#667eea' : 
                                 getStatusColor(request.status) === 'warning' ? '#ed8936' : '#764ba2'}`,
                    opacity: 0.05,
                    borderRadius: '50%',
                  }} />
                  
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
                        <Box sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: `${getStatusColor(request.status) === 'success' ? 'rgba(72, 187, 120, 0.1)' : 
                                       getStatusColor(request.status) === 'primary' ? 'rgba(102, 126, 234, 0.1)' : 
                                       getStatusColor(request.status) === 'warning' ? 'rgba(237, 137, 54, 0.1)' : 'rgba(118, 75, 162, 0.1)'}`,
                        }}>
                          <Assignment 
                            className="request-icon"
                            sx={{ 
                              fontSize: 24,
                              color: `${getStatusColor(request.status) === 'success' ? '#48bb78' : 
                                      getStatusColor(request.status) === 'primary' ? '#667eea' : 
                                      getStatusColor(request.status) === 'warning' ? '#ed8936' : '#764ba2'}`,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          />
                        </Box>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            lineHeight: 1.3,
                            color: 'text.primary'
                          }}
                        >
                          {request.title}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          label={getStatusLabel(request.status)}
                          color={getStatusColor(request.status)}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                        <Favorite 
                          className="favorite-btn"
                          sx={{ 
                            fontSize: 20,
                            color: 'text.secondary',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              color: '#ff4081',
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    
                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3, 
                        flexGrow: 1,
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {request.description}
                    </Typography>
                    
                    {/* Meta Info */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        mb: 1.5,
                        p: 1.5,
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        borderRadius: 2,
                      }}>
                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                          Posted recently
                        </Typography>
                        <Group sx={{ fontSize: 16, color: 'text.secondary', ml: 'auto' }} />
                        <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                          ID: #{request.id}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button
                        className="action-btn"
                        variant="outlined"
                        fullWidth
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                          minWidth: 'auto',
                          background: '#48bb78',
                          '&:hover': {
                            background: '#38a169',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Apply
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {filteredRequests.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No requests found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? 'Try adjusting your search terms' : 'No volunteer requests available at the moment'}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default VolunteerRequests;
