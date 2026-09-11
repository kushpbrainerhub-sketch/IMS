import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { apiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmailBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  const resend = useMutation({
    mutationFn: () => apiClient.post('/auth/resend-verification'),
  })

  if (!user || user.email_verified || dismissed) return null

  return (
    <Alert
      severity="warning"
      onClose={() => setDismissed(true)}
      action={
        <Button color="inherit" size="small" onClick={() => resend.mutate()} disabled={resend.isPending}>
          {resend.isSuccess ? 'Sent' : 'Resend email'}
        </Button>
      }
      sx={{ borderRadius: 0 }}
    >
      Please verify your email address.
    </Alert>
  )
}
