import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { apiClient } from '../api/client'

export default function EditProductDialog({ product, categories, onClose }) {
  const [form, setForm] = useState({
    sku: product.sku,
    name: product.name,
    category_id: product.category_id ?? '',
    unit: product.unit === 'pcs' ? '' : product.unit,
    cost_price: product.cost_price,
    sell_price: product.sell_price,
    reorder_level: product.reorder_level,
  })
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const updateProduct = useMutation({
    mutationFn: (payload) => apiClient.patch(`/products/${product.id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
    onError: (err) => setError(err.response?.data?.detail || 'Could not update product'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    updateProduct.mutate({
      sku: form.sku,
      name: form.name,
      category_id: form.category_id ? Number(form.category_id) : null,
      unit: form.unit.trim() || 'pcs',
      cost_price: Number(form.cost_price || 0),
      sell_price: Number(form.sell_price || 0),
      reorder_level: Number(form.reorder_level || 0),
    })
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit product</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 8 }}>
              <TextField
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <TextField
                select
                label="Category"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                size="small"
                fullWidth
              >
                <MenuItem value="">No category</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <TextField
                label="Unit"
                placeholder="pcs"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                onBlur={() => {
                  if (/^\d+$/.test(form.unit.trim())) {
                    setForm((f) => ({ ...f, unit: `${f.unit.trim()} pcs` }))
                  }
                }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="Cost price"
                type="number"
                inputProps={{ step: '0.01' }}
                value={form.cost_price}
                onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="Sell price"
                type="number"
                inputProps={{ step: '0.01' }}
                value={form.sell_price}
                onChange={(e) => setForm({ ...form, sell_price: e.target.value })}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="Reorder level"
                type="number"
                value={form.reorder_level}
                onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={updateProduct.isPending}>
            Save changes
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
