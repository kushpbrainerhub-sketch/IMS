import { Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import Billing from './pages/Billing'
import Categories from './pages/Categories'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Products from './pages/Products'
import Purchases from './pages/Purchases'
import ResetPassword from './pages/ResetPassword'
import Sales from './pages/Sales'
import Signup from './pages/Signup'
import StockLedger from './pages/StockLedger'
import Suppliers from './pages/Suppliers'
import VerifyEmail from './pages/VerifyEmail'

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
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={withShell(<Dashboard />)} />
      <Route path="/billing" element={withShell(<Billing />)} />
      <Route path="/sales" element={withShell(<Sales />)} />
      <Route path="/products" element={withShell(<Products />)} />
      <Route path="/categories" element={withShell(<Categories />)} />
      <Route path="/purchases" element={withShell(<Purchases />)} />
      <Route path="/stock-ledger" element={withShell(<StockLedger />)} />
      <Route path="/suppliers" element={withShell(<Suppliers />)} />
    </Routes>
  )
}

export default App
