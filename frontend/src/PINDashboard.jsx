import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Box, Typography, Button, IconButton, Stack, Tabs, Tab, Paper, Divider,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Grid, Chip, MenuItem, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, LinearProgress, Badge, Card, CardContent,
  FormControlLabel, Checkbox, Rating, FormGroup
} from '@mui/material';
import {
  Logout, Refresh, Search, Add, Edit, Delete, Save, Close as CloseIcon,
  ContentCopy, Visibility, Favorite, Phone, Email, Print, CheckCircle,
  Cancel, Warning, History, Feedback, FilterList, Schedule
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Mock mode flag - set to true for development/testing
const USE_MOCKS = false;

// =============================================
// PINDashboard Component
// =============================================
const PINDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0 Active, 1 Completed, 2 History
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ open:false, msg:'', severity:'success' });

  // Data
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);


  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all / open / urgent / completed
  const [dateFilter, setDateFilter] = useState('all'); // all / today / week / month

  // Request dialog state
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null); // null = create
  const [duplicatingRequest, setDuplicatingRequest] = useState(null);
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'normal',
    location: '',
    preferredTime: '',
    specialRequirements: ''
  });
  
  // Feedback dialog state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comment: '',
    anonymous: false
  });

  const fetchPINData = async () => {
    try{
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = user?.users_id || user?.id;
      
      if (!userId) {
        console.warn('User ID not found in localStorage');
        // Don't redirect here - let ProtectedRoute handle authentication
        setActiveRequests([]);
        setCompletedRequests([]);
        setRequestHistory([]);
        setToast({ open:true, msg:'User not found. Please login again.', severity:'error' });
        return;
      }

      // Fetch all requests for this user ONLY
      // Backend endpoint filters by user_id, so should only return this user's requests
      const response = await axios.get(`http://localhost:5000/api/help_requests/${userId}`);
      const allRequests = Array.isArray(response.data) ? response.data : [];
      
      // Double-check: ensure we only show requests belonging to this user
      // (Backend should already filter, but this is an extra safety check)
      const userRequests = allRequests.filter(r => {
        const reqUserId = r.user_id || r.users_id;
        return reqUserId === userId || !reqUserId; // Include only if matches or no user_id (shouldn't happen)
      });
      
      // Normalize request data to match UI expectations
      const normalizedRequests = userRequests.map(r => ({
        id: r.id || r.pin_requests_id,
        title: r.title,
        description: r.description,
        category: r.category || '',
        urgency: r.urgency || 'normal',
        location: r.location || '',
        status: r.status || 'open',
        preferredTime: r.preferred_time || r.preferredTime || '',
        specialRequirements: r.special_requirements || r.specialRequirements || '',
        viewCount: r.view_count || r.viewCount || 0,
        shortlistCount: r.shortlist_count || r.shortlistCount || 0,
        assignedTo: r.assigned_to || r.assignedTo || null,
        contactInfo: r.contact_info || r.contactInfo || null,
        createdAt: r.created_at || r.createdAt,
        updatedAt: r.updated_at || r.updatedAt || r.created_at || r.createdAt,
        completedAt: r.completed_at || r.completedAt,
        feedbackSubmitted: !!(r.feedback_rating || r.feedback_comment || r.feedback_submitted_at)
      }));
      
      // Filter requests by status
      const active = normalizedRequests.filter(r => 
        r.status === 'open' || r.status === 'in-progress' || !r.status || r.status === ''
      );
      const completed = normalizedRequests.filter(r => 
        r.status === 'completed' || r.status === 'closed' || r.completedAt
      );
      
      // History is all requests, sorted by date
      const history = [...normalizedRequests].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
      
      setActiveRequests(active);
      setCompletedRequests(completed);
      setRequestHistory(history);
      
      if (USE_MOCKS) setToast({ open:true, msg:'Mock mode — using sample data', severity:'info' });
    }catch(e){
      console.error('Fetch PIN data error:', e);
      // Don't show error on initial load if it's a 404 or network error
      // Just show empty state
      if (e.response?.status === 404) {
        // User might not have any requests yet - that's okay
        setActiveRequests([]);
        setCompletedRequests([]);
        setRequestHistory([]);
      } else {
        const errorMsg = e.response?.data?.error || e.message || 'Failed to fetch your requests';
        setToast({ open:true, msg: errorMsg, severity:'error' });
        // Still set empty arrays so UI doesn't break
        setActiveRequests([]);
        setCompletedRequests([]);
        setRequestHistory([]);
      }
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchPINData(); },[]);

  const handleRefresh = async ()=>{
    setRefreshing(true);
    await fetchPINData();
    setRefreshing(false);
  };

  const handleLogout = async ()=>{
    try {
      // Call backend logout if endpoint exists
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true }).catch(() => {});
    } catch (err) {
      // Ignore logout errors
    } finally {
      // Clear client session and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      navigate('/', { replace: true });
    }
  };

  // ===== Request CRUD Operations =====
  const openCreateRequest = ()=>{
    setEditingRequest(null);
    setDuplicatingRequest(null);
    setRequestForm({
      title: '',
      description: '',
      category: '',
      urgency: 'normal',
      location: '',
      preferredTime: '',
      specialRequirements: ''
    });
    setRequestDialogOpen(true);
  };

  const openEditRequest = (request)=>{
    setEditingRequest(request);
    setDuplicatingRequest(null);
    setRequestForm({
      title: request.title,
      description: request.description,
      category: request.category,
      urgency: request.urgency || 'normal',
      location: request.location,
      preferredTime: request.preferredTime,
      specialRequirements: request.specialRequirements || ''
    });
    setRequestDialogOpen(true);
  };

  const duplicateRequest = (request)=>{
    setEditingRequest(null);
    setDuplicatingRequest(request);
    setRequestForm({
      title: `${request.title} (Copy)`,
      description: request.description,
      category: request.category,
      urgency: request.urgency || 'normal',
      location: request.location,
      preferredTime: request.preferredTime,
      specialRequirements: request.specialRequirements || ''
    });
    setRequestDialogOpen(true);
  };

  const saveRequest = async ()=>{
    try{
      if (!requestForm.title.trim() || !requestForm.description.trim()) {
        setToast({ open:true, msg:'Title and description are required', severity:'warning' });
        return;
      }

      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = user?.users_id || user?.id;
      
      if (!userId) {
        setToast({ open:true, msg:'User not found. Please login again.', severity:'error' });
        navigate('/', { replace: true });
        return;
      }
      
      // Prepare request payload
      // Map urgency values: 'normal' -> 'medium', 'urgent' -> 'high'
      const urgencyMap = {
        'low': 'low',
        'normal': 'medium',
        'urgent': 'high'
      };
      
      // category_id must be an integer (foreign key) or null
      // Since we're using category names, set category_id to null for now
      // TODO: Map category names to category IDs if needed
      const payload = {
        title: requestForm.title,
        description: requestForm.description,
        user_id: userId,
        urgency: urgencyMap[requestForm.urgency] || 'medium',
        location: requestForm.location || '',
        category_id: requestForm.category_id || null
      };
      
      if (editingRequest){
        console.log('Attempting to edit request:', {
          requestId: editingRequest.id,
          url: `http://localhost:5000/api/help-requests/${editingRequest.id}`,
          payload: payload
        });
        const response = await axios.patch(`http://localhost:5000/api/help-requests/${editingRequest.id}`, payload);
        console.log('Edit response:', response);
        setToast({ open:true, msg:'Request updated successfully', severity:'success' });
      } else if (duplicatingRequest){
        await axios.post('http://localhost:5000/api/help-requests', payload);
        setToast({ open:true, msg:'Request duplicated successfully', severity:'success' });
      } else {
        await axios.post('http://localhost:5000/api/help-requests', payload);
        setToast({ open:true, msg:'Help request created successfully', severity:'success' });
      }
      setRequestDialogOpen(false);
      await fetchPINData();
    }catch(e){
      console.error('Save request error:', e);
      console.error('Error details:', {
        message: e.message,
        response: e.response,
        request: e.config,
        stack: e.stack
      });
      
      if (!e.response) {
        // Network error - server not reachable
        const errorMsg = `Cannot connect to server. Make sure backend is running on http://localhost:5000. Error: ${e.message}`;
        setToast({ open:true, msg: errorMsg, severity:'error' });
      } else {
        const errorMsg = e.response?.data?.error || e.message || 'Failed to save request';
        setToast({ open:true, msg: `${errorMsg} (Status: ${e.response.status})`, severity:'error' });
      }
    }
  };

  const markAsComplete = async (requestId)=>{
    try{
      await axios.patch(`http://localhost:5000/api/help-requests/${requestId}`, { status: 'completed' });
      setToast({ open:true, msg:'Request marked as completed', severity:'success' });
      await fetchPINData();
    }catch(e){
      console.error(e);
      setToast({ open:true, msg:'Failed to update request', severity:'error' });
    }
  };

  const markAsUrgent = async (requestId)=>{
    try{
      await axios.patch(`http://localhost:5000/api/help-requests/${requestId}`, { urgency: 'high' });
      setToast({ open:true, msg:'Request marked as urgent', severity:'warning' });
      await fetchPINData();
    }catch(e){
      console.error(e);
      setToast({ open:true, msg:'Failed to mark as urgent', severity:'error' });
    }
  };

  const cancelRequest = async (requestId)=>{
    try{
      await axios.patch(`http://localhost:5000/api/help-requests/${requestId}`, { status: 'cancelled' });
      setToast({ open:true, msg:'Request cancelled', severity:'info' });
      await fetchPINData();
    }catch(e){
      console.error(e);
      setToast({ open:true, msg:'Failed to cancel request', severity:'error' });
    }
  };

  const deleteRequest = async (requestId)=>{
    try{
      await axios.delete(`http://localhost:5000/api/help-requests/${requestId}`);
      setToast({ open:true, msg:'Request deleted', severity:'info' });
      await fetchPINData();
    }catch(e){
      console.error('Delete error:', e);
      const errorMsg = e.response?.data?.error || e.message || 'Failed to delete request';
      const fullError = `${errorMsg} (ID: ${requestId}, Status: ${e.response?.status || 'N/A'})`;
      setToast({ open:true, msg: fullError, severity:'error' });
    }
  };

  // ===== Feedback Operations =====
  const openFeedback = (request)=>{
    setSelectedRequest(request);
    setFeedbackForm({
      rating: 5,
      comment: '',
      anonymous: false
    });
    setFeedbackDialogOpen(true);
  };

  const submitFeedback = async ()=>{
    try{
      // Validate rating
      if (!feedbackForm.rating || feedbackForm.rating < 1 || feedbackForm.rating > 5) {
        setToast({ open:true, msg:'Please select a rating from 1 to 5 stars', severity:'warning' });
        return;
      }
      
      const response = await axios.post(`http://localhost:5000/api/help-requests/${selectedRequest.id}/feedback`, feedbackForm);
      setToast({ open:true, msg:'Thank you for your feedback!', severity:'success' });
      setFeedbackDialogOpen(false);
      await fetchPINData();
    }catch(e){
      console.error('Submit feedback error:', e);
      const errorMsg = e.response?.data?.error || e.message || 'Failed to submit feedback';
      setToast({ open:true, msg: `Failed to submit feedback: ${errorMsg}`, severity:'error' });
    }
  };

  // ===== Print Request =====
  const printRequest = (request)=>{
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head><title>Help Request - ${request.title}</title></head>
        <body>
          <h1>Help Request: ${request.title}</h1>
          <p><strong>Status:</strong> ${request.status}</p>
          <p><strong>Category:</strong> ${request.category}</p>
          <p><strong>Urgency:</strong> ${request.urgency}</p>
          <p><strong>Location:</strong> ${request.location}</p>
          <p><strong>Preferred Time:</strong> ${request.preferredTime}</p>
          <p><strong>Description:</strong> ${request.description}</p>
          ${request.specialRequirements ? `<p><strong>Special Requirements:</strong> ${request.specialRequirements}</p>` : ''}
          ${request.assignedTo ? `<p><strong>Assigned CSR:</strong> ${request.assignedTo}</p>` : ''}
          ${request.contactInfo ? `<p><strong>Contact:</strong> ${request.contactInfo}</p>` : ''}
          <p><strong>Created:</strong> ${new Date(request.createdAt).toLocaleDateString()}</p>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // ===== Filtered Data =====
  const filteredActiveRequests = useMemo(()=>{
    let list = activeRequests;
    if (searchQuery.trim()){
      const q = searchQuery.toLowerCase();
      list = list.filter(r => `${r.title} ${r.description} ${r.category}`.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all'){
      if (statusFilter === 'urgent') list = list.filter(r => r.urgency === 'urgent');
      else list = list.filter(r => r.status === statusFilter);
    }
    return list;
  }, [activeRequests, searchQuery, statusFilter]);

  const filteredCompletedRequests = useMemo(()=>{
    let list = completedRequests;
    if (searchQuery.trim()){
      const q = searchQuery.toLowerCase();
      list = list.filter(r => `${r.title} ${r.description} ${r.category}`.toLowerCase().includes(q));
    }
    if (dateFilter !== 'all'){
      const now = new Date();
      const filterDate = new Date();
      if (dateFilter === 'today') filterDate.setDate(now.getDate() - 1);
      else if (dateFilter === 'week') filterDate.setDate(now.getDate() - 7);
      else if (dateFilter === 'month') filterDate.setMonth(now.getMonth() - 1);
      
      list = list.filter(r => new Date(r.completedAt) >= filterDate);
    }
    return list;
  }, [completedRequests, searchQuery, dateFilter]);

  // ===== Loading state =====
  if (loading){
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt:4, display:'grid', placeItems:'center', minHeight:'60vh' }}>
          <Box sx={{ width:'100%', maxWidth:420, p:4, borderRadius:3, bgcolor:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)' }}>
            <LinearProgress sx={{ mb:2 }} />
            <Typography variant="h6" align="center">Loading Your Dashboard…</Typography>
            <Typography variant="body2" align="center" sx={{ opacity:0.8 }}>{USE_MOCKS? 'Mock data' : 'Fetching your requests'}</Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // ===== UI =====
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt:3, mb:3, textAlign:'center' }}>
        <Typography variant="h3" sx={{ fontWeight:800, letterSpacing:0.2 }}>
          🙋‍♂️ Person-In-Need Dashboard {USE_MOCKS && <Chip size="small" color="info" label="Mock Mode" sx={{ ml:1 }} />}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity:0.9, mt:0.5 }}>Manage your help requests and track progress</Typography>
        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt:2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={refreshing} sx={{ border:'1px solid rgba(255,255,255,0.2)' }}>
              <Refresh/>
            </IconButton>
          </Tooltip>
          <Button variant="contained" color="primary" startIcon={<Add/>} onClick={openCreateRequest}>
            New Request
          </Button>
          <Button variant="contained" color="error" startIcon={<Logout/>} onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ borderRadius:3, overflow:'hidden', border:'1px solid rgba(255,255,255,0.12)' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Schedule fontSize="small"/> <span>Active Requests</span> <Badge badgeContent={activeRequests.length} color="primary" sx={{ ml:1 }}/></Stack>} />
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><CheckCircle fontSize="small"/> <span>Completed</span> <Badge badgeContent={completedRequests.length} color="success" sx={{ ml:1 }}/></Stack>} />
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><History fontSize="small"/> <span>Request History</span></Stack>} />
        </Tabs>
        <Divider/>

        {/* ACTIVE REQUESTS TAB */}
        {tab===0 && (
          <Box sx={{ p:2.5 }}>
            <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb:2 }}>
              <TextField 
                fullWidth 
                placeholder="Search active requests by title, description, or category" 
                value={searchQuery} 
                onChange={(e)=>setSearchQuery(e.target.value)} 
                InputProps={{ startAdornment:(<InputAdornment position="start"><Search/></InputAdornment>) }} 
              />
              <TextField 
                select 
                label="Filter Status" 
                value={statusFilter} 
                onChange={(e)=>setStatusFilter(e.target.value)} 
                sx={{ minWidth:200 }}
              >
                <MenuItem value="all">All Requests</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
              </TextField>
            </Stack>

            <Grid container spacing={2}>
              {filteredActiveRequests.map(request => (
                <Grid item xs={12} md={6} key={request.id}>
                  <RequestCard 
                    request={request} 
                    onEdit={openEditRequest}
                    onDuplicate={duplicateRequest}
                    onComplete={markAsComplete}
                    onUrgent={markAsUrgent}
                    onCancel={cancelRequest}
                    onDelete={deleteRequest}
                    onPrint={printRequest}
                  />
                </Grid>
              ))}
              {filteredActiveRequests.length===0 && (
                <Box sx={{ p:4, width:'100%', textAlign:'center', opacity:0.8 }}>
                  <Typography variant="h6" sx={{ mb:1 }}>No active requests found</Typography>
                  <Typography sx={{ mb:2 }}>Create your first help request to get started</Typography>
                  <Button variant="contained" startIcon={<Add/>} onClick={openCreateRequest}>
                    Create Request
                  </Button>
                </Box>
              )}
            </Grid>
          </Box>
        )}

        {/* COMPLETED REQUESTS TAB */}
        {tab===1 && (
          <Box sx={{ p:2.5 }}>
            <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb:2 }}>
              <TextField 
                fullWidth 
                placeholder="Search completed requests" 
                value={searchQuery} 
                onChange={(e)=>setSearchQuery(e.target.value)} 
                InputProps={{ startAdornment:(<InputAdornment position="start"><Search/></InputAdornment>) }} 
              />
              <TextField 
                select 
                label="Time Period" 
                value={dateFilter} 
                onChange={(e)=>setDateFilter(e.target.value)} 
                sx={{ minWidth:200 }}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Past Week</MenuItem>
                <MenuItem value="month">Past Month</MenuItem>
              </TextField>
            </Stack>

            <Grid container spacing={2}>
              {filteredCompletedRequests.map(request => (
                <Grid item xs={12} md={6} key={request.id}>
                  <CompletedRequestCard 
                    request={request} 
                    onFeedback={openFeedback}
                    onPrint={printRequest}
                    onDuplicate={duplicateRequest}
                  />
                </Grid>
              ))}
              {filteredCompletedRequests.length===0 && (
                <Box sx={{ p:4, width:'100%', textAlign:'center', opacity:0.8 }}>
                  <Typography>No completed requests found</Typography>
                </Box>
              )}
            </Grid>
          </Box>
        )}

        {/* REQUEST HISTORY TAB */}
        {tab===2 && (
          <Box sx={{ p:2.5 }}>
            <Typography variant="h6" sx={{ mb:2 }}>Your Request History</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius:2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Shortlists</TableCell>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requestHistory.map(request=> (
                    <TableRow key={request.id} hover>
                      <TableCell>{request.title}</TableCell>
                      <TableCell>{request.category}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status} 
                          size="small"
                          color={
                            request.status === 'completed' ? 'success' :
                            request.status === 'cancelled' ? 'error' :
                            request.status === 'in-progress' ? 'primary' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                          <Visibility fontSize="small" sx={{ opacity:0.7 }}/>
                          <span>{request.viewCount || 0}</span>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                          <Favorite fontSize="small" sx={{ opacity:0.7 }}/>
                          <span>{request.shortlistCount || 0}</span>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">{new Date(request.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Duplicate">
                            <IconButton size="small" onClick={()=>duplicateRequest(request)}>
                              <ContentCopy/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print">
                            <IconButton size="small" onClick={()=>printRequest(request)}>
                              <Print/>
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {requestHistory.length===0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py:4, opacity:0.8 }}>
                        No request history available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onClose={()=>setRequestDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight:800 }}>
          {editingRequest ? 'Edit Help Request' : duplicatingRequest ? 'Duplicate Help Request' : 'New Help Request'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt:0.5 }}>
            <TextField 
              label="Request Title" 
              value={requestForm.title} 
              onChange={e=>setRequestForm(f=>({ ...f, title:e.target.value }))} 
              autoFocus 
              required
            />
            <TextField 
              label="Description" 
              value={requestForm.description} 
              onChange={e=>setRequestForm(f=>({ ...f, description:e.target.value }))} 
              multiline 
              minRows={3}
              required
            />
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
            <TextField 
                label="Category" 
                value={requestForm.category} 
                onChange={e=>setRequestForm(f=>({ ...f, category:e.target.value }))} 
                fullWidth
                select
              >
                <MenuItem value="shopping">Shopping Assistance</MenuItem>
                <MenuItem value="transportation">Transportation</MenuItem>
                <MenuItem value="companionship">Companionship</MenuItem>
                <MenuItem value="household">Household Tasks</MenuItem>
                <MenuItem value="technology">Technology Help</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            
              <TextField 
                label="Urgency Level" 
                value={requestForm.urgency} 
                onChange={e=>setRequestForm(f=>({ ...f, urgency:e.target.value }))} 
                fullWidth
                select
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>
            </Stack>
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <TextField 
                label="Location" 
                value={requestForm.location} 
                onChange={e=>setRequestForm(f=>({ ...f, location:e.target.value }))} 
                fullWidth
              />
              <TextField 
                label="Preferred Time" 
                value={requestForm.preferredTime} 
                onChange={e=>setRequestForm(f=>({ ...f, preferredTime:e.target.value }))} 
                fullWidth
              />
            </Stack>
            <TextField 
              label="Special Requirements" 
              value={requestForm.specialRequirements} 
              onChange={e=>setRequestForm(f=>({ ...f, specialRequirements:e.target.value }))} 
              multiline 
              minRows={2}
              placeholder="Any specific needs, preferences, or additional information..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setRequestDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Save/>} onClick={saveRequest}>
            {editingRequest ? 'Update' : 'Create'} Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onClose={()=>setFeedbackDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight:800 }}>Provide Feedback</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt:0.5 }}>
            <Typography variant="h6">{selectedRequest?.title}</Typography>
            <Box>
              <Typography gutterBottom>How would you rate the help you received?</Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Rating 
                  value={feedbackForm.rating} 
                  onChange={(_, value)=>setFeedbackForm(f=>({ ...f, rating:value || 0 }))} 
                  size="large"
                  max={5}
                  precision={1}
                />
                {feedbackForm.rating > 0 && (
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {feedbackForm.rating} {feedbackForm.rating === 1 ? 'star' : 'stars'}
                  </Typography>
                )}
              </Stack>
              <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7 }}>
                Select from 1 to 5 stars
              </Typography>
            </Box>
            <TextField 
              label="Comments (Optional)" 
              value={feedbackForm.comment} 
              onChange={e=>setFeedbackForm(f=>({ ...f, comment:e.target.value }))} 
              multiline 
              minRows={3}
              placeholder="Share your experience with the CSR..."
            />
            <FormGroup>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={feedbackForm.anonymous} 
                    onChange={e=>setFeedbackForm(f=>({ ...f, anonymous:e.target.checked }))} 
                  />
                } 
                label="Submit feedback anonymously" 
              />
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setFeedbackDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Feedback/>} onClick={submitFeedback}>
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={2400} onClose={()=>setToast(t=>({ ...t, open:false }))} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={toast.severity} variant="filled" sx={{ width:'100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </Container>
  );
}

