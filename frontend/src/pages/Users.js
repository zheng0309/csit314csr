import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  LinearProgress,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  Badge,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person,
  Email,
  Add as AddIcon,
  Star,
  Work,
} from '@mui/icons-material';
import axios from 'axios';

const Users = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'csr rep':
        return 'primary';
      case 'pin':
        return 'success';
      default:
        return 'default';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
              👥 Loading team members...
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
              Gathering user profiles
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
              👥 Team Directory
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
              Connect with CSR representatives and volunteers
            </Typography>
            
            {/* Search and Add User Section */}
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
                placeholder="Search team members..."
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
                Add Team Member
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
                  {filteredUsers.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Total Members
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
                  {filteredUsers.filter(user => user.role === 'CSR Rep').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  CSR Reps
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Fade>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {filteredUsers.map((user, index) => (
            <Grid item xs={12} sm={6} lg={4} key={user.id}>
              <Grow
                in={true}
                timeout={600}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card
                  sx={{
                    height: '100%',
                    minHeight: 280,
                    position: 'relative',
                    overflow: 'visible',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      '& .avatar': {
                        transform: 'scale(1.1)',
                      },
                      '& .profile-btn': {
                        background: '#667eea',
                        color: 'white',
                        transform: 'translateY(-2px)',
                      }
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Background Pattern */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: `${getRoleColor(user.role) === 'primary' ? '#667eea' : 
                                 getRoleColor(user.role) === 'success' ? '#48bb78' : 
                                 getRoleColor(user.role) === 'error' ? '#f56565' : '#764ba2'}`,
                    opacity: 0.1,
                    borderRadius: '0 0 0 100px',
                  }} />
                  
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header with Avatar and Status */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Box sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: '#4caf50',
                            border: '2px solid white',
                          }} />
                        }
                      >
                        <Avatar
                          className="avatar"
                          sx={{
                            width: 64,
                            height: 64,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            background: `${getRoleColor(user.role) === 'primary' ? '#667eea' : 
                                         getRoleColor(user.role) === 'success' ? '#48bb78' : 
                                         getRoleColor(user.role) === 'error' ? '#f56565' : '#764ba2'}`,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          {getInitials(user.name)}
                        </Avatar>
                      </Badge>
                      
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 0.5,
                            fontSize: '1.1rem',
                            lineHeight: 1.3
                          }}
                        >
                          {user.name}
                        </Typography>
                        <Chip
                          icon={<Work sx={{ fontSize: '0.9rem' }} />}
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                      
                      <Star sx={{ 
                        color: '#ffc107', 
                        fontSize: 20,
                        opacity: 0.7 
                      }} />
                    </Box>
                    
                    {/* Contact Info */}
                    <Box sx={{ mb: 3, flexGrow: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        p: 1.5,
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Email sx={{ 
                          fontSize: 18, 
                          color: 'text.secondary', 
                          mr: 1.5,
                          opacity: 0.7 
                        }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: 'text.primary'
                          }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1.5,
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Person sx={{ 
                          fontSize: 18, 
                          color: 'text.secondary', 
                          mr: 1.5,
                          opacity: 0.7 
                        }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: 'text.secondary'
                          }}
                        >
                          ID: #{user.id}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Action Button */}
                    <Button
                      className="profile-btn"
                      fullWidth
                      variant="outlined"
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      View Full Profile
                    </Button>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {filteredUsers.length === 0 && !loading && (
          <Fade in={true} timeout={800}>
            <Paper sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              maxWidth: 500,
              mx: 'auto'
            }}>
              <Box sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <Person sx={{ fontSize: 48, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                {searchTerm ? 'No matching members found' : 'No team members yet'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm 
                  ? 'Try adjusting your search terms or browse all members' 
                  : 'Start building your team by adding new members'}
              </Typography>
              {searchTerm && (
                <Button
                  variant="outlined"
                  onClick={() => setSearchTerm('')}
                  sx={{ mr: 2 }}
                >
                  Clear Search
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  background: '#667eea',
                  '&:hover': {
                    background: '#5a6fd8',
                  }
                }}
              >
                Add Team Member
              </Button>
            </Paper>
          </Fade>
        )}
      </Box>
    </Container>
  );
};

export default Users;
