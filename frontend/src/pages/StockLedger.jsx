import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
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
import { apiClient } from '../api/client'

const REASON_COLORS = {
  purchase: 'success',
  sale: 'error',
  adjustment: 'warning',
}

export default function StockLedger() {
  const [productId, setProductId] = useState('')

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products').then((res) => res.data),
  })

  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ['stock-ledger', productId],
    queryFn: () =>
      apiClient
        .get('/stock/ledger', { params: productId ? { product_id: productId } : {} })
        .then((res) => res.data),
  })

  const productName = (id) => {
    const p = products.find((prod) => prod.id === id)
    return p ? `${p.sku} — ${p.name}` : `#${id}`
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Stock ledger
      </Typography>

      <Paper variant="outlined">
        <Box sx={{ p: 2.5, pb: 0 }}>
          <TextField
            select
            label="Filter by product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            size="small"
            sx={{ mb: 2, width: 320 }}
          >
            <MenuItem value="">All products</MenuItem>
            {products.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.sku} — {p.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Change</TableCell>
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : ledger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                    No stock movements yet
                  </TableCell>
                </TableRow>
              ) : (
                ledger.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                    <TableCell>{productName(entry.product_id)}</TableCell>
                    <TableCell>
                      <Chip label={entry.reason} size="small" color={REASON_COLORS[entry.reason]} variant="outlined" />
                    </TableCell>
                    <TableCell align="right" sx={{ color: entry.change_qty < 0 ? 'error.main' : 'success.main' }}>
                      {entry.change_qty > 0 ? `+${entry.change_qty}` : entry.change_qty}
                    </TableCell>
                    <TableCell>{entry.note || '—'}</TableCell>
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
