// src/pages/store/MyOrdersPage.jsx
import { useState, useMemo } from 'react';
import {
  Box, Button, Container, Stack, TextField, Typography,
  InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Chip, IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon                from '@mui/icons-material/Search';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlinedIcon   from '@mui/icons-material/CheckCircleOutlined';
import ScheduleOutlinedIcon      from '@mui/icons-material/ScheduleOutlined';
import Inventory2OutlinedIcon    from '@mui/icons-material/Inventory2Outlined';
import SettingsOutlinedIcon      from '@mui/icons-material/SettingsOutlined';
import CancelOutlinedIcon        from '@mui/icons-material/CancelOutlined';
import ArrowForwardIcon          from '@mui/icons-material/ArrowForward';
import CloseIcon                 from '@mui/icons-material/Close';

import { EmptyState }    from '../../components/common/EmptyState';
import { ErrorMessage }  from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useMyOrders }   from '../../hooks/store/useStoreOrders';
import { formatCurrency } from '../../utils/formatters';

// ─── Config de estados ────────────────────────────────────────────────────────
const STATUS_MAP = {
  entregado:             { label: 'Entregado',    borderColor: '#22c55e', bg: '#f0fdf4', color: '#15803d', Icon: CheckCircleOutlinedIcon   },
  en_destino:            { label: 'Entregado',    borderColor: '#22c55e', bg: '#f0fdf4', color: '#15803d', Icon: CheckCircleOutlinedIcon   },
  en_transito:           { label: 'En tránsito',  borderColor: '#f59e0b', bg: '#fffbeb', color: '#b45309', Icon: LocalShippingOutlinedIcon },
  entregado_repartidora: { label: 'En tránsito',  borderColor: '#f59e0b', bg: '#fffbeb', color: '#b45309', Icon: LocalShippingOutlinedIcon },
  preparando:            { label: 'Preparando',   borderColor: '#3b82f6', bg: '#eff6ff', color: '#1d4ed8', Icon: SettingsOutlinedIcon      },
  bajo_pedido:           { label: 'Bajo pedido',  borderColor: '#6366f1', bg: '#eef2ff', color: '#4338ca', Icon: Inventory2OutlinedIcon    },
  cancelado:             { label: 'Cancelado',    borderColor: '#ef4444', bg: '#fef2f2', color: '#b91c1c', Icon: CancelOutlinedIcon        },
  incidencia:            { label: 'Incidencia',   borderColor: '#ef4444', bg: '#fef2f2', color: '#b91c1c', Icon: CancelOutlinedIcon        },
  pago_vencido:          { label: 'Pago vencido', borderColor: '#ec4899', bg: '#fdf2f8', color: '#9d174d', Icon: ScheduleOutlinedIcon     },
  pendiente:             { label: 'Pendiente',    borderColor: '#9ca3af', bg: '#f9fafb', color: '#4b5563', Icon: ScheduleOutlinedIcon     },
};

const getOrderStatus = (estadoPedido, estadoEnvio, estadoPago) => {
  if (estadoPedido === 'cancelado' || estadoEnvio === 'cancelado') return STATUS_MAP.cancelado;
  if (estadoPago === 'vencido')     return STATUS_MAP.pago_vencido;
  if (estadoEnvio && STATUS_MAP[estadoEnvio]) return STATUS_MAP[estadoEnvio];
  if (estadoPago === 'pagado')      return STATUS_MAP.preparando;
  return STATUS_MAP.pendiente;
};

const getDisplayStatus = (order, filters) => {
  // Si hay filtro activo, mostrar ese estado específico
  if (filters.estado_envio  && order.estado_envio)  
    return STATUS_MAP[order.estado_envio]  ?? STATUS_MAP.pendiente;
  if (filters.estado_pago   && order.estado_pago === 'vencido')  
    return STATUS_MAP.pago_vencido;
  if (filters.estado_pedido && order.estado_pedido === 'cancelado') 
    return STATUS_MAP.cancelado;
  
  // Sin filtro: prioridad normal
  return getOrderStatus(order.estado_pedido, order.estado_envio, order.estado_pago);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const groupOrdersByMonth = (orders) => {
  const groups = {};
  orders.forEach((order) => {
    if (!order.created_at) return;
    const date  = new Date(order.created_at);
    const month = date.toLocaleString('es-ES', { month: 'long' });
    const year  = date.getFullYear();
    const key   = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(order);
  });
  return groups;
};

const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const date  = new Date(dateString);
  const day   = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
  const year  = date.getFullYear();
  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
};

