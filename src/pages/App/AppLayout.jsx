import { useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';

import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const drawerWidth = 250;

const menu = [
  'Botones',
  'Inputs',
  'Cards',
  'Feedback',
  'Navegación',
  'Selección',
  'Data Display',
];

export const AppLayout = ({ children }) => {
  const [open, setOpen] = useState(false);

  const SidebarContent = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Ejemplo UI
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Catálogo MUI
        </Typography>

        <List sx={{ display: 'grid', gap: 1 }}>
          {menu.map((item) => (
            <ListItemButton key={item} sx={{ borderRadius: 3 }}>
              <ListItemText primary={item} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={() => setOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Paper
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: { xs: '100%', sm: 360 },
              borderRadius: 3,
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <SearchIcon color="action" />
            <InputBase fullWidth placeholder="Buscar componente..." />
          </Paper>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton color="inherit">
            <NotificationsNoneIcon />
          </IconButton>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>AD</Avatar>
            <Typography variant="body2">Administrador</Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        <SidebarContent />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        <SidebarContent />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${drawerWidth}px` },
          mt: '64px',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};