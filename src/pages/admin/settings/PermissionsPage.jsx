import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { useAdminPermissions } from '../../../hooks/users/useAdminPermissions';
import { PermissionModuleCard } from './componentsPermission/PermissionModuleCard';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import { Tooltip } from '@mui/material';

const ITEMS_PER_PAGE = 6;

export const PermissionsPage = () => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [page, setPage] = useState(1);

  const {
    modules,
    moduleOptions,
    loading,
    fetching,
    error,
  } = useAdminPermissions({
    search,
    modulo: moduleFilter || null,
  });

  const totalPages = Math.max(1, Math.ceil(modules.length / ITEMS_PER_PAGE));

  const paginatedModules = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return modules.slice(start, start + ITEMS_PER_PAGE);
  }, [modules, page]);

  const handleOpenModule = (module) => {
    document.activeElement?.blur();
    setSelectedModule(module);
  };

  const handleCloseModule = () => {
    document.activeElement?.blur();
    setSelectedModule(null);
  };

  const handleClearFilters = () => {
    setSearch('');
    setModuleFilter('');
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleModuleFilterChange = (event) => {
    setModuleFilter(event.target.value);
    setPage(1);
  };

  return (
    <PlaceholderPage
      title="Permisos"
      description="Consulta los permisos del sistema agrupados por módulo."
    >
      <Container maxWidth={false}>
        <Stack spacing={2.5}>
          <ErrorMessage message={error} />

          <Alert
            severity="info"
            icon={<SecurityOutlinedIcon />}
            sx={{
              borderRadius: 2,
              bgcolor: (theme) => theme.palette.action.selected,
            }}
          >
            Este módulo es solo consulta. Los permisos se asignan desde Roles.
          </Alert>

            <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{
                alignItems: {
                xs: 'stretch',
                md: 'center',
                },
            }}
            >
            <TextField
              label="Buscar permiso"
              size="small"
              value={search}
              onChange={handleSearchChange}
              sx={{ maxWidth: { md: 360 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Módulo"
              value={moduleFilter}
              onChange={handleModuleFilterChange}
              sx={{ maxWidth: { md: 260 } }}
            >
              <MenuItem value="">Todos los módulos</MenuItem>

              {moduleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Tooltip title="Limpiar">
            <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                sx={{
                minWidth: 48,
                px: 1.5,
                }}
            >
                <CleaningServicesOutlinedIcon fontSize="small" />
            </Button>
            </Tooltip>
          </Stack>

          {loading || fetching ? (
            <Typography color="text.secondary">
              Cargando permisos...
            </Typography>
          ) : null}

          {!loading && !modules.length && (
            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6">
                No se encontraron permisos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ajusta los filtros o realiza otra búsqueda.
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            {paginatedModules.map((module) => (
              <Grid key={module.modulo} size={{ xs: 12, md: 6, lg: 4 }}>
                <PermissionModuleCard
                  module={module}
                  onViewModule={handleOpenModule}
                />
              </Grid>
            ))}
          </Grid>

        {modules.length > ITEMS_PER_PAGE && (
        <Stack
            direction="row"
            spacing={1.5}
            sx={{
            mt: 0.5,
            p: 1.25,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            alignItems: 'center',
            justifyContent: 'space-between',
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
                variant="outlined"
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                sx={{ minWidth: 40, px: 1 }}
            >
                {'<<'}
            </Button>

            <Typography variant="body2" fontWeight={700}>
                {page}
            </Typography>

            <Button
                variant="outlined"
                size="small"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                sx={{ minWidth: 40, px: 1 }}
            >
                {'>>'}
            </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Página {page} de {totalPages} · Total: {modules.length}
            </Typography>
        </Stack>
        )}
        </Stack>

        <Dialog
          open={Boolean(selectedModule)}
          onClose={handleCloseModule}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Permisos del módulo: {selectedModule?.modulo || ''}
          </DialogTitle>

          <DialogContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(selectedModule?.permisos || []).map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>{permission.codigo}</TableCell>
                    <TableCell>{permission.nombre}</TableCell>
                    <TableCell>{permission.descripcion || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseModule}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PlaceholderPage>
  );
};