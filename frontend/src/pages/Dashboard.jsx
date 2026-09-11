import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { apiClient } from '../api/client'

export default function Dashboard() {
  const [dbStatus, setDbStatus] = useState('checking')

  useEffect(() => {
    apiClient
      .get('/health/db')
      .then(() => setDbStatus('connected'))
      .catch(() => setDbStatus('error'))
  }, [])

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="body1">Backend / database status:</Typography>
        <Chip
          label={dbStatus === 'connected' ? 'Connected' : dbStatus === 'error' ? 'Unreachable' : 'Checking…'}
          color={dbStatus === 'connected' ? 'success' : dbStatus === 'error' ? 'error' : 'default'}
          size="small"
        />
      </Paper>
    </Box>
  )
}
