import { useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined'
import { apiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    icon: <Inventory2OutlinedIcon fontSize="large" />,
    title: 'Inventory that tracks itself',
    body: 'Products, categories, suppliers, purchases and a full stock ledger — every unit in and out is logged automatically.',
  },
  {
    icon: <PointOfSaleOutlinedIcon fontSize="large" />,
    title: 'Billing at the counter',
    body: 'Ring up a sale, print the invoice, done. Stock updates the moment you check out — no separate reconciliation step.',
  },
  {
    icon: <DashboardOutlinedIcon fontSize="large" />,
    title: 'Know your numbers',
    body: "Today's sales, this month's revenue, low-stock alerts and your best sellers, on one dashboard.",
  },
  {
    icon: <LockOutlinedIcon fontSize="large" />,
    title: 'Yours alone',
    body: "One owner account, one shop's data. Nothing shared, nothing to configure — sign up once and it's set up.",
  },
]

const STEPS = [
  { n: '1', title: 'Create your account', body: 'One-time signup — you become the owner of this shop.' },
  { n: '2', title: 'Add your products', body: 'Set up categories, suppliers and starting stock.' },
  { n: '3', title: 'Start selling', body: 'Bill customers, track stock, watch the dashboard fill in.' },
]

function DashboardPreview() {
  return (
    <Paper
      elevation={6}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        maxWidth: 420,
        mx: 'auto',
      }}
    >
      <Box sx={{ px: 2, py: 1, bgcolor: '#eef1f4', display: 'flex', gap: 0.75 }}>
        {['#e05252', '#e0a852', '#52b788'].map((c) => (
          <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
        ))}
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[
            { label: "Today's sales", value: '₹2,404' },
            { label: 'Low stock', value: '2' },
          ].map((kpi) => (
            <Grid key={kpi.label} size={6}>
              <Paper variant="outlined" sx={{ p: 1.25 }}>
                <Typography variant="caption" color="text.secondary">
                  {kpi.label}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {kpi.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 72 }}>
          {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
            <Box
              key={i}
              sx={{ flex: 1, height: `${h}%`, borderRadius: 0.5, bgcolor: 'primary.main', opacity: 0.35 + i * 0.09 }}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  )
}

export default function Landing() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const { data: setupStatus } = useQuery({
    queryKey: ['setup-status'],
    queryFn: () => apiClient.get('/auth/setup-status').then((res) => res.data),
    enabled: !loading && !user,
  })

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [loading, user, navigate])

  if (loading || user) return null

  const needsSetup = setupStatus?.needs_setup
  const primaryCta = { to: needsSetup ? '/signup' : '/login', label: needsSetup ? 'Get started' : 'Log in' }

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', px: { xs: 0 } }}>
            <Typography variant="h6" fontWeight={800} color="primary">
              IMS
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1.5}>
              {!needsSetup && (
                <Button component={RouterLink} to="/login" color="inherit">
                  Log in
                </Button>
              )}
              <Button component={RouterLink} to={primaryCta.to} variant="contained">
                {needsSetup ? 'Get started' : 'Sign up'}
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: '2.25rem', md: '3rem' }, mb: 2 }}>
                Inventory &amp; billing, run from one place
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ mb: 4 }}>
                IMS replaces the notebook, the calculator and the separate billing app with one
                system: stock, purchases, sales and reports, all in sync.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to={primaryCta.to} variant="contained" size="large">
                  {primaryCta.label}
                </Button>
                {needsSetup && (
                  <Button component={RouterLink} to="/login" variant="outlined" size="large">
                    Already set up? Log in
                  </Button>
                )}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DashboardPreview />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 6, md: 9 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>
            Everything your shop needs
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
            No modules to enable, no add-ons to buy — it's all here from the first login.
          </Typography>
          <Grid container spacing={3}>
            {FEATURES.map((f) => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 1.5 }}>{f.icon}</Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.body}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 6 }}>
            Set up in three steps
          </Typography>
          <Grid container spacing={4}>
            {STEPS.map((s) => (
              <Grid key={s.n} size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5} alignItems={{ xs: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {s.n}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {s.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.body}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 6, md: 8 }, bgcolor: 'primary.main', color: '#fff' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>
            {needsSetup ? 'Set up your shop today' : 'Welcome back'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            {needsSetup
              ? 'Takes a couple of minutes. No card, no trial, no one else to wait on.'
              : 'Pick up right where you left off.'}
          </Typography>
          <Button
            component={RouterLink}
            to={primaryCta.to}
            variant="contained"
            size="large"
            sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f0f0f0' } }}
          >
            {primaryCta.label}
          </Button>
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 3, borderTop: '1px solid #e0e0e0' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" textAlign="center">
            IMS — Inventory &amp; billing for your shop.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
