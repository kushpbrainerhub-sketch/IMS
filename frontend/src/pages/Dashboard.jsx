import { useQuery } from '@tanstack/react-query'
import { BarChart } from '@mui/x-charts/BarChart'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { apiClient } from '../api/client'

const currency = (value) =>
  Number(value ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

function KpiCard({ label, value, color }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} color={color}>
        {value}
      </Typography>
    </Paper>
  )
}

export default function Dashboard() {
  const { data: dbHealth } = useQuery({
    queryKey: ['health-db'],
    queryFn: () => apiClient.get('/health/db').then(() => 'connected').catch(() => 'error'),
  })

  const { data: summary } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => apiClient.get('/reports/summary').then((res) => res.data),
  })

  const { data: trend = [] } = useQuery({
    queryKey: ['reports', 'sales-trend'],
    queryFn: () => apiClient.get('/reports/sales-trend', { params: { days: 14 } }).then((res) => res.data),
  })

  const { data: topProducts = [] } = useQuery({
    queryKey: ['reports', 'top-products'],
    queryFn: () => apiClient.get('/reports/top-products', { params: { days: 30, limit: 5 } }).then((res) => res.data),
  })

  const { data: lowStock = [] } = useQuery({
    queryKey: ['reports', 'low-stock'],
    queryFn: () => apiClient.get('/reports/low-stock').then((res) => res.data),
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        <Chip
          label={dbHealth === 'connected' ? 'DB connected' : dbHealth === 'error' ? 'DB unreachable' : 'Checking DB…'}
          color={dbHealth === 'connected' ? 'success' : dbHealth === 'error' ? 'error' : 'default'}
          size="small"
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label={`Today's sales (${summary?.today_sales_count ?? 0})`}
            value={currency(summary?.today_sales_total)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="This month's sales" value={currency(summary?.month_sales_total)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Low stock alerts"
            value={summary?.low_stock_count ?? 0}
            color={summary?.low_stock_count ? 'error.main' : undefined}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Inventory value" value={currency(summary?.inventory_value)} />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Sales trend (last 14 days)
        </Typography>
        <BarChart
          dataset={trend}
          xAxis={[{ scaleType: 'band', dataKey: 'date', valueFormatter: (d) => d.slice(5) }]}
          series={[{ dataKey: 'total', label: 'Sales', valueFormatter: (v) => currency(v) }]}
          height={280}
        />
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined">
            <Box sx={{ p: 2.5, pb: 0 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Top products (30 days)
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Qty sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                        No sales in this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    topProducts.map((p) => (
                      <TableRow key={p.product_id} hover>
                        <TableCell>
                          {p.sku} — {p.name}
                        </TableCell>
                        <TableCell align="right">{p.quantity_sold}</TableCell>
                        <TableCell align="right">{currency(p.revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined">
            <Box sx={{ p: 2.5, pb: 0 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Low stock
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Reorder level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                        All stock levels healthy
                      </TableCell>
                    </TableRow>
                  ) : (
                    lowStock.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          {p.sku} — {p.name}
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={p.quantity} color="error" size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">{p.reorder_level}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
