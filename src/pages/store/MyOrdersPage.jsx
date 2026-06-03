// src/pages/store/MyOrdersPage.jsx
// Mis pedidos del cliente.
// Muestra estado de pedido, pago y seguimiento, agrupados visualmente por meses.

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

// Íconos adaptados al diseño de la imagen
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useMyOrders } from '../../hooks/store/useStoreOrders';
import { formatCurrency } from '../../utils/formatters';

// Mapeo exacto de estados con los colores, bordes y estilos de la imagen
const getOrderStatusInfo = (estadoEnvio, estadoPago) => {
  // 1. Pago Vencido
  if (estadoPago === 'vencido') {
    return {
      label: 'Pago vencido',
      key: 'pago_vencido',
      icon: <ScheduleOutlinedIcon />,
      borderColor: '#ec4899', // Rosa
      bg: 'rgba(253, 242, 248, 0.1)',
      color: '#f472b6',
      borderChip: 'rgba(244, 114, 182, 0.3)'
    };
  }
  // 2. Cancelado
  if (estadoEnvio === 'cancelado') {
    return {
      label: 'Cancelado',
      key: 'cancelado',
      icon: <CancelOutlinedIcon />,
      borderColor: '#ef4444', // Rojo
      bg: 'rgba(254, 242, 242, 0.1)',
      color: '#f87171',
      borderChip: 'rgba(248, 113, 113, 0.3)'
    };
  }
  // 3. Entregado
  if (estadoEnvio === 'entregado') {
    return {
      label: 'Entregado',
      key: 'entregado',
      icon: <CheckCircleOutlineIcon />,
      borderColor: '#22c55e', // Verde
      bg: 'rgba(240, 253, 250, 0.1)',
      color: '#4ade80',
      borderChip: 'rgba(74, 222, 128, 0.3)'
    };
  }
  // 4. En tránsito
  if (estadoEnvio === 'en_transito') {
    return {
      label: 'En tránsito',
      key: 'en_transito',
      icon: <LocalShippingOutlinedIcon />,
      borderColor: '#f59e0b', // Naranja/Dorado
      bg: 'rgba(254, 243, 199, 0.1)',
      color: '#fbbf24',
      borderChip: 'rgba(251, 191, 36, 0.3)'
    };
  }
  // 5. Bajo pedido
  if (estadoEnvio === 'bajo_pedido') {
    return {
      label: 'Bajo pedido',
      key: 'bajo_pedido',
      icon: <ArchiveOutlinedIcon />,
      borderColor: '#6366f1', // Morado/Índigo
      bg: 'rgba(238, 242, 255, 0.1)',
      color: '#818cf8',
      borderChip: 'rgba(129, 140, 248, 0.3)'
    };
  }
  // 6. Preparando
  if (estadoEnvio === 'preparando') {
    return {
      label: 'Preparando',
      key: 'preparando',
      icon: <SettingsOutlinedIcon />,
      borderColor: '#3b82f6', // Azul
      bg: 'rgba(239, 246, 255, 0.1)',
      color: '#60a5fa',
      borderChip: 'rgba(96, 165, 250, 0.3)'
    };
  }
  // 7. Pendiente (Por defecto)
  return {
    label: 'Pendiente',
    key: 'pendiente',
    icon: <ScheduleOutlinedIcon />,
    borderColor: '#9ca3af', // Gris
    bg: 'rgba(249, 250, 251, 0.1)',
    color: '#d1d5db',
    borderChip: 'rgba(209, 213, 219, 0.3)'
  };
};

// Función para agrupar los pedidos por mes (ej. "Noviembre 2025")
const groupOrdersByMonth = (orders) => {
  const groups = {};
  orders.forEach(order => {
    if (!order.created_at) return;
    const date = new Date(order.created_at);
    const month = date.toLocaleString('es-ES', { month: 'long' });
    const year = date.getFullYear();
    const key = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(order);
  });
  return groups;
};

// Formateador de fecha simple (ej. "14 Nov 2025")
const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
  const year = date.getFullYear();
  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
};

