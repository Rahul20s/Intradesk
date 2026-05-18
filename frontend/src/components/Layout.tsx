import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider, Collapse, Avatar, InputBase
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SearchIcon from '@mui/icons-material/Search';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useMsal } from '@azure/msal-react';

const drawerWidth = 235;

const colors = {
  sidebarBg: 'var(--sidebar-bg)',
  activeItemBg: 'var(--sidebar-active-bg)',
  activeItemBorder: 'var(--sidebar-active-border)',
  activeItemText: 'var(--sidebar-active-text)',
  inactiveItemText: 'var(--sidebar-text)',
  headerBg: 'var(--header-bg)',
  headerText: 'var(--header-text)',
  pageBg: 'var(--page-bg)',
  accentLime: 'var(--accent-lime)'
};

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { instance, accounts } = useMsal();
  
  const userName = accounts.length > 0 && accounts[0].name ? accounts[0].name.split(' ')[0] : 'Admin';
  const isAdmin = () => accounts.length > 0 && 
    (accounts[0].username.toLowerCase() === 'rahul.sharma@cfmarc.in' ||
     accounts[0].username.toLowerCase() === 'akash.yadav@cfmarc.in');

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    instance.logoutPopup({ postLogoutRedirectUri: '/', mainWindowRedirectUri: '/' });
  };

  const handleMenuClick = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isExactSelected = (path: string) => location.pathname === path || location.pathname === `${path}/`;

  const menuConfig = [
    { text: 'Dashboard', path: '/dashboard' },
    { 
      text: 'Policies', path: '/documents/policies',
      children: [
        { text: 'HR', path: '/documents/policies/HR' },
        { text: 'IT', path: '/documents/policies/IT' },
        { text: 'Company', path: '/documents/policies/Company' },
      ]
    },
    { 
      text: 'SOPs', path: '/documents/sops',
      children: [
        { text: 'LMS', path: '/documents/sops/LMS' },
        { text: 'Spine', path: '/documents/sops/Spine' },
        { text: 'SAP', path: '/documents/sops/SAP' },
        { text: 'General', path: '/documents/sops/General' },
      ]
    },
    { text: 'Forms & Templates', path: '/documents/templates' },
    { text: 'FAQs', path: '/documents/faqs' },
    { text: 'Guidelines', path: '/documents/guidelines' },
    ...(isAdmin() ? [{ text: 'Admin Panel', path: '/admin' }] : []),
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: colors.sidebarBg }}>
      {/* Top Logo Block */}
      <Box sx={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: 64,
        background: colors.accentLime, color: '#ffffff'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 1 }}>INTRADESK</Typography>
      </Box>

      {/* Sidebar Search Bar */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', alignItems: 'center', backgroundColor: '#1A212A', 
          borderRadius: 8, px: 2, py: 0.5 
        }}>
          <SearchIcon sx={{ color: '#6A7582', fontSize: 20, mr: 1 }} />
          <InputBase placeholder="Search..." sx={{ color: '#ffffff', fontSize: '0.85rem', width: '100%' }} />
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* Sidebar Menu */}
      <List sx={{ flexGrow: 1, pt: 1, overflowY: 'auto' }}>
        {menuConfig.map((item) => {
          const isActive = !item.children && isExactSelected(item.path);
          return (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive}
                  onClick={() => item.children ? handleMenuClick(item.text) : navigate(item.path)}
                  sx={{
                    px: 3, py: 1,
                    color: isActive ? colors.activeItemText : colors.inactiveItemText,
                    '&.Mui-selected': {
                      backgroundColor: 'transparent', 
                      color: colors.activeItemText,
                      '&:hover': { backgroundColor: colors.activeItemBg },
                    },
                    '&:hover': { backgroundColor: colors.activeItemBg },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                    {isActive ? <FiberManualRecordIcon sx={{ fontSize: 10, color: colors.accentLime }} /> : <FiberManualRecordIcon sx={{ fontSize: 6 }} />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem', fontWeight: isActive ? 500 : 400 } }}
                  />
                  {item.children ? (openMenus[item.text] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />) : null}
                </ListItemButton>
              </ListItem>
              {item.children && (
                <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => {
                      const isChildActive = isExactSelected(child.path);
                      return (
                        <ListItemButton
                          key={child.text}
                          selected={isChildActive}
                          onClick={() => navigate(child.path)}
                          sx={{
                            pl: 7, pr: 3, py: 0.5,
                            color: isChildActive ? colors.activeItemText : colors.inactiveItemText,
                            '&.Mui-selected': {
                              backgroundColor: 'transparent',
                              '&:hover': { backgroundColor: colors.activeItemBg },
                            },
                            '&:hover': { backgroundColor: colors.activeItemBg },
                          }}
                        >
                          <ListItemText 
                            primary={child.text} 
                            sx={{ '& .MuiListItemText-primary': { fontSize: '0.75rem', fontWeight: isChildActive ? 500 : 400 } }}
                          />
                        </ListItemButton>
                      )
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          )
        })}
      </List>

      {/* Logout at bottom */}
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1, color: colors.inactiveItemText, '&:hover': { color: colors.activeItemText, backgroundColor: colors.activeItemBg } }}>
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, backgroundColor: colors.headerBg, boxShadow: 'none', borderBottom: `1px solid var(--header-border)` }}>
        <Toolbar sx={{ minHeight: '64px !important', display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' }, color: colors.headerText }}>
              <MenuIcon />
            </IconButton>
            <Box component="img" src="/company-logo.png" sx={{ height: 32, mr: 1.5 }} alt="Logo" />
            <Typography variant="h6" noWrap component="div" sx={{ color: colors.headerText, fontWeight: 500 }}>
              CFM Asset Reconstruction Private Limited
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--header-border)', pl: 3, ml: 2, height: 64 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-muted)', mr: 1.5, display: { xs: 'none', sm: 'block' } }}>Welcome,</Typography>
            <Avatar src="/default-avatar.png" sx={{ width: 32, height: 32, mr: 1.5, bgcolor: colors.accentLime }}>
              {userName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600, lineHeight: 1.2 }}>{userName}</Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: colors.sidebarBg, borderRight: 'none' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: colors.sidebarBg, borderRight: 'none' } }} open>
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, backgroundColor: colors.pageBg, minHeight: '100vh' }}>
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;

