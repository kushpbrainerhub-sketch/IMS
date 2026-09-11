import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

export default function Invoice({ sale, productName }) {
  return (
    <Box id="invoice-print">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; top: 0; left: 0; width: 100%; padding: 24px; }
        }
      `}</style>
      <Typography variant="h6" fontWeight={700}>
        IMS — Invoice #{sale.id}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {new Date(sale.created_at).toLocaleString()}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Customer: {sale.customer_name || 'Walk-in'}
      </Typography>
      <Typography variant="body2">Payment: {sale.payment_mode}</Typography>

      <Divider sx={{ my: 2 }} />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell align="right">Qty</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sale.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{productName(item.product_id)}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">{item.unit_price}</TableCell>
              <TableCell align="right">
                {(Number(item.unit_price) * item.quantity).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ width: 220 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Subtotal</Typography>
            <Typography variant="body2">{sale.subtotal}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Discount</Typography>
            <Typography variant="body2">-{sale.discount}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Total
            </Typography>
            <Typography variant="subtitle1" fontWeight={700}>
              {sale.total_amount}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
