import { useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { apiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  'Products, categories, suppliers, purchases and stock ledger',
  'Billing / point-of-sale with printable invoices',
  'Dashboard with sales trends, top products and low-stock alerts',
]

export default function Landing() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const { data: setupStatus } = useQuery({
    queryKey: ['setup-status'],
    queryFn: () => apiClient.get('/auth/setup-status').then((res) => res.data),
    enabled: !loading && !user,
  })

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [loading, user, navigate])

  if (loading || user) return null

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper elevation={2} sx={{ p: 5, width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={800} color="primary" gutterBottom>
          IMS
        </Typography>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Inventory &amp; billing, all in one place
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Everything a shop needs to track stock and sell at the counter — one login, one owner
          account, nothing shared with anyone else.
        </Typography>

        <Stack spacing={1} sx={{ mb: 4, textAlign: 'left' }}>
          {FEATURES.map((f) => (
            <Typography key={f} variant="body2" color="text.secondary">
              • {f}
            </Typography>
          ))}
        </Stack>

        {setupStatus === undefined ? null : setupStatus.needs_setup ? (
          <>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mb: 1.5 }}
            >
              Get started
            </Button>
            <Chip label="First-time setup — create your owner account" size="small" />
          </>
        ) : (
          <Button component={RouterLink} to="/login" variant="contained" size="large" fullWidth>
            Log in
          </Button>
        )}
      </Paper>
    </Box>
  )
}
