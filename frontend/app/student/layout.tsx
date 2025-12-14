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
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Collapse,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  TrendingUp as ProgressIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  EventNote as SessionIcon,
  CheckCircle as NormalIcon,
  Refresh as RattrapageIcon,
  ExpandLess,
  ExpandMore,
  Assignment as TestIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/api';
import { useStudentNavigation, StudentNavigationProvider } from '@/lib/contexts/StudentNavigationContext';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Session {
  id: string;
  type: string;
  year: number;
  chapterId: string;
  imageUrl?: string | null;
}

interface SessionGroup {
  year: number;
  sessions: Session[];
}

const drawerWidth = 280;

function StudentLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const { sessions, selectedChapterId } = useStudentNavigation();
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  // Grouper les sessions par année
  const sessionGroups: SessionGroup[] = sessions.reduce((acc: SessionGroup[], session: Session) => {
    const existingGroup = acc.find(g => g.year === session.year);
    if (existingGroup) {
      existingGroup.sessions.push(session);
    } else {
      acc.push({ year: session.year, sessions: [session] });
    }
    return acc;
  }, []).sort((a, b) => b.year - a.year);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        const userData = response.data;
        setUser(userData);
        
        // Rediriger les admins vers leur dashboard
        if (userData.role !== 'STUDENT') {
          router.push('/dashboard');
        }
      } catch (error) {
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleYearClick = (year: number) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/student/session/${sessionId}`);
    if (isMobile) setMobileOpen(false);
  };

  const isSessionSelected = (sessionId: string) => {
    return pathname === `/student/session/${sessionId}`;
  };

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

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <Toolbar sx={{ backgroundColor: '#ff6b35', color: 'white', minHeight: '64px !important' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          QCM Médical
        </Typography>
      </Toolbar>
      <Divider />
      
      {/* Navigation principale */}
      <List sx={{ pt: 1, pb: 1 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={pathname === '/student' || pathname.startsWith('/student/session/')}
            onClick={() => {
              router.push('/student');
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: '#ff6b35',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#e55a2b',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <TestIcon />
            </ListItemIcon>
            <ListItemText primary="Mes Tests" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={pathname === '/student/progress'}
            onClick={() => {
              router.push('/student/progress');
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: '#ff6b35',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#e55a2b',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ProgressIcon />
            </ListItemIcon>
            <ListItemText primary="Ma Progression" />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Sessions - affichées uniquement quand un chapitre est sélectionné */}
      {selectedChapterId && sessions.length > 0 && (
        <>
          <Divider />
          <List sx={{ flexGrow: 1, pt: 1, pb: 1, overflow: 'auto' }}>
            <Typography variant="overline" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 'bold' }}>
              Sessions disponibles
            </Typography>
            {sessionGroups.map((group) => (
              <Box key={group.year}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleYearClick(group.year)}
                    sx={{
                      mx: 1,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 107, 53, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <SessionIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={`Année ${group.year}`} />
                    {expandedYear === group.year ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={expandedYear === group.year} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {group.sessions.map((session) => (
                      <ListItem key={session.id} disablePadding sx={{ pl: 4 }}>
                        <ListItemButton
                          selected={isSessionSelected(session.id)}
                          onClick={() => handleSessionClick(session.id)}
                          sx={{
                            mx: 1,
                            borderRadius: 1,
                            '&.Mui-selected': {
                              backgroundColor: '#ff6b35',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#e55a2b',
                              },
                              '& .MuiListItemIcon-root': {
                                color: 'white',
                              },
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(255, 107, 53, 0.1)',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {session.type === 'NORMAL' ? (
                              <NormalIcon fontSize="small" />
                            ) : (
                              <RattrapageIcon fontSize="small" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>{session.type === 'NORMAL' ? 'Session Normale' : 'Session Rattrapage'}</span>
                                <Chip
                                  label={session.type === 'NORMAL' ? 'Normale' : 'Rattrapage'}
                                  size="small"
                                  color={session.type === 'NORMAL' ? 'primary' : 'secondary'}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: '#1f2937',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Espace Étudiant
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              {user?.firstName} {user?.lastName}
            </Typography>
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff6b35' }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { router.push('/student/profile'); handleMenuClose(); }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profil
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
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
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentNavigationProvider>
      <StudentLayoutContent>{children}</StudentLayoutContent>
    </StudentNavigationProvider>
  );
}

