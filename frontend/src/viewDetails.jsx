import React, { useEffect, useState } from 'react';
import {
  Container, Box, Stack, Typography, Chip, Paper, Divider,
  Button, Snackbar, Alert, Rating
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';


export default function ViewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await fetchCompletedById(id);
        setData(d);
        if (USE_MOCKS) setToast({ open: true, msg: 'Mock mode — backend not required', severity: 'info' });
      } catch (e) {
        console.error(e);
        setToast({ open: true, msg: 'Failed to load details', severity: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
          <Typography variant="body1">Loading…</Typography>
        </Box>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Request not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
      </Container>
    );
  }

  const completedDate = data.completedAt ? new Date(data.completedAt).toLocaleString() : '-';

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Button variant="text" startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{data.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              {data.category && <Chip size="small" label={data.category} variant="outlined" />}
              {data.location && <Chip size="small" label={data.location} variant="outlined" />}
              <Chip size="small" color="success" label={data.status || 'completed'} />
              <Chip size="small" variant="outlined" label={`Completed: ${completedDate}`} />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Description</Typography>
          <Typography variant="body1" sx={{ color: '#333' }}>{data.description || '—'}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Completion Note</Typography>
          <Typography variant="body1" sx={{ color: '#333' }}>{data.note || '—'}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Feedback</Typography>
          {Array.isArray(data.feedback) && data.feedback.length > 0 ? (
            <Stack spacing={1.5}>
              {data.feedback.map((f, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Rating value={Number(f.rating) || 0} readOnly size="small" />
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      {f.by ? `• ${f.by}` : ''}
                      {f.createdAt ? ` • ${new Date(f.createdAt).toLocaleDateString()}` : ''}
                    </Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: '#222' }}>
                    {f.comment || '—'}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: '#333' }}>No feedback yet.</Typography>
          )}
        </Box>
      </Paper>

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
}
