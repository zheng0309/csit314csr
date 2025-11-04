import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Container, Box, Typography, Button, IconButton, Stack, Tabs, Tab, Paper, Divider,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Grid, Chip, MenuItem, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, LinearProgress, Badge, Popover, List, ListItem, ListItemText
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Logout, Refresh, Search, Add, Edit, Delete, Save, Close as CloseIcon,
  Category as CategoryIcon, CheckCircle, Replay, FilterList, Timeline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API setup
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
});

// Mock mode flag (set to false for production)
const USE_MOCKS = false;

// =============================================
// Component
// =============================================
export default function PMDashboard(){
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0 Categories, 1 Requests, 2 Analytics
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ open:false, msg:'', severity:'success' });

  // Data
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState({ daily:{}, weekly:{}, monthly:{} });
  const [currentUser, setCurrentUser] = useState(null);

  // Category filters/search
  const [catQuery, setCatQuery] = useState('');
  const [catUsageFilter, setCatUsageFilter] = useState('all'); // all / active / unused / high

  // Category dialog state
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null); // null = create
  const [catForm, setCatForm] = useState({ name:'', description:'', active:true });

  // Request filters
  const [reqQuery, setReqQuery] = useState('');
  const [reqStatus, setReqStatus] = useState('all'); // all/open/closed/completed/unassigned

  const fetchAll = async () => {
    try{
      // Get logged-in user
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      setCurrentUser(user);  // Store user info for display
      
      const [catRes, reqRes, anRes] = await Promise.all([
        api.get('/api/pm/categories'),
        api.get('/api/pm/requests'),
        api.get('/api/pm/analytics'),
      ]);
      setCategories(Array.isArray(catRes.data) ? catRes.data : (catRes.data?.items||[]));
      setRequests(Array.isArray(reqRes.data) ? reqRes.data : (reqRes.data?.items||[]));
      setAnalytics(anRes.data || {});
      if (USE_MOCKS) setToast({ open:true, msg:'Mock mode — backend not required', severity:'info' });
    }catch(e){
      console.error(e);
      setToast({ open:true, msg:'Failed to fetch data', severity:'error' });
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchAll(); },[]);

  const handleRefresh = async ()=>{
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const handleLogout = ()=>{
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/', { replace:true });
  };

  // ===== Category CRUD =====
  const openCreateCat = ()=>{ setEditingCat(null); setCatForm({ name:'', description:'', active:true }); setCatDialogOpen(true); };
  const openEditCat = (cat)=>{ setEditingCat(cat); setCatForm({ name:cat.name, description:cat.description, active:!!cat.active }); setCatDialogOpen(true); };
  const saveCat = async ()=>{
    try{
      if (!catForm.name.trim()) { setToast({ open:true, msg:'Name is required', severity:'warning' }); return; }
      if (editingCat){
        await api.patch(`/api/pm/categories/${editingCat.id}`, catForm);
        setToast({ open:true, msg:'Category updated', severity:'success' });
      } else {
        await api.post('/api/pm/categories', catForm);
        setToast({ open:true, msg:'Category created', severity:'success' });
      }
      setCatDialogOpen(false);
      await fetchAll();
    }catch(e){ console.error(e); setToast({ open:true, msg:'Save failed', severity:'error' }); }
  };
  const deleteCat = async (id)=>{
    try{ await api.delete(`/api/pm/categories/${id}`); setToast({ open:true, msg:'Category deleted', severity:'info' }); await fetchAll(); }
    catch(e){ console.error(e); setToast({ open:true, msg:'Delete failed', severity:'error' }); }
  };

  const filteredCategories = useMemo(()=>{
    let list = categories;
    if (catQuery.trim()){
      const q = catQuery.toLowerCase();
      list = list.filter(c => `${c.name} ${c.description}`.toLowerCase().includes(q));
    }
    if (catUsageFilter !== 'all'){
      if (catUsageFilter==='unused') list = list.filter(c => (c.usageCount||0) === 0);
      if (catUsageFilter==='active') list = list.filter(c => c.active);
      if (catUsageFilter==='high') list = list.filter(c => (c.usageCount||0) >= 10);
    }
    return list;
  }, [categories, catQuery, catUsageFilter]);

  // ===== Requests =====
  const setStatus = async (req, next)=>{
    try{ await api.post(`/api/pm/requests/${req.id}/status`, { status: next }); setToast({ open:true, msg:`Status set to ${next}`, severity:'success' }); await fetchAll(); }
    catch(e){ console.error(e); setToast({ open:true, msg:'Failed to update status', severity:'error' }); }
  };

  const filteredRequests = useMemo(()=>{
    let list = requests;
    if (reqQuery.trim()){
      const q = reqQuery.toLowerCase();
      list = list.filter(r => `${r.title} ${r.category} ${r.status}`.toLowerCase().includes(q));
    }
    if (reqStatus !== 'all'){
      if (reqStatus === 'unassigned') list = list.filter(r => !r.assignedTo && r.status==='open');
      else list = list.filter(r => r.status === reqStatus);
    }
    return list;
  }, [requests, reqQuery, reqStatus]);

  // ===== Loading state =====
  if (loading){
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt:4, display:'grid', placeItems:'center', minHeight:'60vh' }}>
          <Box sx={{ width:'100%', maxWidth:420, p:4, borderRadius:3, bgcolor:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)' }}>
            <LinearProgress sx={{ mb:2 }} />
            <Typography variant="h6" align="center">Loading Platform Manager Dashboard…</Typography>
            <Typography variant="body2" align="center" sx={{ opacity:0.8 }}>{USE_MOCKS? 'Mock data' : 'Fetching from server'}</Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // ===== UI =====
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt:3, mb:3, textAlign:'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 2 }}>
          <Box sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {currentUser?.name || currentUser?.username || 'User'}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h3" sx={{ fontWeight:800, letterSpacing:0.2 }}>
          🛠️ Platform Manager Dashboard {USE_MOCKS && <Chip size="small" color="info" label="Mock Mode" sx={{ ml:1 }} />}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity:0.9, mt:0.5 }}>Manage categories and oversee help requests</Typography>
        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt:2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={refreshing} sx={{ border:'1px solid rgba(255,255,255,0.2)', color:'#fff' }}>
              <Refresh sx={{ color:'#fff' }}/>
            </IconButton>
          </Tooltip>
          <Button variant="contained" color="error" startIcon={<Logout/>} onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ borderRadius:3, overflow:'hidden', border:'1px solid rgba(255,255,255,0.12)' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><CategoryIcon fontSize="small"/> <span>Categories</span></Stack>} />
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Timeline fontSize="small"/> <span>Requests</span></Stack>} />
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Badge color="secondary" variant="dot"/> <span>Analytics</span></Stack>} />
        </Tabs>
        <Divider/>

        {/* CATEGORIES TAB */}
        {tab===0 && (
          <Box sx={{ p:2.5 }}>
            <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb:2 }}>
              <TextField fullWidth placeholder="Search categories by name or description" value={catQuery} onChange={(e)=>setCatQuery(e.target.value)} InputProps={{ startAdornment:(<InputAdornment position="start"><Search/></InputAdornment>) }} 
              sx = {{'& .MuiInputBase-input': {color: '#000'},
              '& .MuiInputBase-input::placeholder': {color: '#666', opacity: 1},}}/>
              <TextField select label="Filter" value={catUsageFilter} onChange={(e)=>setCatUsageFilter(e.target.value)} sx={{ minWidth:200 }}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="unused">Unused</MenuItem>
                <MenuItem value="high">High usage (≥10)</MenuItem>
              </TextField>
              <Button variant="contained" startIcon={<Add/>} onClick={openCreateCat}>New Category</Button>
            </Stack>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius:2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={80}>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Usage</TableCell>
                    <TableCell align="center">Active</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.map(cat=> (
                    <TableRow key={cat.id} hover>
                      <TableCell>{cat.id}</TableCell>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>{cat.description}</TableCell>
                      <TableCell align="right">{cat.usageCount ?? 0}</TableCell>
                      <TableCell align="center">{cat.active ? <Chip label="Yes" color="success" size="small"/> : <Chip label="No" size="small"/>}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" onClick={()=>openEditCat(cat)}><Edit/></IconButton>
                          <IconButton size="small" color="error" onClick={()=>deleteCat(cat.id)}><Delete/></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCategories.length===0 && (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py:4, opacity:0.8 }}>No categories found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* REQUESTS TAB */}
        {tab===1 && (
          <Box sx={{ p:2.5 }}>
            <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb:2 }}>
              <TextField fullWidth placeholder="Search requests (title/category/status)" value={reqQuery} onChange={(e)=>setReqQuery(e.target.value)} InputProps={{ startAdornment:(<InputAdornment position="start"><Search/></InputAdornment>) }} />
              <TextField select label="Status" value={reqStatus} onChange={(e)=>setReqStatus(e.target.value)} sx={{ minWidth:220 }}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
              </TextField>
            </Stack>

            <Grid container spacing={2}>
              {filteredRequests.map(r => (
                <Grid item xs={12} md={6} key={r.id}>
                  <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="h6" sx={{ fontWeight:700 }}>{r.title}</Typography>
                          {r.urgent && <Chip color="error" label="Urgent" size="small"/>}
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mt:1, flexWrap:'wrap' }}>
                          <Chip label={r.category} size="small" variant="outlined"/>
                          <Chip label={r.status} size="small"/>
                          <Chip label={r.assignedTo ? `Assigned: ${r.assignedTo}` : 'Unassigned'} size="small" variant="outlined"/>
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        {r.status !== 'closed' && (
                          <Tooltip title="Close">
                            <IconButton color="error" onClick={()=>setStatus(r,'closed')}><CloseIcon/></IconButton>
                          </Tooltip>
                        )}
                        {r.status !== 'open' && (
                          <Tooltip title="Reopen">
                            <IconButton color="primary" onClick={()=>setStatus(r,'open')}><Replay/></IconButton>
                          </Tooltip>
                        )}
                        {r.status !== 'completed' && (
                          <Tooltip title="Mark Completed">
                            <IconButton color="success" onClick={()=>setStatus(r,'completed')}><CheckCircle/></IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
              {filteredRequests.length===0 && (
                <Box sx={{ p:4, width:'100%', textAlign:'center', opacity:0.8 }}>
                  <Typography>No matching requests</Typography>
                </Box>
              )}
            </Grid>
          </Box>
        )}

        {/* ANALYTICS TAB */}
        {tab===2 && (
          <Box sx={{ p:2.5 }}>
            <Typography variant="h6" sx={{ mb:1, fontWeight:700 }}>Activity Summary</Typography>
            <Typography variant="body2" sx={{ mb:2, opacity:0.85 }}>View system activity summaries by date range.</Typography>

            <Grid container spacing={2} sx={{ mb:3 }}>
              <SummaryCard label="Daily" data={analytics.daily} delay={100}/>
              <SummaryCard label="Weekly" data={analytics.weekly} delay={200}/>
              <SummaryCard label="Monthly" data={analytics.monthly} delay={300}/>
            </Grid>

            {/* Activity Chart */}
            <Paper variant="outlined" sx={{ p:2.5, borderRadius:2, mt:2 }}>
              <Typography variant="h6" sx={{ mb:2, fontWeight:700 }}>Activity Overview Chart</Typography>
              <ActivityChart data={analytics} />
            </Paper>
          </Box>
        )}
      </Paper>

      {/* Category Dialog */}
      <Dialog open={catDialogOpen} onClose={()=>setCatDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight:800 }}>{editingCat ? 'Edit Category' : 'New Category'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt:0.5 }}>
            <TextField label="Name" value={catForm.name} onChange={e=>setCatForm(f=>({ ...f, name:e.target.value }))} autoFocus required/>
            <TextField label="Description" value={catForm.description} onChange={e=>setCatForm(f=>({ ...f, description:e.target.value }))} multiline minRows={2}/>
            <TextField select label="Active" value={catForm.active ? 'yes' : 'no'} onChange={e=>setCatForm(f=>({ ...f, active: e.target.value==='yes' }))} sx={{ maxWidth:200 }}>
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setCatDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Save/>} onClick={saveCat}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={2400} onClose={()=>setToast(t=>({ ...t, open:false }))} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={toast.severity} variant="filled" sx={{ width:'100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </Container>
  );
}