// ─── Opciones de los selectores ────────────────────────────────────────────────
const FILTER_OPTIONS = {
  estado_pedido: [
    { value: '',          label: 'Todos los pedidos' },
    { value: 'activo',    label: 'Activo'            },
    { value: 'cancelado', label: 'Cancelado'         },
  ],
  estado_pago: [
    { value: '',          label: 'Todos los pagos' },
    { value: 'pagado',    label: 'Pagado'          },
    { value: 'pendiente', label: 'Pendiente'       },
    { value: 'vencido',   label: 'Vencido'         },
  ],
  estado_envio: [
    { value: '',            label: 'Todos los envíos' },
    { value: 'preparando',  label: 'Preparando'       },
    { value: 'bajo_pedido', label: 'Bajo pedido'      },
    { value: 'en_transito', label: 'En tránsito'      },
    { value: 'entregado',   label: 'Entregado'        },
    { value: 'cancelado',   label: 'Cancelado'        },
    { value: 'incidencia',  label: 'Incidencia'       },
  ],
};

// Estilos compartidos para los Select
const selectSx = (isDark) => ({
  bgcolor: isDark ? '#1e1e1e' : '#ffffff',
  color: isDark ? '#fff' : '#111827',
  borderRadius: '10px',
  fontSize: '0.875rem',
  '& fieldset': { borderColor: isDark ? '#2e2e2e' : '#e5e7eb' },
  '&:hover fieldset': { borderColor: isDark ? '#444' : '#d1d5db' },
  '&.Mui-focused fieldset': { borderColor: isDark ? '#6366f1' : '#818cf8' },
});

