import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PrintIcon from '@mui/icons-material/PrintOutlined'
import Invoice from '../components/Invoice'
import { apiClient } from '../api/client'

const PAYMENT_MODES = ['cash', 'card', 'upi', 'other']

export default function Billing() {
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [discount, setDiscount] = useState('0')
  const [paymentMode, setPaymentMode] = useState('cash')
  const [error, setError] = useState('')
  const [completedSale, setCompletedSale] = useState(null)

  const queryClient = useQueryClient()

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products').then((res) => res.data),
  })

  const productName = (id) => products.find((p) => p.id === id)?.name || `#${id}`

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.sell_price * line.quantity, 0),
    [cart],
  )
  const total = Math.max(0, subtotal - Number(discount || 0))

  const recordSale = useMutation({
    mutationFn: (payload) => apiClient.post('/sales', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setCompletedSale(res.data)
      setCart([])
      setCustomerName('')
      setDiscount('0')
      setPaymentMode('cash')
      setError('')
    },
    onError: (err) => setError(err.response?.data?.detail || 'Could not complete sale'),
  })

  function addProduct(product) {
    if (!product) return
    setCart((prev) => {
      const existing = prev.find((l) => l.id === product.id)
      if (existing) {
        return prev.map((l) => (l.id === product.id ? { ...l, quantity: l.quantity + 1 } : l))
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          sell_price: product.sell_price,
          available: product.quantity,
          quantity: 1,
        },
      ]
    })
  }

  function updateQuantity(id, quantity) {
    setCart((prev) => prev.map((l) => (l.id === id ? { ...l, quantity: Number(quantity) || 0 } : l)))
  }

  function removeLine(id) {
    setCart((prev) => prev.filter((l) => l.id !== id))
  }

  function handleCheckout() {
    setError('')
    const items = cart.filter((l) => l.quantity > 0).map((l) => ({ product_id: l.id, quantity: l.quantity }))
    if (items.length === 0) {
      setError('Add at least one product to the cart')
      return
    }
    recordSale.mutate({
      customer_name: customerName || null,
      discount: Number(discount || 0),
      payment_mode: paymentMode,
      items,
    })
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Billing
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Autocomplete
              options={products}
              getOptionLabel={(p) => `${p.sku} — ${p.name} (${p.quantity} in stock)`}
              onChange={(_, value) => addProduct(value)}
              renderInput={(params) => (
                <TextField {...params} label="Search product to add" size="small" />
              )}
              value={null}
              blurOnSelect
              clearOnBlur
            />
          </Paper>

          <Paper variant="outlined">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Line total</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                        Cart is empty — search a product above
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((line) => (
                      <TableRow key={line.id} hover>
                        <TableCell>{line.name}</TableCell>
                        <TableCell align="right">{line.sell_price}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={line.quantity}
                            onChange={(e) => updateQuantity(line.id, e.target.value)}
                            size="small"
                            sx={{ width: 80 }}
                            inputProps={{ min: 1, max: line.available }}
                            error={line.quantity > line.available}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {(line.sell_price * line.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => removeLine(line.id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Checkout
            </Typography>
            <TextField
              label="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Payment mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            >
              {PAYMENT_MODES.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode.toUpperCase()}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Discount"
              type="number"
              inputProps={{ step: '0.01' }}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {total.toFixed(2)}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleCheckout}
              disabled={recordSale.isPending}
            >
              Complete sale
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={Boolean(completedSale)} onClose={() => setCompletedSale(null)} maxWidth="xs" fullWidth>
        <DialogContent>
          {completedSale && <Invoice sale={completedSale} productName={productName} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCompletedSale(null)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
