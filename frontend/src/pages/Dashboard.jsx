import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'

export default function Dashboard() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    apiClient
      .get('/health/db')
      .then((res) => setStatus(`Backend + DB connected (${res.data.status})`))
      .catch(() => setStatus('Could not reach backend'))
  }, [])

  return (
    <div>
      <h1>IMS Dashboard</h1>
      <p>{status}</p>
    </div>
  )
}
