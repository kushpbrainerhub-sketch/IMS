import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { apiClient } from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')

  const submit = useMutation({
    mutationFn: () => apiClient.post('/auth/forgot-password', { email }),
  })

  function handleSubmit(e) {
    e.preventDefault()
    submit.mutate()
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={2} sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
          Forgot password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your account email and we'll send you a reset link.
        </Typography>

        {submit.isSuccess ? (
          <>
            <Alert severity="success" sx={{ mb: submit.data?.data?.reset_link ? 2 : 0 }}>
              If that email is registered, a reset link has been sent. Check your inbox.
            </Alert>
            {submit.data?.data?.reset_link && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Email sending isn't configured yet, so here's your reset link directly instead
                  of an email.
                </Alert>
                <Button href={submit.data.data.reset_link} variant="outlined" fullWidth>
                  Reset password now
                </Button>
              </>
            )}
          </>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              size="small"
            />
            <Button type="submit" variant="contained" disabled={submit.isPending} sx={{ mt: 1 }}>
              Send reset link
            </Button>
          </Box>
        )}

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to="/login">Back to log in</Link>
        </Typography>
      </Paper>
    </Box>
  )
}
