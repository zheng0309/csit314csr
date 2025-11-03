import React, { useEffect, useMemo, useState, useCallback, memo } from 'react';
import axios from 'axios';
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
// AdminDashboard Component (Corrected to match DB schema)
// =============================================
export default function AdminDashboard(){
  const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:5000';
  const USE_MOCKS = false;
  const axiosClient = useMemo(()=> axios.create({ baseURL: API_BASE, withCredentials: false }), [API_BASE]);
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0 Users, 1 Activity
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ open:false, msg:'', severity:'success' });

  // Data
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // User dialog state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'pin',
    password: '' // Only for new users
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

  const normalizeRole = (role)=>{
    const map = {
      'pin':'pin', 'PIN':'pin',
      'csr_rep':'csr_rep', 'CSR Rep':'csr_rep', 'CSR':'csr_rep',
      'platform_manager':'platform_manager', 'Platform Manager':'platform_manager', 'PM':'platform_manager',
      'admin':'admin', 'Admin':'admin'
    };
    return map[role] || role || 'pin';
  };

  const fetchAdminData = async () => {
    try{
      const [usersRes, statsRes] = await Promise.all([
        axiosClient.get(`/api/admin/users`),
        axiosClient.get(`/api/admin/user-stats`)
      ]);
      const incoming = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.items || usersRes.data?.users || []);
      const normalized = incoming.map(u => ({ ...u, role: normalizeRole(u.role) }));
      setUsers(normalized);
      setActivityLogs([]);
      if (USE_MOCKS) setToast({ open:true, msg:'Admin Mock mode — using sample data', severity:'info' });
    }catch(e){
      console.error(e);
      const msg = e?.response?.data?.error || `Failed to fetch admin data${e?.response?.status? ` (${e.response.status})`:''}`;
      setToast({ open:true, msg: msg, severity:'error' });
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
    navigate('/', { replace:true });
  };

  // ===== User Management Operations =====
  const openCreateUser = useCallback(()=>{
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'pin',
      password: ''
    });
    setUserDialogOpen(true);
  }, []);

  const openEditUser = useCallback((user)=>{
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '' // Don't show existing password
    });
    setUserDialogOpen(true);
  }, []);

  const saveUser = async ()=>{
    try{
      if (!userForm.name.trim() || !userForm.email.trim()) {
        setToast({ open:true, msg:'Name and email are required', severity:'warning' });
        return;
      }

      // For new users, password is required
      if (!editingUser && !userForm.password.trim()) {
        setToast({ open:true, msg:'Password is required for new users', severity:'warning' });
        return;
      }

      if (editingUser){
        // Update user - exclude password if not changed
        const updateData = { ...userForm };
        if (!updateData.password) {
          delete updateData.password;
        }
        await axiosClient.patch(`/api/admin/users/${editingUser.users_id}`, updateData);
        setToast({ open:true, msg:'User updated successfully', severity:'success' });
      } else {
        // Create new user
        await axiosClient.post(`/api/admin/users/create`, userForm);
        setToast({ open:true, msg:'User created successfully', severity:'success' });
      }
      setUserDialogOpen(false);
      await fetchAdminData();
    }catch(e){
      console.error(e);
      setToast({ open:true, msg:'Failed to save user', severity:'error' });
    }
  };

  const openPasswordReset = useCallback((user)=>{
    setSelectedUser(user);
    setPasswordForm({
      newPassword: generateTempPassword(),
      confirmPassword: '',
      forceReset: true
    });
    setPasswordDialogOpen(true);
  }, []);

  const resetPassword = async ()=>{
    try{
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setToast({ open:true, msg:'Passwords do not match', severity:'warning' });
        return;
      }

      await axiosClient.post(`/api/admin/users/${selectedUser.users_id}/reset-password`, {
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

  const confirmDeleteUser = useCallback((user)=>{
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }, []);

  const deleteUser = async ()=>{
    try{
      await axiosClient.delete(`/api/admin/users/${userToDelete.users_id}`);
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
      ['User ID', 'Username', 'Name', 'Email', 'Role', 'Created At'],
      ...filteredUsers.map(user => [
        user.users_id,
        user.username,
        user.name,
        user.email,
        user.role,
        new Date(user.created_at).toLocaleDateString()
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
        u.username.toLowerCase().includes(q) || 
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all'){
      list = list.filter(u => u.role === roleFilter);
    }
    return list;
  }, [users, searchQuery, roleFilter]);

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
            <IconButton onClick={handleRefresh} disabled={refreshing} sx={{ border:'1px solid rgba(255,255,255,0.2)', color:'#fff' }}>
              <Refresh sx={{ color:'#fff' }}/>
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
            value={users.length} 
            color="#6366f1"
            icon={<Person/>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="PIN Users" 
            value={users.filter(u => u.role === 'pin').length} 
            color="#10b981"
            icon={<Person/>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="CSR Representative" 
            value={users.filter(u => u.role === 'csr_rep').length} 
            color="#f59e0b"
            icon={<Person/>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="Platform Managers" 
            value={users.filter(u => u.role === 'platform_manager').length} 
            color="#ef4444"
            icon={<Security/>}
          />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius:3, overflow:'hidden', border:'1px solid rgba(255,255,255,0.12)' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Person fontSize="small"/> <span>User Management</span> <Badge badgeContent={users.length} color="primary" sx={{ ml:1 }}/></Stack>} />
          <Tab label={<Stack direction="row" alignItems="center" spacing={1}><FilterList fontSize="small"/> <span>Activity Logs</span></Stack>} />
        </Tabs>
        <Divider/>

        {/* USER MANAGEMENT TAB */}
        {tab===0 && (
          <Box sx={{ p:2.5 }}>
            <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb:2 }}>
              <TextField 
                fullWidth 
                placeholder="Search users by username, name, email, or role" 
                value={searchQuery} 
                onChange={(e)=>setSearchQuery(e.target.value)} 
                InputProps={{ startAdornment:(<InputAdornment position="start"><Search/></InputAdornment>) }} 
              />
              <TextField 
                select 
                label="Role" 
                value={roleFilter} 
                onChange={(e)=>setRoleFilter(e.target.value)} 
                sx={{ minWidth:200 }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="pin">PIN</MenuItem>
                <MenuItem value="csr_rep">CSR Representative</MenuItem>
                <MenuItem value="platform_manager">Platform Manager</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </TextField>
            </Stack>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius:2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={60}>Avatar</TableCell>
                    <TableCell>User Details</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <UsersTable 
                  users={filteredUsers}
                  totalUsers={users}
                  onEditUser={openEditUser}
                  onPasswordReset={openPasswordReset}
                  onDeleteUser={confirmDeleteUser}
                />
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* ACTIVITY LOGS TAB */}
        {tab===1 && (
          <Box sx={{ p:2.5 }}>
            <Typography variant="h6" sx={{ mb:2 }}>Recent System Activity</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius:2, maxHeight:400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activityLogs.slice(0, 50).map((log, index)=> (
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
                              @{log.userUsername}
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
                    </TableRow>
                  ))}
                  {activityLogs.length===0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py:4, opacity:0.8 }}>
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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
            {/* Username is auto-generated on the backend; no manual input */}
            <TextField 
              label="Full Name" 
              value={userForm.name} 
              onChange={e=>setUserForm(f=>({ ...f, name:e.target.value }))} 
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
              <MenuItem value="csr_rep">Community Service Rep (CSR)</MenuItem>
              <MenuItem value="platform_manager">Platform Manager</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </TextField>
            <TextField 
              label={editingUser ? "New Password (leave blank to keep current)" : "Password"} 
              type="password"
              value={userForm.password} 
              onChange={e=>setUserForm(f=>({ ...f, password:e.target.value }))} 
              required={!editingUser}
              helperText={editingUser ? "Only enter if you want to change the password" : "Password for initial login"}
            />
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
            <Typography variant="body2" sx={{ opacity:0.8 }}>@{selectedUser?.username} • {selectedUser?.email}</Typography>
            
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
            <Typography variant="body2" sx={{ opacity:0.8 }}>@{userToDelete?.username} • {userToDelete?.email}</Typography>
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
// Memoized Users Table (prevents re-render on dialog typing)
// =============================================
const UsersTable = memo(function UsersTable({ users, totalUsers, onEditUser, onPasswordReset, onDeleteUser }){
  return (
    <TableBody>
      {users.map(user=> (
        <TableRow key={user.users_id} hover>
          <TableCell>
            <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(user.role) }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </TableCell>
          <TableCell>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight:600 }}>{user.name}</Typography>
              <Typography variant="body2" sx={{ opacity:0.8 }}>@{user.username}</Typography>
              <Typography variant="body2" sx={{ opacity:0.8, fontSize:'0.75rem' }}>{user.email}</Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Chip 
              label={formatRoleLabel(user.role)} 
              size="small"
              color={getRoleChipColor(user.role)}
              variant="outlined"
            />
          </TableCell>
          <TableCell>
            <Typography variant="body2">
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Tooltip title="Edit User">
                <IconButton size="small" onClick={()=>onEditUser(user)}>
                  <Edit/>
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Password">
                <IconButton size="small" onClick={()=>onPasswordReset(user)}>
                  <VpnKey/>
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete User">
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={()=>onDeleteUser(user)}
                  disabled={user.role === 'admin' && totalUsers.filter(u => u.role === 'admin').length <= 1}
                >
                  <Delete/>
                </IconButton>
              </Tooltip>
            </Stack>
          </TableCell>
        </TableRow>
      ))}
      {users.length===0 && (
        <TableRow>
          <TableCell colSpan={5} align="center" sx={{ py:4, opacity:0.8 }}>
            No users found matching your criteria
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
});

// =============================================
// Utility Functions
// =============================================
function getRoleColor(role){
  const colors = {
    pin: '#6366f1',
    csr_rep: '#10b981', 
    platform_manager: '#f59e0b',
    admin: '#ef4444'
  };
  return colors[role] || '#6b7280';
}

function getRoleChipColor(role){
  const colors = {
    pin: 'primary',
    csr_rep: 'success',
    platform_manager: 'warning', 
    admin: 'error'
  };
  return colors[role] || 'default';
}

function formatRoleLabel(role){
  const labels = {
    pin: 'PIN',
    csr_rep: 'CSR',
    platform_manager: 'Platform Manager',
    admin: 'Admin'
  };
  return labels[role] || role;
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