import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Button, Divider, Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Description from '@mui/icons-material/Description';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ArticleIcon from '@mui/icons-material/Article';
import HelpIcon from '@mui/icons-material/Help';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useMsal } from '@azure/msal-react';

const drawerWidth = 260;

const colors = {
  sidebarBg: 'var(--sidebar-bg)',
  activeItemBg: 'var(--sidebar-active-bg)',
  activeItemBorder: 'var(--sidebar-active-border)',
  activeItemText: 'var(--sidebar-active-text)',
  inactiveItemText: 'var(--sidebar-text)',
  sectionLabels: 'var(--sidebar-label)',
  headerBg: 'var(--header-bg)',
  headerText: 'var(--header-text)',
  logoutBorder: 'var(--header-border)',
  logoutText: 'var(--header-text)',
  pageBg: 'var(--page-bg)',
  cardBorder: 'var(--card-border)',
};

const drawerBgStyle = {
  boxSizing: 'border-box' as const, 
  width: drawerWidth, 
  backgroundColor: colors.sidebarBg,
  backgroundImage: `linear-gradient(to bottom, rgba(13, 13, 13, 0.75), rgba(13, 13, 13, 0.95)), url('/sidebar-bg.png')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRight: `1px solid #222222`
};

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { instance, accounts } = useMsal();
  
  const isAdmin = () => accounts.length > 0 && accounts[0].username.toLowerCase() === 'rahul.sharma@cfmarc.in';

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    instance.logoutPopup({ postLogoutRedirectUri: '/', mainWindowRedirectUri: '/' });
  };

  const handleMenuClick = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isExactSelected = (path: string) => location.pathname === path || location.pathname === `${path}/`;

  const menuConfig = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { 
      text: 'Policies', icon: <Description />, path: '/documents/policies',
      children: [
        { text: 'HR', path: '/documents/policies/HR' },
        { text: 'IT', path: '/documents/policies/IT' },
        { text: 'Company', path: '/documents/policies/Company' },
      ]
    },
    { 
      text: 'SOPs', icon: <LibraryBooksIcon />, path: '/documents/sops',
      children: [
        { text: 'LMS', path: '/documents/sops/LMS' },
        { text: 'Spine', path: '/documents/sops/Spine' },
        { text: 'SAP', path: '/documents/sops/SAP' },
      ]
    },
    { text: 'Forms & Templates', icon: <ArticleIcon />, path: '/documents/templates' },
    { text: 'FAQs', icon: <HelpIcon />, path: '/documents/faqs' },
    { text: 'Guidelines', icon: <MenuBookIcon />, path: '/documents/guidelines' },
    ...(isAdmin() ? [{ text: 'Admin Panel', icon: <AdminPanelSettingsIcon />, path: '/admin' }] : []),
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3,
        background: 'transparent', borderBottom: `1px solid #222222`
      }}>
        <Box component="img" sx={{ height: 70, width: 'auto', maxWidth: '90%', objectFit: 'contain' }} alt="Logo" src="/company-logo.png" />
      </Toolbar>
      <Divider sx={{ borderColor: '#222222' }} />
      <List sx={{ py: 2 }}>
        {menuConfig.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={!item.children && isExactSelected(item.path)}
                onClick={() => item.children ? handleMenuClick(item.text) : navigate(item.path)}
                sx={{
                  mx: 2, borderRadius: 2, px: 2, py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: colors.activeItemBg, borderLeft: `3px solid ${colors.activeItemBorder}`,
                    color: colors.activeItemText,
                    '&:hover': { backgroundColor: colors.activeItemBg },
                    '& .MuiListItemIcon-root': { color: colors.activeItemText },
                    '& .MuiListItemText-primary': { fontWeight: 600 },
                  },
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                  '& .MuiListItemIcon-root': { color: (!item.children && isExactSelected(item.path)) ? colors.activeItemText : colors.inactiveItemText },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem', fontWeight: 500, color: (!item.children && isExactSelected(item.path)) ? colors.activeItemText : colors.inactiveItemText } }}
                />
                {item.children ? (openMenus[item.text] ? <ExpandLess sx={{ color: colors.inactiveItemText }} /> : <ExpandMore sx={{ color: colors.inactiveItemText }} />) : null}
              </ListItemButton>
            </ListItem>
            {item.children && (
              <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.text}
                      selected={isExactSelected(child.path)}
                      onClick={() => navigate(child.path)}
                      sx={{
                        pl: 8, pr: 2, py: 1, mx: 2, mb: 0.5, borderRadius: 2,
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(93, 202, 165, 0.1)',
                          color: colors.activeItemBorder,
                          '&:hover': { backgroundColor: 'rgba(93, 202, 165, 0.15)' },
                          '& .MuiListItemText-primary': { fontWeight: 600, color: colors.activeItemBorder },
                        },
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                      }}
                    >
                      <ListItemText 
                        primary={child.text} 
                        sx={{ '& .MuiListItemText-primary': { fontSize: '0.75rem', color: isExactSelected(child.path) ? colors.activeItemBorder : colors.inactiveItemText } }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, backgroundColor: colors.headerBg, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)', borderBottom: `1px solid #222222` }}>
        <Toolbar sx={{ py: 1.5 }}>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' }, color: colors.headerText }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: colors.headerText, fontWeight: 500 }}>
            IntraDesk - Internal Knowledge Portal
          </Typography>
          <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ borderColor: colors.logoutBorder, color: colors.logoutText, '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' } }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': drawerBgStyle }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': drawerBgStyle }} open>
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, backgroundColor: colors.pageBg, minHeight: '100vh' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;