// ─── Página principal ──────────────────────────────────────────────────────────
export const MyOrdersPage = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    estado_pedido: '',
    estado_pago:   '',
    estado_envio:  '',
  });

  const { orders = [], loading, error } = useMyOrders({ pageNumber: 1, pageSize: 100 });

  const handleFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value }));
  const handleClear  = () => setFilters({ estado_pedido: '', estado_pago: '', estado_envio: '' });

  const activeCount = Object.values(filters).filter(Boolean).length;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        if (
          !o.numero_pedido?.toLowerCase().includes(q) &&
          !o.id?.toString().includes(q) &&
          !o.titulo_pedido?.toLowerCase().includes(q)
        ) return false;
      }
      if (filters.estado_pedido && o.estado_pedido !== filters.estado_pedido) return false;
      if (filters.estado_pago   && o.estado_pago   !== filters.estado_pago)   return false;
      if (filters.estado_envio  && o.estado_envio  !== filters.estado_envio)  return false;
      return true;
    });
  }, [orders, searchTerm, filters]);

  const groupedOrders = useMemo(() => groupOrdersByMonth(filteredOrders), [filteredOrders]);

  if (loading) return <LoadingScreen message="Cargando tus pedidos..." />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#121212' : '#f9fafb', py: 6, transition: 'background-color 0.3s' }}>
      <Container maxWidth="lg">

        {/* ── Encabezado ────────────────────────────── */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
            color: isDark ? '#a3a3a3' : '#9ca3af', textTransform: 'uppercase', mb: 0.5,
          }}>
            Cuenta
          </Typography>
          <Typography sx={{
            fontWeight: 700, letterSpacing: '-0.5px',
            color: isDark ? '#ffffff' : '#111827',
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
          }}>
            Mis pedidos
          </Typography>
          <Typography sx={{
            mt: 0.5, color: isDark ? '#a3a3a3' : '#6b7280',
            fontSize: { xs: '0.9rem', sm: '1rem' },
          }}>
            Registro histórico y estado actual de tus adquisiciones.
          </Typography>
        </Box>

        {/* ── Barra de búsqueda ─────────────────────── */}
        <Box sx={{ mb: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por número de pedido o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: isDark ? '#a3a3a3' : '#9ca3af' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <CloseIcon sx={{ fontSize: 16, color: isDark ? '#a3a3a3' : '#9ca3af' }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                ...selectSx(isDark),
                py: 0.25,
              },
            }}
          />
        </Box>

        {/* ── FILTROS VISIBLES — 3 selectores a plena vista ── */}
        <Box sx={{
          bgcolor: isDark ? '#1a1a1a' : '#ffffff',
          border: '1px solid', borderColor: isDark ? '#2e2e2e' : '#e5e7eb',
          borderRadius: '12px', p: { xs: 2, sm: 2.5 }, mb: 4,
        }}>
          {/* Fila superior: título + botón limpiar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{
              fontSize: '0.78rem', fontWeight: 700,
              color: isDark ? '#737373' : '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>
              Filtrar pedidos
            </Typography>
            {activeCount > 0 && (
              <Button
                onClick={handleClear}
                startIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  fontSize: '0.75rem', fontWeight: 600, color: '#ef4444',
                  p: 0, minWidth: 'auto', textTransform: 'none',
                  '&:hover': { bgcolor: 'transparent', color: '#dc2626' },
                }}
                disableRipple
              >
                Limpiar filtros
              </Button>
            )}
          </Box>

          {/* Los 3 selectores en fila */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
          }}>

            {/* Selector 1: Estado del pedido */}
            <FormControl size="small" fullWidth>
              <InputLabel
                shrink
                sx={{
                  fontSize: '0.78rem', fontWeight: 600,
                  color: isDark ? '#737373' : '#6b7280',
                  '&.Mui-focused': { color: isDark ? '#818cf8' : '#6366f1' },
                }}
              >
                Estado del pedido
              </InputLabel>
              <Select
                value={filters.estado_pedido}
                onChange={(e) => handleFilter('estado_pedido', e.target.value)}
                label="Estado del pedido"
                notched
                sx={selectSx(isDark)}
                slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
              >
                {FILTER_OPTIONS.estado_pedido.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.875rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Selector 2: Estado del pago */}
            <FormControl size="small" fullWidth>
              <InputLabel
                shrink
                sx={{
                  fontSize: '0.78rem', fontWeight: 600,
                  color: isDark ? '#737373' : '#6b7280',
                  '&.Mui-focused': { color: isDark ? '#818cf8' : '#6366f1' },
                }}
              >
                Estado del pago
              </InputLabel>
              <Select
                value={filters.estado_pago}
                onChange={(e) => handleFilter('estado_pago', e.target.value)}
                label="Estado del pago"
                notched
                sx={selectSx(isDark)}
                slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
              >
                {FILTER_OPTIONS.estado_pago.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.875rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Selector 3: Estado del envío */}
            <FormControl size="small" fullWidth>
              <InputLabel
                shrink
                sx={{
                  fontSize: '0.78rem', fontWeight: 600,
                  color: isDark ? '#737373' : '#6b7280',
                  '&.Mui-focused': { color: isDark ? '#818cf8' : '#6366f1' },
                }}
              >
                Estado del envío
              </InputLabel>
              <Select
                value={filters.estado_envio}
                onChange={(e) => handleFilter('estado_envio', e.target.value)}
                label="Estado del envío"
                notched
                sx={selectSx(isDark)}
                slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
              >
                {FILTER_OPTIONS.estado_envio.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.875rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          </Box>

          {/* Chips de filtros activos */}
          {activeCount > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 2, pt: 2, borderTop: '1px solid', borderColor: isDark ? '#2e2e2e' : '#f3f4f6' }}>
              <Typography sx={{ fontSize: '0.72rem', color: isDark ? '#737373' : '#9ca3af', alignSelf: 'center', mr: 0.5 }}>
                Aplicados:
              </Typography>
              {filters.estado_pedido && (
                <Chip
                  label={`Pedido: ${FILTER_OPTIONS.estado_pedido.find(o => o.value === filters.estado_pedido)?.label}`}
                  size="small" onDelete={() => handleFilter('estado_pedido', '')}
                  sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: isDark ? '#2a2a2a' : '#eef2ff', color: isDark ? '#c7d2fe' : '#4338ca', border: '1px solid', borderColor: isDark ? '#6366f1' : '#c7d2fe', '& .MuiChip-deleteIcon': { color: isDark ? '#818cf8' : '#6366f1', fontSize: 14 } }}
                />
              )}
              {filters.estado_pago && (
                <Chip
                  label={`Pago: ${FILTER_OPTIONS.estado_pago.find(o => o.value === filters.estado_pago)?.label}`}
                  size="small" onDelete={() => handleFilter('estado_pago', '')}
                  sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: isDark ? '#2a2a2a' : '#eef2ff', color: isDark ? '#c7d2fe' : '#4338ca', border: '1px solid', borderColor: isDark ? '#6366f1' : '#c7d2fe', '& .MuiChip-deleteIcon': { color: isDark ? '#818cf8' : '#6366f1', fontSize: 14 } }}
                />
              )}
              {filters.estado_envio && (
                <Chip
                  label={`Envío: ${FILTER_OPTIONS.estado_envio.find(o => o.value === filters.estado_envio)?.label}`}
                  size="small" onDelete={() => handleFilter('estado_envio', '')}
                  sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: isDark ? '#2a2a2a' : '#eef2ff', color: isDark ? '#c7d2fe' : '#4338ca', border: '1px solid', borderColor: isDark ? '#6366f1' : '#c7d2fe', '& .MuiChip-deleteIcon': { color: isDark ? '#818cf8' : '#6366f1', fontSize: 14 } }}
                />
              )}
            </Box>
          )}
        </Box>

        <ErrorMessage message={error} />

        {!filteredOrders.length && !error ? (
          <EmptyState
            title="Sin pedidos"
            description="No se encontraron pedidos con los criterios ingresados."
            actionLabel="Ver catálogo"
            actionTo="/catalogo"
          />
        ) : (
          <Stack spacing={5}>
            {Object.entries(groupedOrders).map(([monthYear, monthOrders]) => (
              <Box key={monthYear}>

                {/* Encabezado de mes */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{
                    fontWeight: 600, whiteSpace: 'nowrap',
                    color: isDark ? '#a3a3a3' : '#374151',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                  }}>
                    {monthYear}
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: isDark ? '#2e2e2e' : '#e5e7eb', mx: 2 }} />
                  <Typography sx={{ fontSize: '0.75rem', color: isDark ? '#525252' : '#9ca3af', whiteSpace: 'nowrap' }}>
                    {monthOrders.length} pedido{monthOrders.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>

                {/* Filas */}
                <Stack spacing={1.5}>
                  {monthOrders.map((order) => {
                    const status = getDisplayStatus(order, filters);
                    const Icon        = status.Icon;
                    const isCancelled = status === STATUS_MAP.cancelado;

                    return (
                      <Box
                        key={order.id}
                        sx={{
                          bgcolor: isDark ? (isCancelled ? '#181818' : '#1e1e1e') : (isCancelled ? '#fafafa' : '#ffffff'),
                          borderRadius: '12px', border: '1px solid',
                          borderColor: isDark ? '#2d2d2d' : '#e5e7eb',
                          borderLeft: `4px solid ${status.borderColor}`,
                          px: { xs: 2, md: 2.5 }, py: { xs: 2, md: 2.25 },
                          display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                          alignItems: { xs: 'flex-start', md: 'center' },
                          justifyContent: 'space-between',
                          gap: 2, opacity: isCancelled ? 0.75 : 1,
                          transition: 'box-shadow 0.2s',
                          '&:hover': { boxShadow: isCancelled ? 'none' : (isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.04)') },
                        }}
                      >
                        {/* Identificador y fecha */}
                        <Box sx={{ minWidth: { md: 190 }, flexShrink: 0 }}>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', color: isDark ? '#737373' : '#9ca3af', mb: 0.5 }}>
                            ORDEN #{order.numero_pedido || order.id?.toString().substring(0, 6).toUpperCase()}
                          </Typography>
                          <Typography sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#111827', fontSize: { xs: '1rem', sm: '1.05rem' } }}>
                            {formatShortDate(order.created_at)}
                          </Typography>
                        </Box>

                        {/* Descripción */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{
                            fontWeight: 700, mb: 0.4,
                            color: isCancelled ? (isDark ? '#525252' : '#9ca3af') : (isDark ? '#ffffff' : '#111827'),
                            textDecoration: isCancelled ? 'line-through' : 'none',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                          }}>
                            {order.titulo_pedido || `Pedido-${order.numero_pedido || order.id?.toString().substring(0, 6).toUpperCase()}`}
                          </Typography>
                          <Typography sx={{ color: isDark ? '#a3a3a3' : '#6b7280', fontSize: { xs: '0.82rem', sm: '0.875rem' } }}>
                            {order.total_items} artículo{order.total_items !== 1 ? 's' : ''} · {formatCurrency(order.total)}
                          </Typography>
                        </Box>

                        {/* Estado único + botón */}
                        <Box sx={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: { xs: 'space-between', md: 'flex-end' },
                          width: { xs: '100%', md: 'auto' }, gap: 3, flexShrink: 0,
                        }}>
                          <Box sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.75,
                            px: 1.5, py: 0.6, borderRadius: '99px',
                            bgcolor: status.bg, border: `1px solid ${status.borderColor}33`,
                          }}>
                            <Icon sx={{ fontSize: 15, color: status.color }} />
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: status.color, whiteSpace: 'nowrap' }}>
                              {status.label}
                            </Typography>
                          </Box>
                          <Button
                            component={RouterLink}
                            to={`/mis-pedidos/${order.id}`}
                            endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                            sx={{
                              color: isDark ? '#a3a3a3' : '#4b5563', fontWeight: 600,
                              fontSize: '0.82rem', textTransform: 'none', p: 0, minWidth: 'auto',
                              '&:hover': { bgcolor: 'transparent', color: isDark ? '#fff' : '#111827' },
                            }}
                            disableRipple
                          >
                            Ver detalle
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};