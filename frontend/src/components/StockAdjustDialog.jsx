import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { apiClient } from '../api/client'

export default function StockAdjustDialog({ product, onClose }) {
  const [changeQty, setChangeQty] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const adjust = useMutation({
    mutationFn: (payload) => apiClient.post('/stock/adjustments', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
    onError: (err) => setError(err.response?.data?.detail || 'Could not adjust stock'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const qty = Number(changeQty)
    if (!qty) {
      setError('Enter a non-zero quantity')
      return
    }
    adjust.mutate({ product_id: product.id, change_qty: qty, note: note || null })
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Adjust stock — {product.name}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current quantity: {product.quantity} {product.unit}. Use a positive number to add
            stock (e.g. found extra), negative to remove (e.g. damage, correction).
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Change quantity (+/-)"
              type="number"
              value={changeQty}
              onChange={(e) => setChangeQty(e.target.value)}
              autoFocus
              required
              size="small"
              fullWidth
            />
            <TextField
              label="Note (reason)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              size="small"
              fullWidth
              multiline
              minRows={2}
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={adjust.isPending}>
            Save adjustment
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
