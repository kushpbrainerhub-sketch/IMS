import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import TuneIcon from '@mui/icons-material/Tune'
import EditProductDialog from '../components/EditProductDialog'
import StockAdjustDialog from '../components/StockAdjustDialog'
import { apiClient } from '../api/client'

function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/categories').then((res) => res.data),
  })
}

function useProducts(search) {
  return useQuery({
    queryKey: ['products', search],
    queryFn: () =>
      apiClient.get('/products', { params: search ? { search } : {} }).then((res) => res.data),
  })
}

const emptyProductForm = {
  sku: '',
  name: '',
  category_id: '',
  unit: 'pcs',
  cost_price: '',
  sell_price: '',
  quantity: '',
  reorder_level: '',
}

export default function Products() {
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyProductForm)
  const [newCategory, setNewCategory] = useState('')
  const [adjustingProduct, setAdjustingProduct] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)

  const queryClient = useQueryClient()
  const { data: categories = [] } = useCategories()
  const { data: products = [], isLoading } = useProducts(search)

  const createCategory = useMutation({
    mutationFn: (name) => apiClient.post('/categories', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setNewCategory('')
    },
  })

  const createProduct = useMutation({
    mutationFn: (payload) => apiClient.post('/products', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setForm(emptyProductForm)
    },
  })

  function handleCreateProduct(e) {
    e.preventDefault()
    createProduct.mutate({
      sku: form.sku,
      name: form.name,
      category_id: form.category_id ? Number(form.category_id) : null,
      unit: form.unit,
      cost_price: Number(form.cost_price || 0),
      sell_price: Number(form.sell_price || 0),
      quantity: Number(form.quantity || 0),
      reorder_level: Number(form.reorder_level || 0),
    })
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Products
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Categories
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2, minHeight: 32 }}>
              {categories.map((c) => (
                <Chip key={c.id} label={c.name} size="small" />
              ))}
            </Stack>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault()
                if (newCategory.trim()) createCategory.mutate(newCategory.trim())
              }}
              sx={{ display: 'flex', gap: 1 }}
            >
              <TextField
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                size="small"
                fullWidth
              />
              <Button type="submit" variant="outlined" disabled={createCategory.isPending}>
                Add
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Add product
            </Typography>
            <Box component="form" onSubmit={handleCreateProduct}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    label="SKU"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 5 }}>
                  <TextField
                    label="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
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
                <Grid size={{ xs: 6, sm: 2 }}>
                  <TextField
                    label="Unit"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 2.5 }}>
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
                <Grid size={{ xs: 6, sm: 2.5 }}>
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
                <Grid size={{ xs: 6, sm: 2.5 }}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 2.5 }}>
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
              <Button type="submit" variant="contained" disabled={createProduct.isPending} sx={{ mt: 2 }}>
                Add product
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined">
        <Box sx={{ p: 2.5, pb: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Inventory
          </Typography>
          <TextField
            placeholder="Search by name or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ mb: 2, width: 320 }}
          />
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell align="right">Sell</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Reorder level</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary' }}>
                    No products yet
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const low = p.quantity <= p.reorder_level
                  return (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell align="right">{p.cost_price}</TableCell>
                      <TableCell align="right">{p.sell_price}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                          <span>{p.quantity}</span>
                          {low && <Chip label="Low stock" color="warning" size="small" />}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{p.reorder_level}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit product">
                          <IconButton size="small" onClick={() => setEditingProduct(p)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Adjust stock">
                          <IconButton size="small" onClick={() => setAdjustingProduct(p)}>
                            <TuneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {adjustingProduct && (
        <StockAdjustDialog product={adjustingProduct} onClose={() => setAdjustingProduct(null)} />
      )}
      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </Box>
  )
}
