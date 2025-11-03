import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Box, Chip, LinearProgress, Paper,
  IconButton, Button, Fade, Grow, useTheme, useMediaQuery, TextField, InputAdornment,
  Tabs, Tab, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  Divider, MenuItem, Tooltip, Badge, Rating
} from '@mui/material';
import {
  People, Assignment, TrendingUp, Refresh, Timeline, Star, LocalFireDepartment, Logout,
  Search, Info, DoneAll, PlaylistAdd, PlaylistRemove, PhoneInTalk, MailOutline, CheckCircle,
  RemoveCircleOutline, Feedback
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data.requests)) return data.requests;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  // last resort: treat object values as a list
  return Object.values(data).filter(Boolean);
};

const CSRDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // ---------- UI state ----------
  const [tab, setTab] = useState(0); // 0 Open, 1 Accepted, 2 Completed, 3 Shortlist
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

  // ---------- Data ----------
  const [requests, setRequests] = useState([]);        // all requests from server
  const [usersCount, setUsersCount] = useState(0);
  const [accepted, setAccepted] = useState([]);        // current CSR accepted
  const [completed, setCompleted] = useState([]);      // current CSR completed
  const [shortlist, setShortlist] = useState([]);      // current CSR shortlist
  

  // ---------- Filters ----------
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Completed history filters
  const [histService, setHistService] = useState('all');
  const [histFrom, setHistFrom] = useState('');
  const [histTo, setHistTo] = useState('');

  // ---------- Request details dialog ----------
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailReq, setDetailReq] = useState(null);

  // ---------- Complete dialog ----------
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeReq, setCompleteReq] = useState(null);
  const [completionNote, setCompletionNote] = useState('');

  // ----------- Derived stats ----------
  const stats = useMemo(() => {
    const totalRequests = requests.length;
    const activeRequests = requests.filter(r => (r.status ?? 'open') === 'open').length;
    const completionRate = requests.length
      ? Math.round((requests.filter(r => r.status === 'completed').length / requests.length) * 100)
      : 0;
    return {
      totalRequests,
      totalUsers: usersCount,
      activeRequests,
      completionRate: completionRate || 0,
    };
  }, [requests, usersCount]);

  // ---------- Fetch ----------
  const fetchAll = async () => {
    try {
      // Get logged-in CSR id
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const csrId = user?.users_id;

      // Use absolute backend URLs to avoid dev-server proxy confusion
      const [
        reqRes,
        usersRes,
        acceptedRes,
        completedRes,
        shortlistRes,
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/help_requests/open').catch((e) => {
          console.error('Error fetching open requests:', e.response?.data || e.message);
          return { data: [] };
        }),
        axios.get('http://localhost:5000/users').catch((e) => {
          console.error('Error fetching users:', e.response?.data || e.message);
          return { data: [] };
        }),
        (csrId ? axios.get(`http://localhost:5000/api/csr/accepted/${csrId}`) : Promise.resolve({ data: [] })).catch((e) => {
          console.error('Error fetching accepted requests:', e.response?.data || e.message);
          return { data: [] };
        }),
        (csrId ? axios.get(`http://localhost:5000/api/csr/completed/${csrId}`) : Promise.resolve({ data: [] })).catch((e) => {
          console.error('Error fetching completed requests:', e.response?.data || e.message);
          return { data: [] };
        }),
        (csrId ? axios.get(`http://localhost:5000/api/csr/shortlist/${csrId}`) : Promise.resolve({ data: [] })).catch((e) => {
          console.error('Error fetching shortlist:', e.response?.data || e.message);
          return { data: [] };
        }),
      ]);

      const requestsData = toArray(reqRes?.data);
      let acceptedData = toArray(acceptedRes?.data).map(r => ({
        id: r.request_id ?? r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        urgency: r.urgency,
        location: r.location,
        category: r.category,
        preferredTime: r.preferredTime ?? r.preferred_time,
        specialRequirements: r.specialRequirements ?? r.special_requirements,
        matchedAt: r.matched_at ?? r.matchedAt,
      }));
      let completedData = toArray(completedRes?.data).map(r => ({
        id: r.request_id ?? r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        urgency: r.urgency,
        location: r.location,
        category: r.category,
        preferredTime: r.preferredTime ?? r.preferred_time,
        specialRequirements: r.specialRequirements ?? r.special_requirements,
        completedAt: r.completed_at ?? r.completedAt,
        feedbackRating: r.feedback_rating ?? r.feedbackRating,
        feedbackComment: r.feedback_comment ?? r.feedbackComment,
        feedbackAnonymous: r.feedback_anonymous ?? r.feedbackAnonymous,
        feedbackSubmittedAt: r.feedback_submitted_at ?? r.feedbackSubmittedAt,
      }));
      let shortlistData = toArray(shortlistRes?.data).map(r => ({
        id: r.id ?? r.request_id,
        title: r.title,
        description: r.description,
        status: r.status,
        urgency: r.urgency,
        location: r.location,
        category: r.category,
        preferredTime: r.preferredTime ?? r.preferred_time,
        specialRequirements: r.specialRequirements ?? r.special_requirements,
      }));

      // Fallback to global lists if CSR-specific lists are empty
      if (!acceptedData.length) {
        const globalAccepted = await axios.get('http://localhost:5000/api/csr/accepted').catch(() => ({ data: [] }));
        acceptedData = toArray(globalAccepted?.data).map(r => ({
          id: r.request_id ?? r.id,
          title: r.title,
          description: r.description,
          status: r.status,
          urgency: r.urgency,
          location: r.location,
          category: r.category,
          preferredTime: r.preferredTime ?? r.preferred_time,
          specialRequirements: r.specialRequirements ?? r.special_requirements,
          matchedAt: r.matched_at ?? r.matchedAt,
        }));
      }
      if (!completedData.length) {
        const globalCompleted = await axios.get('http://localhost:5000/api/csr/completed').catch(() => ({ data: [] }));
        completedData = toArray(globalCompleted?.data).map(r => ({
          id: r.request_id ?? r.id,
          title: r.title,
          description: r.description,
          status: r.status,
          urgency: r.urgency,
          location: r.location,
          category: r.category,
          preferredTime: r.preferredTime ?? r.preferred_time,
          specialRequirements: r.specialRequirements ?? r.special_requirements,
          completedAt: r.completed_at ?? r.completedAt,
          feedbackRating: r.feedback_rating ?? r.feedbackRating,
          feedbackComment: r.feedback_comment ?? r.feedbackComment,
          feedbackAnonymous: r.feedback_anonymous ?? r.feedbackAnonymous,
          feedbackSubmittedAt: r.feedback_submitted_at ?? r.feedbackSubmittedAt,
        }));
      }
      if (!shortlistData.length) {
        const globalShortlist = await axios.get('http://localhost:5000/api/csr/shortlist').catch(() => ({ data: [] }));
        shortlistData = toArray(globalShortlist?.data).map(r => ({
          id: r.id ?? r.request_id,
          title: r.title,
          description: r.description,
          status: r.status,
          urgency: r.urgency,
          location: r.location,
          category: r.category,
          preferredTime: r.preferredTime ?? r.preferred_time,
          specialRequirements: r.specialRequirements ?? r.special_requirements,
        }));
      }

      console.log('CSR Dashboard Raw Responses:', {
        reqRes: Array.isArray(reqRes?.data) ? `${reqRes.data.length} items` : reqRes?.data,
        acceptedRes: Array.isArray(acceptedRes?.data) ? `${acceptedRes.data.length} items` : acceptedRes?.data,
        completedRes: Array.isArray(completedRes?.data) ? `${completedRes.data.length} items` : completedRes?.data,
        shortlistRes: Array.isArray(shortlistRes?.data) ? `${shortlistRes.data.length} items` : shortlistRes?.data,
        usersRes: usersRes?.data
      });
      console.log('CSR Dashboard Processed Data:', {
        requests: requestsData.length,
        accepted: acceptedData.length,
        completed: completedData.length,
        shortlist: shortlistData.length,
        users: Array.isArray(usersRes?.data) ? usersRes.data.length : (usersRes?.data?.count ?? 0)
      });

      setRequests(requestsData);
      setAccepted(acceptedData);
      setCompleted(completedData);
      setShortlist(shortlistData);
      setUsersCount(Array.isArray(usersRes?.data) ? usersRes.data.length : (usersRes?.data?.count ?? 0));
    } catch (e) {
      console.error('CSR Dashboard fetch error:', e);
      console.error('Error details:', e.response?.data || e.message);
      setToast({ open: true, msg: `Failed to fetch data: ${e.response?.data?.error || e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {fetchAll(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  // ---------- Logout ----------
  const handleLogout = async () => {
    try {
      // Call backend logout (will pop session on server if used)
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
    } catch (err) {
      // ignore network error but log it
      console.error('Logout failed:', err);
    } finally {
      // Clear client session and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/', { replace: true });
    }
  };

  // ---------- Filtering logic for Open ----------
  const categories = useMemo(() => {
    const set = new Set();
    requests.forEach(r => r.category && set.add(r.category));
    return ['all', ...Array.from(set)];
  }, [requests]);

  const openFiltered = useMemo(() => {
    return requests
      .filter(r => (r.status ?? 'open') === 'open')
      .filter(r => (category === 'all' ? true : r.category === category))
      .filter(r => {
        if (!urgentOnly) return true;
        // Check if urgency is 'high' or if there's an urgent flag
        return r.urgency === 'high' || r.urgent === true || r.urgency === 'urgent';
      })
      .filter(r => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const text = [r.title, r.description, r.category, r.location].join(' ').toLowerCase();
        return text.includes(q);
      });
  }, [requests, category, urgentOnly, search]);

  // ---------- Actions ----------
  const openDetails = (req) => { setDetailReq(req); setDetailOpen(true); };

  const acceptRequest = async (reqId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      await axios.post(`http://localhost:5000/api/requests/${reqId}/accept`, { csr_id: user?.users_id }).catch(() => {});
      setToast({ open: true, msg: 'Request accepted', severity: 'success' });
      await fetchAll();
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: 'Failed to accept request', severity: 'error' });
    }
  };

  const shortlistRequest = async (reqId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      await axios.post(`http://localhost:5000/api/requests/${reqId}/shortlist`, { csr_id: user?.users_id }).catch(() => {});
      setToast({ open: true, msg: 'Added to shortlist', severity: 'success' });
      await fetchAll();
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: 'Failed to shortlist', severity: 'error' });
    }
  };

  const unshortlistRequest = async (reqId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      await axios.delete(`http://localhost:5000/api/requests/${reqId}/shortlist`, { data: { csr_id: user?.users_id } }).catch(() => {});
      setToast({ open: true, msg: 'Removed from shortlist', severity: 'info' });
      await fetchAll();
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: 'Failed to remove shortlist', severity: 'error' });
    }
  };

  const updateAcceptedStatus = async (reqId, status) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      await axios.patch(`http://localhost:5000/api/csr/accepted/${reqId}`, { status, csr_id: user?.users_id }).catch(() => {});
      setToast({ open: true, msg: 'Status updated', severity: 'success' });
      await fetchAll();
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: 'Failed to update status', severity: 'error' });
    }
  };

  const removeMyself = async (reqId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      await axios.post(`http://localhost:5000/api/csr/accepted/${reqId}/remove`, { csr_id: user?.users_id }).catch(() => {});
      setToast({ open: true, msg: 'Removed from request', severity: 'info' });
      await fetchAll();
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: 'Failed to remove', severity: 'error' });
    }
  };

  const openComplete = (req) => { setCompleteReq(req); setCompletionNote(''); setCompleteOpen(true); };

  const completeRequest = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      await axios.post(`http://localhost:5000/api/csr/accepted/${completeReq.id}/complete`, { note: completionNote, csr_id: user?.users_id }).catch(() => {});
      setToast({ open: true, msg: 'Request completed', severity: 'success' });
      setCompleteOpen(false);
      await fetchAll();
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: 'Failed to complete request', severity: 'error' });
    }
  };

  // ---------- Loading skeleton ----------
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: { xs: 2, md: 4 }, mb: 4, display: 'flex', justifyContent: 'center', minHeight: '60vh', alignItems: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(18px)', borderRadius: 4, p: 4, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 3, height: 6, borderRadius: 3 }} />
            <Typography variant="h6">🚀 Loading your dashboard…</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>Fetching the latest data</Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // ---------- Small UI helpers ----------
  const StatCard = ({ title, value, icon, bg, shadow, delay }) => (
    <Grid item xs={12} sm={6} lg={3}>
      <Grow in timeout={800} style={{ transitionDelay: `${delay}ms` }}>
        <Card sx={{
          height: '100%', minHeight: { xs: 140, md: 160 }, backgroundColor: bg, color: '#fff',
          position: 'relative', overflow: 'hidden', cursor: 'default',
          '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 18px 36px ${shadow}` },
        }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, mb: 1 }}>{title}</Typography>
                <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
              </Box>
              <Box sx={{ opacity: 0.9, background: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 1 }}>
                {icon}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Grid>
  );

  const RequestCard = ({ r, actions }) => (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
        <Box>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{r.title}</Typography>
            {r.urgent && (
              <Chip
                icon={<LocalFireDepartment sx={{ color: '#fff !important' }} />}
                label="Urgent"
                size="small"
                color="error"
                sx={{ color: 'white', fontWeight: 700 }}
              />
            )}
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>{r.description}</Typography>
          <Stack direction="row" gap={1} sx={{ mt: 1.2, flexWrap: 'wrap' }}>
            {r.category && <Chip label={r.category} size="small" variant="outlined" />}
            {r.urgency && (
              <Chip 
                label={`Urgency: ${r.urgency === 'high' ? 'High' : r.urgency === 'medium' ? 'Medium' : r.urgency === 'low' ? 'Low' : r.urgency}`} 
                size="small" 
                color={r.urgency === 'high' ? 'error' : r.urgency === 'medium' ? 'warning' : 'default'}
                variant="outlined"
              />
            )}
            {r.location && <Chip label={r.location} size="small" variant="outlined" />}
            {r.status && <Chip label={r.status} size="small" />}
          </Stack>
          {(r.preferredTime || r.preferred_time) && (
            <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8 }}>
              Preferred Time: {(r.preferredTime || r.preferred_time) || 'Not specified'}
            </Typography>
          )}
          {(r.specialRequirements || r.special_requirements) && (
            <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8, fontStyle: 'italic' }}>
              Special Requirements: {(r.specialRequirements || r.special_requirements)}
            </Typography>
          )}
        </Box>
        <Stack direction="row" gap={1} sx={{ flexShrink: 0 }}>
          {actions}
        </Stack>
      </Stack>
    </Paper>
  );

  // ---------- Render ----------
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
            <Typography variant={isMobile ? 'h4' : 'h2'} component="h1" sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.8) 90%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1,
            }}>
              ✨ CSR Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 2 }}>
              Welcome to your Volunteer Hub
            </Typography>

            <Stack direction="row" justifyContent="center" gap={2}>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { background: 'rgba(255,255,255,0.2)' },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ fontWeight: 700, textTransform: 'none', px: 3, borderRadius: 3 }}
              >
                Logout
              </Button>
            </Stack>
          </Box>
        </Fade>

        {/* Stats */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 5 } }}>
          <StatCard title="Total Requests" value={stats.totalRequests} icon={<Assignment sx={{ fontSize: 40 }} />} bg="#667eea" shadow="rgba(102,126,234,0.4)" delay={100} />
          <StatCard title="Total Users" value={stats.totalUsers} icon={<People sx={{ fontSize: 40 }} />} bg="#48bb78" shadow="rgba(72,187,120,0.4)" delay={200} />
          <StatCard title="Active Requests" value={stats.activeRequests} icon={<LocalFireDepartment sx={{ fontSize: 40 }} />} bg="#ed8936" shadow="rgba(237,137,54,0.4)" delay={300} />
          <StatCard title="Completion Rate" value={`${stats.completionRate}%`} icon={<TrendingUp sx={{ fontSize: 40 }} />} bg="#f56565" shadow="rgba(245,101,101,0.4)" delay={400} />
        </Grid>

        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Open Requests" />
            <Tab label={<Badge color="primary" badgeContent={accepted.length} max={99}>My Accepted</Badge>} />
            <Tab label="My Completed" />
            <Tab label={<Badge color="secondary" badgeContent={shortlist.length} max={99}>My Shortlist</Badge>} />
          </Tabs>
          <Divider />
          <Box sx={{ p: 2.5 }}>
            {/* OPEN */}
            {tab === 0 && (
              <Stack gap={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
                  <TextField
                    placeholder="Search title, description, location…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment> ),
                    sx: {'& input': {
                      color: '#000',
                      '::placeholder': { color: '#666'},
                    }}
                    }}
                  />
                  <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 220 }}>
                    {(['all', ...new Set(requests.map(r => r.category).filter(Boolean))]).map(c => (
                      <MenuItem key={c} value={c}>{c === 'all' ? 'All categories' : c}</MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant={urgentOnly ? 'contained' : 'outlined'}
                    color="error"
                    startIcon={<LocalFireDepartment />}
                    onClick={() => setUrgentOnly(v => !v)}
                  >
                    Urgent only
                  </Button>
                </Stack>

                <Grid container spacing={2}>
                  {openFiltered.map((r) => (
                    <Grid item xs={12} md={6} key={r.id}>
                      <RequestCard
                        r={r}
                        actions={
                          <>
                            <Tooltip title="Details"><IconButton onClick={() => openDetails(r)}><Info /></IconButton></Tooltip>
                            <Tooltip title="Accept"><IconButton color="success" onClick={() => acceptRequest(r.id)}><DoneAll /></IconButton></Tooltip>
                            {shortlist.find(s => s.id === r.id) ? (
                              <Tooltip title="Remove from shortlist"><IconButton color="warning" onClick={() => unshortlistRequest(r.id)}><PlaylistRemove /></IconButton></Tooltip>
                            ) : (
                              <Tooltip title="Shortlist"><IconButton onClick={() => shortlistRequest(r.id)}><PlaylistAdd /></IconButton></Tooltip>
                            )}
                          </>
                        }
                      />
                    </Grid>
                  ))}
                  {openFiltered.length === 0 && (
                    <Box sx={{ p: 4, width: '100%', textAlign: 'center', opacity: 0.8 }}>
                      <Typography>No matching open requests.</Typography>
                    </Box>
                  )}
                </Grid>
              </Stack>
            )}

            {/* MY ACCEPTED */}
            {tab === 1 && (
              <Stack gap={2}>
                {accepted.map(r => (
                  <RequestCard
                    key={r.id}
                    r={r}
                    actions={
                      <>
                        {/* PIN contact details */}
                        <Tooltip title={r.pin?.phone ? `Call ${r.pin.phone}` : 'No phone'}>
                          <span><IconButton disabled={!r.pin?.phone}><PhoneInTalk /></IconButton></span>
                        </Tooltip>
                        <Tooltip title={r.pin?.email ? `Email ${r.pin.email}` : 'No email'}>
                          <span><IconButton disabled={!r.pin?.email}><MailOutline /></IconButton></span>
                        </Tooltip>

                        {/* Status updates */}
                        <TextField
                          select
                          size="small"
                          value={r.csrStatus ?? 'in_progress'}
                          onChange={(e) => updateAcceptedStatus(r.id, e.target.value)}
                          sx={{ minWidth: 160 }}
                        >
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="blocked">Blocked</MenuItem>
                          <MenuItem value="completed">Mark Completed</MenuItem>
                        </TextField>

                        <Tooltip title="Complete with note">
                          <IconButton color="success" onClick={() => openComplete(r)}>
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Remove myself">
                          <IconButton color="error" onClick={() => removeMyself(r.id)}>
                            <RemoveCircleOutline />
                          </IconButton>
                        </Tooltip>
                      </>
                    }
                  />
                ))}
                {accepted.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center', opacity: 0.8 }}>
                    <Typography>You have no accepted requests yet.</Typography>
                  </Box>
                )}               
              </Stack>
            )}

            {/* MY COMPLETED (history with filters) */}
            {tab === 2 && (
              <Stack gap={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
                  <TextField
                    select
                    label="Service Type"
                    value={histService}
                    onChange={(e) => setHistService(e.target.value)}
                    sx={{ minWidth: 220 }}
                  >
                    <MenuItem value="all">All types</MenuItem>
                    {/* If you have fixed service types, list them here */}
                    <MenuItem value="food">Food</MenuItem>
                    <MenuItem value="transport">Transport</MenuItem>
                    <MenuItem value="medical">Medical</MenuItem>
                  </TextField>
                  <TextField label="From" type="date" InputLabelProps={{ shrink: true }} value={histFrom} onChange={e => setHistFrom(e.target.value)} />
                  <TextField label="To" type="date" InputLabelProps={{ shrink: true }} value={histTo} onChange={e => setHistTo(e.target.value)} />
                </Stack>

                <Grid container spacing={2}>
                  {completed
                    .filter(r => histService === 'all' ? true : r.serviceType === histService)
                    .filter(r => {
                      if (!histFrom && !histTo) return true;
                      const d = new Date(r.completedAt);
                      const fromOk = histFrom ? d >= new Date(histFrom) : true;
                      const toOk = histTo ? d <= new Date(histTo + 'T23:59:59') : true;
                      return fromOk && toOk;
                    })
                    .map(r => (
                      <Grid item xs={12} md={6} key={r.id}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
                          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="center" gap={1}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{r.title}</Typography>
                                {r.urgent && (
                                  <Chip
                                    icon={<LocalFireDepartment sx={{ color: '#fff !important' }} />}
                                    label="Urgent"
                                    size="small"
                                    color="error"
                                    sx={{ color: 'white', fontWeight: 700 }}
                                  />
                                )}
                              </Stack>
                              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>{r.description}</Typography>
                              <Stack direction="row" gap={1} sx={{ mt: 1.2, flexWrap: 'wrap' }}>
                                {r.category && <Chip label={r.category} size="small" variant="outlined" />}
                                {r.location && <Chip label={r.location} size="small" variant="outlined" />}
                                {r.status && <Chip label={r.status} size="small" />}
                              </Stack>
                              
                              {/* Feedback Section */}
                              {r.feedbackRating || r.feedbackComment ? (
                                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                  <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                                    <Feedback sx={{ fontSize: 20, opacity: 0.8 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                      PIN Feedback
                                    </Typography>
                                  </Stack>
                                  {r.feedbackRating && (
                                    <Box sx={{ mb: 1 }}>
                                      <Typography variant="caption" sx={{ opacity: 0.8, mr: 1 }}>Rating:</Typography>
                                      <Rating value={r.feedbackRating} readOnly size="small" />
                                    </Box>
                                  )}
                                  {r.feedbackComment && (
                                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', opacity: 0.9 }}>
                                      "{r.feedbackComment}"
                                    </Typography>
                                  )}
                                  {r.feedbackAnonymous && (
                                    <Chip 
                                      label="Anonymous" 
                                      size="small" 
                                      sx={{ mt: 1, opacity: 0.7 }} 
                                      variant="outlined"
                                    />
                                  )}
                                  {r.feedbackSubmittedAt && (
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
                                      Submitted: {new Date(r.feedbackSubmittedAt).toLocaleDateString()}
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                  <Typography variant="caption" sx={{ opacity: 0.6, fontStyle: 'italic' }}>
                                    No feedback received yet
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            <Stack direction="row" gap={1} sx={{ flexShrink: 0 }}>
                            <Chip variant="outlined" color="success" label={`Completed • ${new Date(r.completedAt).toLocaleDateString()}`} />
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Info />}
                                onClick={() => openDetails(r)}
                              sx={{ ml: 1 }}
                            >
                              Details
                            </Button>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))
                  }
                  {completed.length === 0 && (
                    <Box sx={{ p: 4, width: '100%', textAlign: 'center', opacity: 0.8 }}>
                      <Typography>No completed requests yet.</Typography>
                    </Box>
                  )}
                </Grid>
              </Stack>
            )}

            {/* MY SHORTLIST */}
            {tab === 3 && (
              <Stack gap={2}>
                {shortlist.map(r => (
                  <RequestCard
                    key={r.id}
                    r={r}
                    actions={
                      <>
                        <Tooltip title="Details"><IconButton onClick={() => openDetails(r)}><Info /></IconButton></Tooltip>
                        <Tooltip title="Accept"><IconButton color="success" onClick={() => acceptRequest(r.id)}><DoneAll /></IconButton></Tooltip>
                        <Tooltip title="Remove from shortlist"><IconButton color="warning" onClick={() => unshortlistRequest(r.id)}><PlaylistRemove /></IconButton></Tooltip>
                      </>
                    }
                  />
                ))}
                {shortlist.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center', opacity: 0.8 }}>
                    <Typography>Your shortlist is empty.</Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Details dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {detailReq?.title}
          {(detailReq?.urgency === 'high' || detailReq?.urgent) && (
            <Chip color="error" size="small" label="Urgent" sx={{ ml: 1, color: '#fff' }} />
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Stack gap={2}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{detailReq?.description}</Typography>
            
            <Divider />
            
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, opacity: 0.9 }}>Request Information</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
                {detailReq?.category && <Chip label={`Category: ${detailReq.category}`} variant="outlined" />}
                {detailReq?.urgency && (
                  <Chip 
                    label={`Urgency: ${detailReq.urgency === 'high' ? 'High' : detailReq.urgency === 'medium' ? 'Medium' : detailReq.urgency === 'low' ? 'Low' : detailReq.urgency}`}
                    color={detailReq.urgency === 'high' ? 'error' : detailReq.urgency === 'medium' ? 'warning' : 'default'}
                    variant="outlined"
                  />
                )}
                {detailReq?.location && <Chip label={`Location: ${detailReq.location}`} variant="outlined" />}
                {detailReq?.status && <Chip label={`Status: ${detailReq.status}`} color={detailReq.status === 'completed' ? 'success' : detailReq.status === 'open' ? 'primary' : 'default'} />}
              </Stack>
              
              {(detailReq?.preferredTime || detailReq?.preferred_time) && (
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>Preferred Time:</Typography>
                  <Typography variant="body2">{(detailReq?.preferredTime || detailReq?.preferred_time) || 'Not specified'}</Typography>
                </Box>
              )}
              
              {(detailReq?.specialRequirements || detailReq?.special_requirements) && (
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>Special Requirements:</Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {(detailReq?.specialRequirements || detailReq?.special_requirements)}
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Show feedback section for completed requests */}
            {detailReq?.status === 'completed' && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, opacity: 0.9 }}>PIN Feedback</Typography>
                  {detailReq?.feedbackRating || detailReq?.feedbackComment ? (
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {detailReq?.feedbackRating && (
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>Rating:</Typography>
                          <Rating value={detailReq.feedbackRating} readOnly size="small" />
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>({detailReq.feedbackRating}/5)</Typography>
                        </Stack>
                      )}
                      {detailReq?.feedbackComment && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>Comment:</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{detailReq.feedbackComment}</Typography>
                        </Box>
                      )}
                      {detailReq?.feedbackAnonymous && (
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.6, fontStyle: 'italic' }}>
                          (Submitted anonymously)
                        </Typography>
                      )}
                      {detailReq?.feedbackSubmittedAt && (
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.6 }}>
                          Submitted: {new Date(detailReq.feedbackSubmittedAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Typography variant="caption" sx={{ opacity: 0.6, fontStyle: 'italic' }}>
                        No feedback received yet
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </>
            )}
            
            {detailReq?.completedAt && (
              <>
                <Divider />
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Completed: {new Date(detailReq.completedAt).toLocaleString()}
                </Typography>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          {detailReq?.status !== 'completed' && (
          <Button variant="contained" onClick={() => { setDetailOpen(false); acceptRequest(detailReq.id); }}>Accept</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Complete dialog */}
      <Dialog open={completeOpen} onClose={() => setCompleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Complete Request</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Add a short completion note so the PIN and Platform Manager know what was done.
          </Typography>
          <TextField
            autoFocus
            label="Completion note"
            fullWidth
            multiline
            minRows={3}
            value={completionNote}
            onChange={(e) => setCompletionNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={completeRequest}
            disabled={!completionNote.trim()}
          >
            Complete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2400}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CSRDashboard;
