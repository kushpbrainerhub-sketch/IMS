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
import { apiClient } from '../api/client'

export default function EditSupplierDialog({ supplier, onClose }) {
  const [form, setForm] = useState({
    name: supplier.name,
    phone: supplier.phone || '',
    email: supplier.email || '',
    address: supplier.address || '',
  })
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const updateSupplier = useMutation({
    mutationFn: (payload) => apiClient.patch(`/suppliers/${supplier.id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      onClose()
    },
    onError: (err) => setError(err.response?.data?.detail || 'Could not update supplier'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    updateSupplier.mutate(form)
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit supplier</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              size="small"
              fullWidth
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              size="small"
              fullWidth
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={updateSupplier.isPending}>
            Save changes
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
