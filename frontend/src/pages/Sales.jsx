import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import PrintIcon from '@mui/icons-material/PrintOutlined'
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined'
import Invoice from '../components/Invoice'
import { apiClient } from '../api/client'

export default function Sales() {
  const [selectedSale, setSelectedSale] = useState(null)

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => apiClient.get('/sales').then((res) => res.data),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products').then((res) => res.data),
  })

  const productName = (id) => products.find((p) => p.id === id)?.name || `#${id}`

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Sales history
      </Typography>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary' }}>
                    No sales recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id} hover>
                    <TableCell>{sale.id}</TableCell>
                    <TableCell>{new Date(sale.created_at).toLocaleString()}</TableCell>
                    <TableCell>{sale.customer_name || 'Walk-in'}</TableCell>
                    <TableCell>
                      {sale.items.map((item) => `${productName(item.product_id)} × ${item.quantity}`).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Chip label={sale.payment_mode.toUpperCase()} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">{sale.total_amount}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setSelectedSale(sale)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(selectedSale)} onClose={() => setSelectedSale(null)} maxWidth="xs" fullWidth>
        <DialogContent>
          {selectedSale && <Invoice sale={selectedSale} productName={productName} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelectedSale(null)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
