import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Box, Typography, Button, IconButton, Stack, Tabs, Tab, Paper, Divider,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Grid, Chip, MenuItem, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, LinearProgress, Badge, Card, CardContent,
  FormControlLabel, Switch, FormGroup, Avatar
} from '@mui/material';
import {
  Logout, Refresh, Search, Add, Edit, Delete, Save, Close as CloseIcon,
  Visibility, VisibilityOff, VpnKey, Email, Person, Download, FilterList,
  Security, Block, CheckCircle, Cancel, ContentCopy
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// =============================================
// AdminDashboard Component
// =============================================
export default function AdminDashboard(){
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0 Users, 1 Activity, 2 System
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ open:false, msg:'', severity:'success' });

  // Data
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [activityLogs, setActivityLogs] = useState([]);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // User dialog state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'pin',
    active: true,
    phone: '',
    department: ''
  });

  // Password reset dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    forceReset: true
  });

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchAdminData = async () => {
    try{
      const [usersRes, statsRes, logsRes] = await Promise.all([
        axios.get('https://localhost:5000/api/admin/users'),
        axios.get('https://localhost:5000/api/admin/stats'),
        axios.get('https://localhost:5000/api/admin/activity-logs'),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.items||[]));
      setSystemStats(statsRes.data || {});
      setActivityLogs(Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data?.items||[]));
      if (USE_MOCKS) setToast({ open:true, msg:'Admin Mock mode — using sample data', severity:'info' });
    }catch(e){
      console.error(e);
      setToast({ open:true, msg:'Failed to fetch admin data', severity:'error' });
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchAdminData(); },[]);

  const handleRefresh = async ()=>{
    setRefreshing(true);
    await fetchAdminData();
    setRefreshing(false);
  };

  const handleLogout = ()=>{
    localStorage.removeItem('adminToken');
    sessionStorage.clear();
    navigate('/admin-login', { replace:true });
  };

  // ===== User Management Operations =====
  const openCreateUser = ()=>{
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'pin',
      active: true,
      phone: '',
      department: ''
    });
    setUserDialogOpen(true);
  };

  const openEditUser = (user)=>{
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      phone: user.phone || '',
      department: user.department || ''
    });
    setUserDialogOpen(true);
  };

  const saveUser = async ()=>{
    try{
      if (!userForm.name.trim() || !userForm.email.trim()) {
        setToast({ open:true, msg:'Name and email are required', severity:'warning' });
        return;
      }

      if (editingUser){
        await axios.patch(`https://localhost:5000/api/admin/users/${editingUser.id}`, userForm);
        setToast({ open:true, msg:'User updated successfully', severity:'success' });
      } else {
        await axios.post('https://localhost:5000/api/admin/users', userForm);
        setToast({ open:true, msg:'User created successfully', severity:'success' });
      }
      setUserDialogOpen(false);
      await fetchAdminData();
    }catch(e){
      console.error(e);
      setToast({ open:true, msg:'Failed to save user', severity:'error' });
    }
  };

  const toggleUserStatus = async (user)=>{
    try{
      await axios.patch(`https://localhost:5000/api/admin/users/${user.id}`, { active: !user.active });
      setToast({ open:true, msg:`User ${!user.active ? 'activated' : 'deactivated'}`, severity:'info' });
      await fetchAdminData();
    }catch(e){
      console.error(e);
      setToast({ open:true, msg:'Failed to update user status', severity:'error' });
    }
  };

  const openPasswordReset = (user)=>{
    setSelectedUser(user);
    setPasswordForm({
      newPassword: generateTempPassword(),
      confirmPassword: '',
      forceReset: true
    });
    setPasswordDialogOpen(true);
  };

  const resetPassword = async ()=>{
    try{
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setToast({ open:true, msg:'Passwords do not match', severity:'warning' });
        return;
      }

      await axios.post(`https://localhost:5000/api/admin/users/${selectedUser.id}/reset-password`, {
        newPassword: passwordForm.newPassword,
        forceReset: passwordForm.forceReset
      });
      setToast({ open:true, msg:'Password reset successfully', severity:'success' });
      setPasswordDialogOpen(false);
      await fetchAdminData();
    }catch(e){
      console.error(e);
      setToast({ open:true, msg:'Failed to reset password', severity:'error' });
    }
  };

  const confirmDeleteUser = (user)=>{
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const deleteUser = async ()=>{
    try{
      await axios.delete(`https://localhost:5000/api/admin/users/${userToDelete.id}`);
      setToast({ open:true, msg:'User deleted successfully', severity:'info' });
      setDeleteDialogOpen(false);
      await fetchAdminData();
    }catch(e){
      console.error(e);
      setToast({ open:true, msg:'Failed to delete user', severity:'error' });
    }
  };

  // ===== Utility Functions =====
  const generateTempPassword = ()=>{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const copyToClipboard = (text)=>{
    navigator.clipboard.writeText(text);
    setToast({ open:true, msg:'Copied to clipboard', severity:'info' });
  };

  const exportUsers = ()=>{
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Last Login', 'Created At'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role.toUpperCase(),
        user.active ? 'Active' : 'Inactive',
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToast({ open:true, msg:'Users exported successfully', severity:'success' });
  };

  // ===== Filtered Data =====
  const filteredUsers = useMemo(()=>{
    let list = users;
    if (searchQuery.trim()){
      const q = searchQuery.toLowerCase();
      list = list.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all'){
      list = list.filter(u => u.role === roleFilter);
    }
    if (statusFilter !== 'all'){
      list = list.filter(u => u.active === (statusFilter === 'active'));
    }
    return list;
  }, [users, searchQuery, roleFilter, statusFilter]);

  const filteredLogs = useMemo(()=>{
    let list = activityLogs;
    if (dateFilter !== 'all'){
      const now = new Date();
      const filterDate = new Date();
      if (dateFilter === 'today') filterDate.setDate(now.getDate() - 1);
      else if (dateFilter === 'week') filterDate.setDate(now.getDate() - 7);
      else if (dateFilter === 'month') filterDate.setMonth(now.getMonth() - 1);
      
      list = list.filter(log => new Date(log.timestamp) >= filterDate);
    }
    return list;
  }, [activityLogs, dateFilter]);

  // ===== Loading state =====
  if (loading){
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt:4, display:'grid', placeItems:'center', minHeight:'60vh' }}>
          <Box sx={{ width:'100%', maxWidth:420, p:4, borderRadius:3, bgcolor:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)' }}>
            <LinearProgress sx={{ mb:2 }} />
            <Typography variant="h6" align="center">Loading Admin Dashboard…</Typography>
            <Typography variant="body2" align="center" sx={{ opacity:0.8 }}>{USE_MOCKS? 'Mock data' : 'Fetching system data'}</Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // ===== UI =====
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt:3, mb:3, textAlign:'center' }}>
        <Typography variant="h3" sx={{ fontWeight:800, letterSpacing:0.2 }}>
          🔐 Admin Dashboard {USE_MOCKS && <Chip size="small" color="info" label="Mock Mode" sx={{ ml:1 }} />}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity:0.9, mt:0.5 }}>Manage user accounts and system access</Typography>
        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt:2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={refreshing} sx={{ border:'1px solid rgba(255,255,255,0.2)' }}>
              <Refresh/>
            </IconButton>
          </Tooltip>
          <Button variant="contained" color="primary" startIcon={<Add/>} onClick={openCreateUser}>
            New User
          </Button>
          <Button variant="outlined" startIcon={<Download/>} onClick={exportUsers}>
            Export Users
          </Button>
          <Button variant="contained" color="error" startIcon={<Logout/>} onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Box>

      {/* System Stats Cards */}
      <Grid container spacing={2} sx={{ mb:3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="Total Users" 
            value={systemStats.totalUsers || users.length} 
            color="#6366f1"
            icon={<Person/>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="Active Users" 
            value={systemStats.activeUsers || users.filter(u => u.active).length} 
            color="#10b981"
            icon={<CheckCircle/>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="New This Month" 
            value={systemStats.newThisMonth || users.filter(u => {
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return new Date(u.createdAt) > monthAgo;
            }).length} 
            color="#f59e0b"
            icon={<Add/>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="Admin Users" 
            value={systemStats.adminUsers || users.filter(u => u.role === 'admin').length} 
            color="#ef4444"
            icon={<Security/>}
          />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius:3, overflow:'hidden', border:'1px solid rgba(255,255,255,0.12)' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Person fontSize="small"/> <span>User Management</span> <Badge badgeContent={users.length} color="primary" sx={{ ml:1 }}/></Stack>} />
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><FilterList fontSize="small"/> <span>Activity Logs</span></Stack>} />
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Security fontSize="small"/> <span>System Overview</span></Stack>} />
        </Tabs>
        <Divider/>

        {/* USER MANAGEMENT TAB */}
        {tab===0 && (
          <Box sx={{ p:2.5 }}>
            <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb:2 }}>
              <TextField 
                fullWidth 
                placeholder="Search users by name, email, or role" 
                value={searchQuery} 
                onChange={(e)=>setSearchQuery(e.target.value)} 
                InputProps={{ startAdornment:(<InputAdornment position="start"><Search/></InputAdornment>) }} 
              />
              <TextField 
                select 
                label="Role" 
                value={roleFilter} 
                onChange={(e)=>setRoleFilter(e.target.value)} 
                sx={{ minWidth:150 }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="pin">PIN</MenuItem>
                <MenuItem value="csr">CSR</MenuItem>
                <MenuItem value="pm">Platform Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
              <TextField 
                select 
                label="Status" 
                value={statusFilter} 
                onChange={(e)=>setStatusFilter(e.target.value)} 
                sx={{ minWidth:150 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Stack>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius:2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={60}>Avatar</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map(user=> (
                    <TableRow key={user.id} hover sx={{ opacity: user.active ? 1 : 0.7 }}>
                      <TableCell>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(user.role) }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight:600 }}>{user.name}</Typography>
                          <Typography variant="body2" sx={{ opacity:0.8 }}>{user.email}</Typography>
                          {user.phone && <Typography variant="body2" sx={{ opacity:0.7, fontSize:'0.75rem' }}>{user.phone}</Typography>}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role.toUpperCase()} 
                          size="small"
                          color={getRoleChipColor(user.role)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {user.active ? (
                            <CheckCircle fontSize="small" color="success" />
                          ) : (
                            <Cancel fontSize="small" color="error" />
                          )}
                          <Chip 
                            label={user.active ? 'Active' : 'Inactive'} 
                            size="small"
                            color={user.active ? 'success' : 'default'}
                            variant={user.active ? 'filled' : 'outlined'}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Edit User">
                            <IconButton size="small" onClick={()=>openEditUser(user)}>
                              <Edit/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset Password">
                            <IconButton size="small" onClick={()=>openPasswordReset(user)}>
                              <VpnKey/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.active ? 'Deactivate' : 'Activate'}>
                            <IconButton 
                              size="small" 
                              color={user.active ? 'warning' : 'success'}
                              onClick={()=>toggleUserStatus(user)}
                            >
                              {user.active ? <Block/> : <CheckCircle/>}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={()=>confirmDeleteUser(user)}
                              disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1}
                            >
                              <Delete/>
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length===0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py:4, opacity:0.8 }}>
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* ACTIVITY LOGS TAB */}
        {tab===1 && (
          <Box sx={{ p:2.5 }}>
            <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb:2 }}>
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

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius:2, maxHeight:400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log, index)=> (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(log.timestamp).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize:'0.75rem', bgcolor: getRoleColor(log.userRole) }}>
                            {log.userName?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight:600 }}>{log.userName}</Typography>
                            <Typography variant="body2" sx={{ opacity:0.7, fontSize:'0.75rem' }}>
                              {log.userRole}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.action} 
                          size="small"
                          color={getActionColor(log.action)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{log.details}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily:'monospace', opacity:0.7 }}>
                          {log.ipAddress}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLogs.length===0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py:4, opacity:0.8 }}>
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* SYSTEM OVERVIEW TAB */}
        {tab===2 && (
          <Box sx={{ p:2.5 }}>
            <Typography variant="h6" sx={{ mb:2 }}>System Configuration</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb:2 }}>User Roles Distribution</Typography>
                    <Stack spacing={1}>
                      {['pin', 'csr', 'pm', 'admin'].map(role => {
                        const count = users.filter(u => u.role === role).length;
                        const percentage = users.length > 0 ? (count / users.length * 100).toFixed(1) : 0;
                        return (
                          <Box key={role} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', py:0.5 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ width:12, height:12, borderRadius:'50%', bgcolor:getRoleColor(role) }}/>
                              <Typography variant="body2" sx={{ textTransform:'capitalize' }}>{role}</Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ fontWeight:600 }}>
                              {count} ({percentage}%)
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb:2 }}>Quick Actions</Typography>
                    <Stack spacing={1}>
                      <Button variant="outlined" startIcon={<Download/>} onClick={exportUsers} fullWidth>
                        Export All Users
                      </Button>
                      <Button variant="outlined" startIcon={<VpnKey/>} fullWidth>
                        Bulk Password Reset
                      </Button>
                      <Button variant="outlined" startIcon={<Email/>} fullWidth>
                        Send System Announcement
                      </Button>
                      <Button variant="outlined" startIcon={<Security/>} fullWidth>
                        Security Settings
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={()=>setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight:800 }}>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt:0.5 }}>
            <TextField 
              label="Full Name" 
              value={userForm.name} 
              onChange={e=>setUserForm(f=>({ ...f, name:e.target.value }))} 
              autoFocus 
              required
            />
            <TextField 
              label="Email" 
              type="email"
              value={userForm.email} 
              onChange={e=>setUserForm(f=>({ ...f, email:e.target.value }))} 
              required
            />
            <TextField 
              select 
              label="Role" 
              value={userForm.role} 
              onChange={e=>setUserForm(f=>({ ...f, role:e.target.value }))} 
              required
            >
              <MenuItem value="pin">Person-In-Need (PIN)</MenuItem>
              <MenuItem value="csr">Community Service Rep (CSR)</MenuItem>
              <MenuItem value="pm">Platform Manager</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </TextField>
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <TextField 
                label="Phone" 
                value={userForm.phone} 
                onChange={e=>setUserForm(f=>({ ...f, phone:e.target.value }))} 
                fullWidth
              />
              <TextField 
                label="Department" 
                value={userForm.department} 
                onChange={e=>setUserForm(f=>({ ...f, department:e.target.value }))} 
                fullWidth
              />
            </Stack>
            <FormGroup>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={userForm.active} 
                    onChange={e=>setUserForm(f=>({ ...f, active:e.target.checked }))} 
                  />
                } 
                label="Active Account" 
              />
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setUserDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Save/>} onClick={saveUser}>
            {editingUser ? 'Update' : 'Create'} User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onClose={()=>setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight:800 }}>Reset Password</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt:0.5 }}>
            <Typography variant="h6">{selectedUser?.name}</Typography>
            <Typography variant="body2" sx={{ opacity:0.8 }}>{selectedUser?.email}</Typography>
            
            <TextField 
              label="New Password" 
              value={passwordForm.newPassword} 
              onChange={e=>setPasswordForm(f=>({ ...f, newPassword:e.target.value }))} 
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy Password">
                      <IconButton onClick={()=>copyToClipboard(passwordForm.newPassword)}>
                        <ContentCopy fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Generate New">
                      <IconButton onClick={()=>setPasswordForm(f=>({ ...f, newPassword:generateTempPassword() }))}>
                        <Refresh fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
            <TextField 
              label="Confirm Password" 
              value={passwordForm.confirmPassword} 
              onChange={e=>setPasswordForm(f=>({ ...f, confirmPassword:e.target.value }))} 
              error={passwordForm.newPassword !== passwordForm.confirmPassword}
              helperText={passwordForm.newPassword !== passwordForm.confirmPassword ? "Passwords don't match" : ""}
            />
            <FormGroup>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={passwordForm.forceReset} 
                    onChange={e=>setPasswordForm(f=>({ ...f, forceReset:e.target.checked }))} 
                  />
                } 
                label="Require password change on next login" 
              />
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<VpnKey/>} onClick={resetPassword}>
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={()=>setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight:800 }}>Confirm Deletion</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt:0.5 }}>
            <Typography variant="h6">Delete User: {userToDelete?.name}</Typography>
            <Typography variant="body2" sx={{ opacity:0.8 }}>{userToDelete?.email}</Typography>
            <Alert severity="warning">
              This action cannot be undone. All user data and associated records will be permanently deleted.
            </Alert>
            {userToDelete?.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1 && (
              <Alert severity="error">
                Cannot delete the only remaining administrator account.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<Delete/>} 
            onClick={deleteUser}
            disabled={userToDelete?.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1}
          >
            Delete User
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
// Helper Components
// =============================================
function StatCard({ label, value, color, icon }){
  return (
    <Card variant="outlined" sx={{ borderRadius:2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ fontWeight:800, color }}>{value}</Typography>
            <Typography variant="body2" sx={{ opacity:0.8 }}>{label}</Typography>
          </Box>
          <Box sx={{ color, opacity:0.8 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// =============================================
// Utility Functions
// =============================================
function getRoleColor(role){
  const colors = {
    pin: '#6366f1',
    csr: '#10b981', 
    pm: '#f59e0b',
    admin: '#ef4444'
  };
  return colors[role] || '#6b7280';
}

function getRoleChipColor(role){
  const colors = {
    pin: 'primary',
    csr: 'success',
    pm: 'warning', 
    admin: 'error'
  };
  return colors[role] || 'default';
}

function getActionColor(action){
  const colors = {
    'login': 'success',
    'logout': 'default',
    'create': 'primary',
    'update': 'warning',
    'delete': 'error',
    'password_reset': 'info'
  };
  return colors[action] || 'default';
}