export const MyOrdersPage = () => {
  const theme = useTheme(); 
  const isDark = theme.palette.mode === 'dark';
  const [searchTerm, setSearchTerm] = useState('');

  const { orders = [], loading, error } = useMyOrders({
    pageNumber: 1,
    pageSize: 100, 
  });

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    return orders.filter(o => 
      o.numero_pedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id?.toString().includes(searchTerm) ||
      o.titulo_pedido?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const groupedOrders = useMemo(() => groupOrdersByMonth(filteredOrders), [filteredOrders]);

  if (loading) return <LoadingScreen message="Cargando tus pedidos..." />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#121212' : '#f9fafb', py: 6, transition: 'background-color 0.3s' }}>
      <Container maxWidth="lg">
        
        {/* ENCABEZADO */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 4, gap: 3 
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: '600', color: isDark ? '#ffffff' : '#111827', mb: 0.5, letterSpacing: '-0.5px' }}>
              Mis pedidos
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>
              Registro histórico y estado actual de tus adquisiciones.
            </Typography>
          </Box>
          
          {/* BARRA DE BÚSQUEDA Y FILTRADO */}
          <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' }, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: isDark ? '#a3a3a3' : '#6b7280' }}/>
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ 
                minWidth: { sm: 240 },
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDark ? '#1e1e1e' : '#ffffff',
                  color: isDark ? '#fff' : '#111',
                  borderRadius: '8px',
                  '& fieldset': { borderColor: isDark ? 'transparent' : '#e5e7eb' },
                  '&:hover fieldset': { borderColor: isDark ? '#333333' : '#d1d5db' },
                  '&.Mui-focused fieldset': { borderColor: isDark ? '#555555' : '#9ca3af' },
                }
              }}
            />
            <Button 
              variant="contained" 
              startIcon={<FilterListIcon fontSize="small" />} 
              sx={{ 
                bgcolor: isDark ? '#1e1e1e' : '#ffffff', 
                color: isDark ? '#ffffff' : '#111827',
                textTransform: 'none',
                borderRadius: '8px',
                px: 2,
                boxShadow: 'none',
                border: '1px solid',
                borderColor: isDark ? '#2e2e2e' : '#e5e7eb',
                '&:hover': { bgcolor: isDark ? '#2a2a2a' : '#f3f4f6', boxShadow: 'none' }
              }}
            >
              Filtrar
            </Button>
          </Box>
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
          <Stack spacing={5} sx={{ mt: 4 }}>
            {Object.entries(groupedOrders).map(([monthYear, monthOrders]) => (
              <Box key={monthYear}>
                
                {/* TÍTULO DEL MES */}
                <Typography component="div" variant="body1" sx={{ color: isDark ? '#a3a3a3' : '#6b7280', fontWeight: '500', mb: 2, display: 'flex', alignItems: 'center' }}>
                  {monthYear}
                  <Box sx={{ flex: 1, height: '1px', bgcolor: isDark ? '#2e2e2e' : '#e5e7eb', ml: 2 }} />
                </Typography>

                {/* LISTA DE TARJETAS */}
                <Stack spacing={2}>
                  {monthOrders.map((order) => {
                    // En lugar de sacar 1 estilo, sacamos los estilos para ambos: envío y pago
                    const envioStyle = getOrderStatusInfo(order.estado_envio, null);// Forzamos evaluación solo del envío
                    const pagoStyle = order.estado_pago 
                      ? getOrderStatusInfo(null, order.estado_pago) 
                      : null; 
                      
                    // Si el pedido principal está cancelado (según estado_pedido) entonces obligatoriamente mandamos el look de Cancelado
                    const pedidoStyle = order.estado_pedido === 'cancelado' 
                      ? getOrderStatusInfo('cancelado', null) 
                      : null;

                    // Recolectamos en un array qué estilos se deben pintar
                    // Las reglas de prioridad: Si está cancelado el pedido, va primero. Luego envío, luego pago.
                    const chipsToRender = [];
                    if (pedidoStyle) {
                      chipsToRender.push(pedidoStyle); // Si está cancelado, el pedido entero es rojo
                    } else {
                      chipsToRender.push(envioStyle);
                      if (pagoStyle && order.estado_pago !== 'pendiente') {
                        chipsToRender.push(pagoStyle); // Se muestran juntos si el pago es algo interesante como vencido/pagado/etc
                      }
                    }

                    // Tomamos el color lateral principal del primer chip que aparezca
                    const mainBorderColor = chipsToRender[0]?.borderColor || '#9ca3af';

                    return (
                      <Box 
                        key={order.id} 
                        sx={{ 
                          bgcolor: isDark ? '#1e1e1e' : '#ffffff', 
                          borderRadius: '12px',    
                          border: '1px solid',
                          borderColor: isDark ? '#2d2d2d' : '#e5e7eb', 
                          borderLeft: `4px solid ${mainBorderColor}`, // Borde dinámico según el Estado primario
                          p: { xs: 2.5, md: 3 },
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          alignItems: { xs: 'flex-start', md: 'center' },
                          justifyContent: 'space-between',
                          gap: 2,
                          transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': { 
                            bgcolor: isDark ? '#252525' : '#ffffff',
                            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'
                          }
                        }}
                      >
                        {/* 1. SECCIÓN IZQUIERDA: Identificador y Fecha */}
                        <Box sx={{ minWidth: { md: 180 } }}>
                          <Typography variant="caption" sx={{ color: isDark ? '#737373' : '#6b7280', fontWeight: '700', display: 'block', mb: 0.5, letterSpacing: '0.5px' }}>
                            ORDEN #{order.numero_pedido || order.id.toString().substring(0, 6).toUpperCase()}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: '700', color: isDark ? '#ffffff' : '#111827' }}>
                            {formatShortDate(order.created_at)}
                          </Typography>
                        </Box>

                        {/* 2. SECCIÓN CENTRAL: Nombre del Producto/Lote y Detalles */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: '700', mb: 0.5, color: isDark ? '#ffffff' : '#111827' }}>
                            {order.titulo_pedido || `PEDIDO-${order.numero_pedido || order.id.toString().substring(0, 6).toUpperCase()}`}
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>
                            {order.total_items} artículo{order.total_items !== 1 && 's'} · {formatCurrency(order.total)}
                          </Typography>
                        </Box>

                        {/* 3. SECCIÓN DERECHA: Multipies Chips de Estado y Enlace */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: { xs: 'space-between', md: 'flex-end' },
                          width: { xs: '100%', md: 'auto' },
                          flexWrap: 'wrap',
                          gap: 3, 
                        }}>
                          {/* El Stack no acepta flexWrap directamente, moverlo al sx y habilitar uso de FlexGap */}
                          <Stack 
                            direction="row" 
                            spacing={1.5} 
                            sx={{ 
                              flexWrap: 'wrap', 
                              gap: '8px 0' 
                            }}
                          >
                            {chipsToRender.map((styleObj, idx) => (
                              <Chip
                                key={idx}
                                icon={styleObj.icon}
                                label={styleObj.label}
                                size="small"
                                sx={{ 
                                  fontWeight: '600',
                                  fontSize: '0.80rem',
                                  px: 1,
                                  py: 1.8,
                                  borderRadius: '20px', 
                                  bgcolor: isDark ? styleObj.bg : styleObj.bg.replace('0.1)', '0.3)'),
                                  color: styleObj.color,
                                  border: `1px solid ${styleObj.borderChip}`,
                                  '& .MuiChip-icon': { color: 'inherit', fontSize: '1.1rem' }
                                }}
                              />
                            ))}
                          </Stack>
                          
                          <Button
                            component={RouterLink}
                            to={`/mis-pedidos/${order.id}`}
                            sx={{ 
                              color: isDark ? '#a3a3a3' : '#4b5563',
                              fontWeight: '500', 
                              fontSize: '0.9rem',
                              textTransform: 'none',
                              p: 0,
                              minWidth: 'auto',
                              '&:hover': { bgcolor: 'transparent', color: isDark ? '#ffffff' : '#111827' } 
                            }}
                            disableRipple
                          >
                            Ver detalle <Box component="span" sx={{ ml: 0.8, display: 'inline-block', transition: 'transform 0.2s', '&:hover': { transform: 'translateX(3px)' } }}>→</Box>
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