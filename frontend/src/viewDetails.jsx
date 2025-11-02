import React, { useEffect, useState } from 'react';
import {
  Container, Box, Stack, Typography, Chip, Paper, Divider,
  Button, Snackbar, Alert, Rating
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';


export default function ViewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/requests/${id}`).catch(() => ({ data: null }));
        if (res && res.data && !res.data.error) {
          const d = res.data;
          setData({
            id: d.id,
            title: d.title,
            description: d.description,
            category: d.category,
            location: d.location,
            status: d.status,
            completedAt: d.completed_at || d.completedAt,
            note: d.completion_note || d.note,
            feedback: d.feedback_rating || d.feedback_comment ? {
              rating: d.feedback_rating,
              comment: d.feedback_comment,
              anonymous: d.feedback_anonymous,
              submitted_at: d.feedback_submitted_at
            } : null,
          });
        } else {
          setData(null);
        }
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
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>PIN Feedback</Typography>
          {data.feedback ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
              <Stack spacing={1.5}>
                {data.feedback.rating && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Rating</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Rating value={Number(data.feedback.rating) || 0} readOnly size="medium" max={5} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {data.feedback.rating} {data.feedback.rating === 1 ? 'star' : 'stars'}
                      </Typography>
                    </Stack>
                  </Box>
                )}
                {data.feedback.comment && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Comment</Typography>
                    <Typography variant="body1" sx={{ color: '#333', fontStyle: 'italic' }}>
                      "{data.feedback.comment}"
                    </Typography>
                  </Box>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {data.feedback.anonymous && (
                    <Chip label="Anonymous" size="small" variant="outlined" />
                  )}
                  {data.feedback.submitted_at && (
                    <Typography variant="caption" sx={{ color: '#666', alignSelf: 'center' }}>
                      Submitted: {new Date(data.feedback.submitted_at).toLocaleDateString()}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                No feedback received yet from the PIN.
              </Typography>
            </Paper>
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
