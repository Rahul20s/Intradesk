import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Description from '@mui/icons-material/Description';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ArticleIcon from '@mui/icons-material/Article';
import HelpIcon from '@mui/icons-material/Help';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useMsal } from '@azure/msal-react';

const drawerWidth = 260;

// Use CSS variables for Combo G color scheme
const colors = {
  // Sidebar
  sidebarBg: 'var(--sidebar-bg)',
  activeItemBg: 'var(--sidebar-active-bg)',
  activeItemBorder: 'var(--sidebar-active-border)',
  activeItemText: 'var(--sidebar-active-text)',
  inactiveItemText: 'var(--sidebar-text)',
  sectionLabels: 'var(--sidebar-label)',
  
  // Top Header
  headerBg: 'var(--header-bg)',
  headerText: 'var(--header-text)',
  logoutBorder: 'var(--header-border)',
  logoutText: 'var(--header-text)',
  
  // Page backgrounds
  pageBg: 'var(--page-bg)',
  cardBgBlue: 'var(--card-bg-blue)',
  cardBgMint: 'var(--card-bg-mint)',
  cardBgWhite: 'var(--card-bg-white)',
  cardBorder: 'var(--card-border)',
  
  // Text colors
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  
  // Label colors
  labelBlue: 'var(--label-blue)',
  labelMint: 'var(--label-mint)',
  
  // Numbers
  numberBlue: 'var(--number-blue)',
  numberMint: 'var(--number-mint)',
  
  // Trends
  trendBlue: 'var(--trend-blue)',
  trendMint: 'var(--trend-mint)',
  trendEmpty: 'var(--trend-empty)',
  
  // Buttons
  btnPrimaryBg: 'var(--btn-primary-bg)',
  btnPrimaryText: 'var(--btn-primary-text)',
  btnPrimaryHover: 'var(--btn-primary-hover)',
  btnActionBg: 'var(--btn-action-bg)',
  btnActionText: 'var(--btn-action-text)',
  btnActionHover: 'var(--btn-action-hover)',
  
  // Inputs
  inputBg: 'var(--input-bg)',
  inputBorder: 'var(--input-border)',
  inputFocusBorder: 'var(--input-focus-border)',
  inputFocusShadow: 'var(--input-focus-shadow)',
  placeholder: 'var(--placeholder)',
  
  // Document categories
  tagSopsBg: 'var(--tag-sops-bg)',
  tagSopsText: 'var(--tag-sops-text)',
  tagPoliciesBg: 'var(--tag-policies-bg)',
  tagPoliciesText: 'var(--tag-policies-text)',
  tagTemplatesBg: 'var(--tag-templates-bg)',
  tagTemplatesText: 'var(--tag-templates-text)',
  tagFaqsBg: 'var(--tag-faqs-bg)',
  tagFaqsText: 'var(--tag-faqs-text)',
  
  // Departments
  tagHrBg: 'var(--tag-hr-bg)',
  tagHrText: 'var(--tag-hr-text)',
  tagItBg: 'var(--tag-it-bg)',
  tagItText: 'var(--tag-it-text)',
  tagFinanceBg: 'var(--tag-finance-bg)',
  tagFinanceText: 'var(--tag-finance-text)',
  tagAdminBg: 'var(--tag-admin-bg)',
  tagAdminText: 'var(--tag-admin-text)',
  
  // Table
  tableHeaderBg: 'var(--table-header-bg)',
  tableHeaderText: 'var(--table-header-text)',
  tableRowBorder: 'var(--table-row-border)',
  tableRowHover: 'var(--table-row-hover)',
  
  // Icons
  editIcon: 'var(--edit-icon)',
  deleteIcon: 'var(--delete-icon)',
  divider: 'var(--divider)'
};

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Policies', icon: <Description />, path: '/documents/policies' },
  { text: 'SOPs', icon: <LibraryBooksIcon />, path: '/documents/sops' },
  { text: 'Templates', icon: <ArticleIcon />, path: '/documents/templates' },
  { text: 'FAQs', icon: <HelpIcon />, path: '/documents/faqs' },
  { text: 'Admin Panel', icon: <AdminPanelSettingsIcon />, path: '/admin' },
];

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { instance, accounts } = useMsal();
  
  const isAdmin = () => accounts.length > 0 && accounts[0].username.toLowerCase() === 'rahul.sharma@cfmarc.in';

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.path !== '/admin' || isAdmin()
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: '/',
      mainWindowRedirectUri: '/'
    });
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        py: 3,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderBottom: `1px solid ${colors.cardBorder}`,
      }}>
        <Box
          component="img"
          sx={{
            height: 70,
            width: 'auto',
            maxWidth: '90%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
          }}
          alt="Company Logo"
          src="/company-logo.png"
        />
      </Toolbar>
      <Divider sx={{ borderColor: colors.cardBorder }} />
      <List sx={{ py: 2 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 2,
                borderRadius: 2,
                px: 2,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  backgroundColor: colors.activeItemBg,
                  borderLeft: colors.activeItemBorder,
                  color: colors.activeItemText,
                  '&:hover': {
                    backgroundColor: colors.activeItemBg,
                  },
                  '& .MuiListItemIcon-root': {
                    color: colors.activeItemText,
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  backgroundColor: colors.activeItemBg,
                  transform: 'translateX(2px)',
                },
                '& .MuiListItemIcon-root': {
                  color: colors.inactiveItemText,
                  transition: 'color 0.3s ease',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box sx={{ 
                  color: location.pathname === item.path ? colors.activeItemText : colors.inactiveItemText,
                  transition: 'all 0.3s ease'
                }}>
                  {item.icon}
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.95rem',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    color: location.pathname === item.path ? colors.activeItemText : colors.inactiveItemText,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: colors.headerBg,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          borderBottom: 'none',
        }}
      >
        <Toolbar sx={{ py: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: colors.headerText,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: colors.headerText,
              fontWeight: 500,
              fontSize: '1.1rem',
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            IntraDesk - Internal Knowledge Portal
          </Typography>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              borderColor: colors.logoutBorder,
              color: colors.logoutText,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.12)',
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: colors.sidebarBg,
              borderRight: `1px solid ${colors.cardBorder}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: colors.sidebarBg,
              borderRight: `1px solid ${colors.cardBorder}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: colors.pageBg,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
