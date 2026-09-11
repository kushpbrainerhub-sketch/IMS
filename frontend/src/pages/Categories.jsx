import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { apiClient } from '../api/client'

export default function Categories() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/categories').then((res) => res.data),
  })

  const createCategory = useMutation({
    mutationFn: (payload) => apiClient.post('/categories', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setName('')
      setError('')
    },
    onError: (err) => setError(err.response?.data?.detail || 'Could not create category'),
  })

  const deleteCategory = useMutation({
    mutationFn: (id) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: (err) => setError(err.response?.data?.detail || 'Could not delete category'),
  })

  const updateCategory = useMutation({
    mutationFn: ({ id, name: newName }) => apiClient.patch(`/categories/${id}`, { name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditingId(null)
    },
    onError: (err) => setError(err.response?.data?.detail || 'Could not rename category'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    createCategory.mutate({ name })
  }

  function startEditing(category) {
    setError('')
    setEditingId(category.id)
    setEditingName(category.name)
  }

  function saveEditing(id) {
    setError('')
    updateCategory.mutate({ id, name: editingName })
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Categories
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Add category
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
          <Button type="submit" variant="contained" disabled={createCategory.isPending} sx={{ mt: 2 }}>
            Add category
          </Button>
        </Box>
      </Paper>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary' }}>
                    No categories yet
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) =>
                  editingId === c.id ? (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <TextField
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          size="small"
                          autoFocus
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => saveEditing(c.id)} disabled={updateCategory.isPending}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setEditingId(null)}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.name}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => startEditing(c)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteCategory.mutate(c.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