function SummaryCard({ label, data={}, delay=0 }){
  const { created=0, closed=0, dateRange='' } = data || {};
  const period = label.toLowerCase(); // 'daily', 'weekly', 'monthly'
  
  return (
    <Grid item xs={12} md={4}>
      <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" sx={{ fontWeight:700 }}>{label}</Typography>
            {dateRange && (label === 'Weekly' || label === 'Monthly') && (
              <Typography variant="caption" sx={{ opacity:0.7, display:'block', mt:0.25 }}>
                ({dateRange})
              </Typography>
            )}
          </Box>
          <FilterList/>
        </Stack>
        <Divider sx={{ my:1.5 }}/>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <StatPill label="Created" value={created} color="#6366f1" period={period} type="created"/>
          </Grid>
          <Grid item xs={6}>
            <StatPill label="Closed" value={closed} color="#10b981" period={period} type="closed"/>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

function StatPill({ label, value, color, period, type }){
  const [anchorEl, setAnchorEl] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHoveringBox, setIsHoveringBox] = useState(false);
  const [isHoveringPopover, setIsHoveringPopover] = useState(false);
  const open = Boolean(anchorEl) && (isHoveringBox || isHoveringPopover);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = async (event) => {
    if (value === 0) return; // No requests to show
    
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setAnchorEl(event.currentTarget);
    setIsHoveringBox(true);
    setLoading(true);
    
    try {
      const res = await api.get(`/api/pm/analytics/${period}/${type}`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to load requests:', e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBoxMouseLeave = () => {
    setIsHoveringBox(false);
    // Give a small delay to allow mouse to move to popover
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringPopover) {
        setAnchorEl(null);
        setRequests([]);
      }
    }, 150);
  };

  const handlePopoverEnter = () => {
    // Clear timeout since we're now hovering over popover
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHoveringPopover(true);
  };

  const handlePopoverLeave = () => {
    setIsHoveringPopover(false);
    setAnchorEl(null);
    setRequests([]);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Box 
        sx={{ 
          p:2, 
          borderRadius:2, 
          border:'1px solid rgba(255,255,255,0.12)',
          cursor: value > 0 ? 'pointer' : 'default',
          transition: 'all 0.2s',
          '&:hover': value > 0 ? {
            bgcolor: 'rgba(255,255,255,0.05)',
            borderColor: 'rgba(255,255,255,0.2)'
          } : {}
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleBoxMouseLeave}
      >
        <Typography variant="body2" sx={{ opacity:0.8 }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight:800, color }}>{value}</Typography>
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={handlePopoverLeave}
        disableRestoreFocus
        disableAutoFocus
        disableEnforceFocus
        sx={{ 
          pointerEvents: 'none', 
          mt: 1,
          '& .MuiPaper-root': {
            pointerEvents: 'auto'
          }
        }}
        PaperProps={{
          onMouseEnter: handlePopoverEnter,
          onMouseLeave: handlePopoverLeave,
          component: 'div',
          sx: { 
            pointerEvents: 'auto',
            maxWidth: 400,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, minWidth: 350 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {label} - {period.charAt(0).toUpperCase() + period.slice(1)} ({requests.length})
          </Typography>
          {loading ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Loading...</Typography>
          ) : requests.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>No requests found</Typography>
          ) : (
            <List dense>
              {requests.map((req) => (
                <ListItem 
                  key={req.id} 
                  sx={{ 
                    border: '1px solid rgba(0,0,0,0.1)', 
                    borderRadius: 1, 
                    mb: 0.5,
                    bgcolor: 'background.paper'
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {req.title}
                      </Typography>
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        {req.category && (
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Category: {req.category}
                          </Typography>
                        )}
                        {req.requester && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                            Requester: {req.requester}
                          </Typography>
                        )}
                        {req.created_at && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.6 }}>
                            {type === 'created' ? 'Created' : 'Completed'}: {new Date(req.created_at || req.completed_at).toLocaleString()}
                          </Typography>
                        )}
                        {req.urgency && (
                          <Chip 
                            label={req.urgency} 
                            size="small" 
                            color={req.urgency === 'high' ? 'error' : req.urgency === 'medium' ? 'warning' : 'default'}
                            sx={{ mt: 0.5, height: 20 }}
                          />
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}

// Activity Chart Component
function ActivityChart({ data = {} }) {
  // Prepare chart data
  const chartData = [
    {
      period: 'Daily',
      Created: data.daily?.created || 0,
      Closed: data.daily?.closed || 0,
    },
    {
      period: 'Weekly',
      Created: data.weekly?.created || 0,
      Closed: data.weekly?.closed || 0,
    },
    {
      period: 'Monthly',
      Created: data.monthly?.created || 0,
      Closed: data.monthly?.closed || 0,
    },
  ];

  return (
    <Box sx={{ width: '100%', height: 400, mt: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="period" 
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: '0.875rem' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: '0.875rem' }}
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.85)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              color: '#fff'
            }}
          />
          <Legend 
            wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }}
          />
          <Bar dataKey="Created" fill="#6366f1" name="Created Requests" />
          <Bar dataKey="Closed" fill="#10b981" name="Closed Requests" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
