import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <nav style={{ display: 'flex', gap: 16, padding: 12, borderBottom: '1px solid #ddd' }}>
      <Link to="/">Dashboard</Link>
      <Link to="/products">Products</Link>
      <span style={{ marginLeft: 'auto' }}>
        {user.name} ({user.role})
      </span>
      <button onClick={logout}>Logout</button>
    </nav>
  )
}
