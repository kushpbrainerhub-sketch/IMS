import { Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import Billing from './pages/Billing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Products from './pages/Products'
import Purchases from './pages/Purchases'
import Suppliers from './pages/Suppliers'

function withShell(element) {
  return (
    <ProtectedRoute>
      <AppShell>{element}</AppShell>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={withShell(<Dashboard />)} />
      <Route path="/billing" element={withShell(<Billing />)} />
      <Route path="/products" element={withShell(<Products />)} />
      <Route path="/purchases" element={withShell(<Purchases />)} />
      <Route path="/suppliers" element={withShell(<Suppliers />)} />
    </Routes>
  )
}

export default App
