import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export default function Products() {
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    sku: '',
    name: '',
    category_id: '',
    unit: 'pcs',
    cost_price: '',
    sell_price: '',
    quantity: '',
    reorder_level: '',
  })
  const [newCategory, setNewCategory] = useState('')

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
      setForm({
        sku: '',
        name: '',
        category_id: '',
        unit: 'pcs',
        cost_price: '',
        sell_price: '',
        quantity: '',
        reorder_level: '',
      })
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
    <div>
      <h1>Products</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Categories</h2>
        <ul>
          {categories.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (newCategory.trim()) createCategory.mutate(newCategory.trim())
          }}
        >
          <input
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="submit">Add category</button>
        </form>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Add product</h2>
        <form onSubmit={handleCreateProduct}>
          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            required
          />
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Unit"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
          <input
            placeholder="Cost price"
            type="number"
            step="0.01"
            value={form.cost_price}
            onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
          />
          <input
            placeholder="Sell price"
            type="number"
            step="0.01"
            value={form.sell_price}
            onChange={(e) => setForm({ ...form, sell_price: e.target.value })}
          />
          <input
            placeholder="Quantity"
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <input
            placeholder="Reorder level"
            type="number"
            value={form.reorder_level}
            onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
          />
          <button type="submit" disabled={createProduct.isPending}>
            Add product
          </button>
        </form>
      </section>

      <section>
        <h2>Inventory</h2>
        <input
          placeholder="Search by name or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Unit</th>
                <th>Cost</th>
                <th>Sell</th>
                <th>Qty</th>
                <th>Reorder level</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ background: p.quantity <= p.reorder_level ? '#fee' : undefined }}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.unit}</td>
                  <td>{p.cost_price}</td>
                  <td>{p.sell_price}</td>
                  <td>{p.quantity}</td>
                  <td>{p.reorder_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
