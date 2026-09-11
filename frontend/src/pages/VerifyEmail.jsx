import { useEffect } from 'react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { apiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

const REDIRECT_DELAY_MS = 1800

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { user } = useAuth()
  const navigate = useNavigate()

  const verify = useMutation({
    mutationFn: () => apiClient.post('/auth/verify-email', { token }),
  })

  useEffect(() => {
    if (token) verify.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (!verify.isSuccess) return
    const timer = setTimeout(() => {
      if (user) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true, state: { message: 'Email verified! You can now log in.' } })
      }
    }, REDIRECT_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verify.isSuccess, user])

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
          Verify email
        </Typography>

        {!token ? (
          <Alert severity="error">This verification link is missing its token.</Alert>
        ) : verify.isSuccess ? (
          <Alert severity="success">
            Your email is verified. Redirecting you to {user ? 'the dashboard' : 'log in'}…
          </Alert>
        ) : verify.isError ? (
          <Alert severity="error">
            {verify.error?.response?.data?.detail || 'This verification link is invalid or expired.'}
          </Alert>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Verifying…
          </Typography>
        )}

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to={user ? '/dashboard' : '/login'}>
            {user ? 'Go to dashboard now' : 'Back to log in now'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}