// =============================================
// Request Card Component
// =============================================
function RequestCard({ request, onEdit, onDuplicate, onComplete, onUrgent, onCancel, onDelete, onPrint }){
  return (
    <Paper variant="outlined" sx={{ p:2, borderRadius:2, height:'100%' }}>
      <Stack spacing={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" sx={{ fontWeight:700, flex:1 }}>{request.title}</Typography>
          {request.urgency === 'urgent' && (
            <Chip color="error" label="Urgent" size="small" icon={<Warning/>} />
          )}
        </Stack>

        {/* Status and Stats */}
        <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap' }}>
          {request.category && <Chip label={request.category} size="small" variant="outlined"/>}
          {request.urgency && (
            <Chip 
              label={`Urgency: ${request.urgency === 'high' ? 'High' : request.urgency === 'medium' ? 'Medium' : request.urgency === 'low' ? 'Low' : request.urgency}`}
              size="small" 
              color={request.urgency === 'high' ? 'error' : request.urgency === 'medium' ? 'warning' : 'default'}
              variant="outlined"
            />
          )}
          <Chip label={request.status} size="small" color="primary"/>
          <Chip 
            label={`${request.viewCount || 0} views`} 
            size="small" 
            variant="outlined"
            icon={<Visibility fontSize="small"/>}
          />
          <Chip 
            label={`${request.shortlistCount || 0} shortlists`} 
            size="small" 
            variant="outlined"
            icon={<Favorite fontSize="small"/>}
          />
        </Stack>

        {/* Description */}
        <Typography variant="body2" sx={{ opacity:0.9, minHeight:40 }}>
          {request.description.length > 120 ? `${request.description.substring(0, 120)}...` : request.description}
        </Typography>

        {/* Details */}
        <Stack spacing={0.5}>
          {request.category && (
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" sx={{ opacity:0.7 }}>Category:</Typography>
              <Typography variant="body2">{request.category}</Typography>
            </Stack>
          )}
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" sx={{ opacity:0.7 }}>Urgency:</Typography>
            <Typography variant="body2" sx={{ fontWeight: request.urgency === 'high' || request.urgency === 'urgent' ? 600 : 400 }}>
              {request.urgency === 'high' ? 'High' : request.urgency === 'medium' ? 'Medium' : request.urgency === 'low' ? 'Low' : request.urgency}
            </Typography>
          </Stack>
          {request.location && (
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" sx={{ opacity:0.7 }}>Location:</Typography>
              <Typography variant="body2">{request.location}</Typography>
            </Stack>
          )}
          {request.preferredTime && (
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" sx={{ opacity:0.7 }}>Preferred Time:</Typography>
              <Typography variant="body2">{request.preferredTime}</Typography>
            </Stack>
          )}
          {request.specialRequirements && (
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" sx={{ opacity:0.7 }}>Special Requirements:</Typography>
              <Typography variant="body2">{request.specialRequirements}</Typography>
            </Stack>
          )}
          {request.assignedTo && (
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" sx={{ opacity:0.7 }}>Assigned CSR:</Typography>
              <Typography variant="body2" sx={{ fontWeight:600 }}>{request.assignedTo}</Typography>
            </Stack>
          )}
          {request.contactInfo && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ opacity:0.7 }}>Contact:</Typography>
              <Typography variant="body2">{request.contactInfo}</Typography>
              <Tooltip title="Call">
                <IconButton size="small"><Phone fontSize="small"/></IconButton>
              </Tooltip>
              <Tooltip title="Email">
                <IconButton size="small"><Email fontSize="small"/></IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={1} sx={{ pt:1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={()=>onEdit(request)}>
              <Edit/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate">
            <IconButton size="small" onClick={()=>onDuplicate(request)}>
              <ContentCopy/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Mark Complete">
            <IconButton size="small" color="success" onClick={()=>onComplete(request.id)}>
              <CheckCircle/>
            </IconButton>
          </Tooltip>
          {request.urgency !== 'urgent' && (
            <Tooltip title="Mark as Urgent">
              <IconButton size="small" color="warning" onClick={()=>onUrgent(request.id)}>
                <Warning/>
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Print">
            <IconButton size="small" onClick={()=>onPrint(request)}>
              <Print/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton size="small" color="error" onClick={()=>onCancel(request.id)}>
              <Cancel/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={()=>onDelete(request.id)}>
              <Delete/>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}

// =============================================
// Completed Request Card Component
// =============================================
function CompletedRequestCard({ request, onFeedback, onPrint, onDuplicate }){
  return (
    <Paper variant="outlined" sx={{ p:2, borderRadius:2, height:'100%' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" sx={{ fontWeight:700 }}>{request.title}</Typography>
          <Chip label="Completed" size="small" color="success" />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap' }}>
          {request.category && <Chip label={request.category} size="small" variant="outlined"/>}
          {request.urgency && (
            <Chip 
              label={`Urgency: ${request.urgency === 'high' ? 'High' : request.urgency === 'medium' ? 'Medium' : request.urgency === 'low' ? 'Low' : request.urgency}`}
              size="small" 
              color={request.urgency === 'high' ? 'error' : request.urgency === 'medium' ? 'warning' : 'default'}
              variant="outlined"
            />
          )}
          <Chip 
            label={new Date(request.completedAt).toLocaleDateString()} 
            size="small" 
            variant="outlined"
          />
        </Stack>

        <Typography variant="body2" sx={{ opacity:0.9 }}>
          {request.description.length > 100 ? `${request.description.substring(0, 100)}...` : request.description}
        </Typography>

        {(request.preferredTime || request.preferred_time) && (
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" sx={{ opacity:0.7 }}>Preferred Time:</Typography>
            <Typography variant="body2">{request.preferredTime || request.preferred_time}</Typography>
          </Stack>
        )}
        {(request.specialRequirements || request.special_requirements) && (
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" sx={{ opacity:0.7 }}>Special Requirements:</Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{request.specialRequirements || request.special_requirements}</Typography>
          </Stack>
        )}

        {request.assignedTo && (
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" sx={{ opacity:0.7 }}>Helped by:</Typography>
            <Typography variant="body2" sx={{ fontWeight:600 }}>{request.assignedTo}</Typography>
          </Stack>
        )}

        <Stack direction="row" spacing={1} sx={{ pt:1 }}>
          {!request.feedbackSubmitted && (
            <Tooltip title="Provide Feedback">
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<Feedback/>} 
                onClick={()=>onFeedback(request)}
              >
                Feedback
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Duplicate Request">
            <IconButton size="small" onClick={()=>onDuplicate(request)}>
              <ContentCopy/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton size="small" onClick={()=>onPrint(request)}>
              <Print/>
            </IconButton>
          </Tooltip>
          {request.feedbackSubmitted && (
            <Chip label="Feedback Provided" size="small" color="success" variant="outlined" />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default PINDashboard;