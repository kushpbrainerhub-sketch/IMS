import { useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined'
import { apiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    icon: <Inventory2OutlinedIcon fontSize="medium" />,
    title: 'Inventory that tracks itself',
    body: 'Products, categories, suppliers, purchases and a full stock ledger — every unit in and out is logged automatically, no spreadsheet required.',
  },
  {
    icon: <PointOfSaleOutlinedIcon fontSize="medium" />,
    title: 'Bill customers at the counter',
    body: 'Ring up a sale, print the invoice, done. Stock updates the moment you check out — no end-of-day reconciliation.',
  },
  {
    icon: <DashboardOutlinedIcon fontSize="medium" />,
    title: 'See where the shop stands',
    body: "Today's sales, this month's revenue, low-stock alerts and your best sellers — one screen, always current.",
  },
  {
    icon: <LockOutlinedIcon fontSize="medium" />,
    title: 'Built for one owner',
    body: "Your own account, your own data — nothing shared with anyone else, nothing to configure before it's ready.",
  },
]

const VALUE_STRIP = [
  'No subscription tiers or upsells',
  'Your data stays on your own server',
  'Ready to use in a few minutes',
]

const STEPS = [
  { n: '1', title: 'Create your account', body: 'A one-time setup — you become the owner of this shop’s system.' },
  { n: '2', title: 'Add your products', body: 'Set up categories, suppliers, and starting stock counts.' },
  { n: '3', title: 'Start billing', body: 'Ring up sales, print invoices, and watch the dashboard fill in.' },
]

function DashboardPreview() {
  return (
    <Paper
      elevation={8}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        maxWidth: 440,
        mx: 'auto',
        border: '1px solid #e3e7ec',
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
            { label: 'Low stock', value: '2 items' },
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
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
          Sales, last 7 days
        </Typography>
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

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  if (loading || user) return null

  const needsSetup = setupStatus?.needs_setup

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', px: { xs: 0 } }}>
            <Typography variant="h6" fontWeight={800} color="primary">
              IMS
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', sm: 'flex' }, mr: 2 }}>
              <Button color="inherit" href="#features">
                Features
              </Button>
              <Button color="inherit" href="#how-it-works">
                How it works
              </Button>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Button component={RouterLink} to="/login" color="inherit">
                Log in
              </Button>
              <Button component={RouterLink} to="/signup" variant="contained">
                Get started
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Box
        component="section"
        sx={{
          py: { xs: 7, md: 12 },
          background: 'linear-gradient(180deg, rgba(47,93,138,0.06) 0%, rgba(47,93,138,0) 60%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h2"
                fontWeight={800}
                sx={{ fontSize: { xs: '2.1rem', md: '3rem' }, lineHeight: 1.15, mb: 2.5 }}
              >
                Stop running your shop from a notebook and a calculator
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ mb: 4, maxWidth: 480 }}>
                IMS brings stock, purchases, billing and reporting into one system — set up once,
                run entirely by you.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3.5 }}>
                <Button
                  component={RouterLink}
                  to={needsSetup ? '/signup' : '/login'}
                  variant="contained"
                  size="large"
                >
                  {needsSetup ? 'Create your account' : 'Log in'}
                </Button>
                <Button href="#how-it-works" variant="outlined" size="large">
                  See how it works
                </Button>
              </Stack>
              <Stack spacing={1}>
                {VALUE_STRIP.map((v) => (
                  <Stack key={v} direction="row" spacing={1} alignItems="center">
                    <CheckCircleOutlineIcon fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {v}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DashboardPreview />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="features" component="section" sx={{ py: { xs: 7, md: 10 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="overline" color="primary" fontWeight={700} textAlign="center" sx={{ display: 'block' }}>
            Features
          </Typography>
          <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>
            Everything your shop needs, nothing it doesn't
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6, maxWidth: 560, mx: 'auto' }}>
            No modules to enable, no add-ons to buy — it's all here from the first login.
          </Typography>
          <Grid container spacing={3}>
            {FEATURES.map((f) => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, height: '100%', transition: 'box-shadow .2s, transform .2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'rgba(47,93,138,0.1)',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    {f.icon}
                  </Box>
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

      <Box id="how-it-works" component="section" sx={{ py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="overline" color="primary" fontWeight={700} textAlign="center" sx={{ display: 'block' }}>
            How it works
          </Typography>
          <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 6 }}>
            From zero to billing your first customer
          </Typography>
          <Grid container spacing={4}>
            {STEPS.map((s) => (
              <Grid key={s.n} size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
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

      <Box component="section" sx={{ py: { xs: 7, md: 9 }, bgcolor: 'primary.main', color: '#fff' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>
            {needsSetup ? "Your shop's system, set up in minutes" : 'Pick up right where you left off'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            {needsSetup
              ? 'No sales calls, no demos to sit through — create your account and start today.'
              : 'Log back in to check stock, ring up sales, or see how the shop is doing.'}
          </Typography>
          <Button
            component={RouterLink}
            to={needsSetup ? '/signup' : '/login'}
            variant="contained"
            size="large"
            sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f0f0f0' } }}
          >
            {needsSetup ? 'Create your account' : 'Go to log in'}
          </Button>
        </Container>
      </Box>

      <Box component="footer" sx={{ pt: 6, pb: 4, borderTop: '1px solid #e0e0e0', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <Typography variant="subtitle1" fontWeight={800} color="primary" gutterBottom>
                IMS
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
                Inventory and billing for your shop, run entirely by you — one account, one
                system, nothing shared.
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Product
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Link href="#features" underline="hover" color="text.secondary" variant="body2">
                  Features
                </Link>
                <Link href="#how-it-works" underline="hover" color="text.secondary" variant="body2">
                  How it works
                </Link>
              </Stack>
            </Grid>
            <Grid size={{ xs: 6, sm: 3.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Account
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Link component={RouterLink} to="/login" underline="hover" color="text.secondary" variant="body2">
                  Log in
                </Link>
                <Link component={RouterLink} to="/signup" underline="hover" color="text.secondary" variant="body2">
                  Sign up
                </Link>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ pt: 3, borderTop: '1px solid #eef1f4' }}>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} IMS. Built for one shop, one owner.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
