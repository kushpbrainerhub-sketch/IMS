import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { apiClient } from '../api/client'

const emptyLine = { product_id: '', quantity: '', unit_cost: '' }

export default function Purchases() {
  const [supplierId, setSupplierId] = useState('')
  const [lines, setLines] = useState([{ ...emptyLine }])
  const [error, setError] = useState('')

  const queryClient = useQueryClient()

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => apiClient.get('/suppliers').then((res) => res.data),
  })
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products').then((res) => res.data),
  })
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => apiClient.get('/purchases').then((res) => res.data),
  })

  const recordPurchase = useMutation({
    mutationFn: (payload) => apiClient.post('/purchases', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setSupplierId('')
      setLines([{ ...emptyLine }])
      setError('')
    },
    onError: (err) => setError(err.response?.data?.detail || 'Could not record purchase'),
  })

  function updateLine(index, field, value) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)))
  }

  function addLine() {
    setLines((prev) => [...prev, { ...emptyLine }])
  }

  function removeLine(index) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!supplierId) {
      setError('Select a supplier')
      return
    }
    const items = lines
      .filter((l) => l.product_id && l.quantity && l.unit_cost)
      .map((l) => ({
        product_id: Number(l.product_id),
        quantity: Number(l.quantity),
        unit_cost: Number(l.unit_cost),
      }))
    if (items.length === 0) {
      setError('Add at least one valid line item')
      return
    }
    recordPurchase.mutate({ supplier_id: Number(supplierId), items })
  }

  const productName = (id) => products.find((p) => p.id === id)?.name || `#${id}`

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Purchases (Stock-in)
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Record a purchase
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            select
            label="Supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            size="small"
            sx={{ width: 280, mb: 2 }}
            required
          >
            {suppliers.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          {lines.map((line, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 1 }} alignItems="center">
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  select
                  label="Product"
                  value={line.product_id}
                  onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                  size="small"
                  fullWidth
                >
                  {products.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.sku} — {p.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 5, sm: 3 }}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={line.quantity}
                  onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 5, sm: 3 }}>
                <TextField
                  label="Unit cost"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={line.unit_cost}
                  onChange={(e) => updateLine(index, 'unit_cost', e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton onClick={() => removeLine(index)} disabled={lines.length === 1}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button startIcon={<AddIcon />} onClick={addLine} sx={{ mt: 1 }}>
            Add line
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" disabled={recordPurchase.isPending}>
              Record purchase
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper variant="outlined">
        <Box sx={{ p: 2.5, pb: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Purchase history
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                    No purchases recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id} hover>
                    <TableCell>{purchase.id}</TableCell>
                    <TableCell>
                      {purchase.items
                        .map((item) => `${productName(item.product_id)} × ${item.quantity}`)
                        .join(', ')}
                    </TableCell>
                    <TableCell align="right">{purchase.total_amount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
