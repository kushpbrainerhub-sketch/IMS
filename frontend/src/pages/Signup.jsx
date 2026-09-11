import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { apiClient } from '../api/client'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  const signup = useMutation({
    mutationFn: () => apiClient.post('/auth/register', { name, email, password }),
    onSuccess: (res) => setResult(res.data),
    onError: (err) => setError(err.response?.data?.detail || 'Could not create account'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    signup.mutate()
  }

  if (result) {
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
        <Paper elevation={2} sx={{ p: 4, width: 380 }}>
          <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
            Account created
          </Typography>

          {result.verification_link ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Email sending isn't configured yet, so here's your verification link directly
                instead of an email.
              </Alert>
              <Button
                href={result.verification_link}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              >
                Verify email now
              </Button>
            </>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              Check your email to verify your address.
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/login', { state: { message: 'Account created! You can log in now.' } })}
          >
            Continue to log in
          </Button>
        </Paper>
      </Box>
    )
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
          IMS
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create your shop's owner account
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
            size="small"
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" disabled={signup.isPending} sx={{ mt: 1 }}>
            Create account
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Already have an account? <Link component={RouterLink} to="/login">Log in</Link>
        </Typography>
      </Paper>
    </Box>
  )
}
