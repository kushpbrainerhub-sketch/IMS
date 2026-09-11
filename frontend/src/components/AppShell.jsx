import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import CategoryIcon from '@mui/icons-material/CategoryOutlined'
import DashboardIcon from '@mui/icons-material/DashboardOutlined'
import Inventory2Icon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined'
import LogoutIcon from '@mui/icons-material/LogoutOutlined'
import PointOfSaleIcon from '@mui/icons-material/PointOfSaleOutlined'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined'
import StoreIcon from '@mui/icons-material/StoreOutlined'
import SwapVertIcon from '@mui/icons-material/SwapVertOutlined'
import { useAuth } from '../context/AuthContext'

const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Billing', path: '/billing', icon: <PointOfSaleIcon /> },
  { label: 'Sales', path: '/sales', icon: <ReceiptLongIcon /> },
  { label: 'Products', path: '/products', icon: <Inventory2Icon /> },
  { label: 'Categories', path: '/categories', icon: <CategoryIcon /> },
  { label: 'Purchases', path: '/purchases', icon: <LocalShippingIcon /> },
  { label: 'Stock ledger', path: '/stock-ledger', icon: <SwapVertIcon /> },
  { label: 'Suppliers', path: '/suppliers', icon: <StoreIcon /> },
]

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState(null)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap fontWeight={700} color="primary">
            IMS
          </Typography>
        </Toolbar>
        <Divider />
        <List sx={{ px: 1, pt: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ borderBottom: '1px solid #e0e0e0' }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {user?.name} · {user?.role}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.[0]?.toUpperCase() || '?'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={logout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
