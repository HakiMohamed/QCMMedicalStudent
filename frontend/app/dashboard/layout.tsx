'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  SpaceDashboard as DashboardIcon,
  Groups as PeopleIcon,
  CalendarMonth as AcademicYearIcon,
  AutoStories as SemesterIcon,
  LibraryBooks as ModuleIcon,
  FolderSpecial as PartIcon,
  Article as ChapterIcon,
  EventNote as SessionIcon,
  HelpOutline as QuizIcon,
  AccountCircle,
  Logout,
  Settings,
  LocalLibrary,
} from '@mui/icons-material';
import apiClient from '@/lib/api';

const drawerWidth = 280;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  
  useEffect(() => {
    setMounted(true);
    setIsMobile(matches);
  }, [matches]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        const userData = response.data;
        setUser(userData);
        
        // Rediriger les étudiants vers leur espace
        if (userData.role === 'STUDENT') {
          router.push('/student');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Éviter l'erreur d'hydratation en ne rendant que côté client
  if (!mounted) {
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard', roles: ['ADMIN', 'SUPER_ADMIN', 'STUDENT'] },
    { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/dashboard/users', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { text: 'Années académiques', icon: <AcademicYearIcon />, path: '/dashboard/academic-years', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { text: 'Semestres', icon: <SemesterIcon />, path: '/dashboard/semesters', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { text: 'Modules', icon: <ModuleIcon />, path: '/dashboard/modules', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { text: 'Parties', icon: <PartIcon />, path: '/dashboard/parts', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { text: 'Chapitres', icon: <ChapterIcon />, path: '/dashboard/chapters', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { text: 'Sessions', icon: <SessionIcon />, path: '/dashboard/sessions', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { text: 'Questions', icon: <QuizIcon />, path: '/dashboard/questions', roles: ['ADMIN', 'SUPER_ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          backgroundColor: '#1f2937',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <LocalLibrary sx={{ color: '#ff6b35' }} />
        <Typography variant="h6" noWrap component="div">
          Medical QCM
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => {
                router.push(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                  borderLeft: '3px solid #ff6b35',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 107, 53, 0.15)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: pathname === item.path ? '#ff6b35' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading || !mounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: '#ffffff',
          color: '#1f2937',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff6b35' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => router.push('/dashboard/profile')}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Profil
              </MenuItem>
              <MenuItem onClick={() => router.push('/dashboard/settings')}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Paramètres
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

