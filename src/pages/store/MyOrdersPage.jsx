// Mis pedidos del cliente.
import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import SearchIcon from '@mui/icons-material/Search';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';

import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useMyOrders } from '../../hooks/store/useStoreOrders';
import { formatCurrency } from '../../utils/formatters';

const PAGE_SIZE = 8;

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'Todos los pedidos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Todos los pagos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'validando', label: 'Validando' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'vencido', label: 'Vencido' },
];

const SHIPPING_STATUS_OPTIONS = [
  { value: '', label: 'Todos los envíos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'entregado_repartidora', label: 'Entregado a repartidora' },
  { value: 'en_transito', label: 'En tránsito' },
  { value: 'en_destino', label: 'En destino' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'incidencia', label: 'Incidencia' },
];

const STATUS_META = {
  entregado: {
    label: 'Entregado',
    tone: 'success',
    Icon: CheckCircleOutlinedIcon,
  },
  en_destino: {
    label: 'En destino',
    tone: 'info',
    Icon: LocalShippingOutlinedIcon,
  },
  en_transito: {
    label: 'En tránsito',
    tone: 'warning',
    Icon: LocalShippingOutlinedIcon,
  },
  entregado_repartidora: {
    label: 'En tránsito',
    tone: 'warning',
    Icon: LocalShippingOutlinedIcon,
  },
  preparando: {
    label: 'Preparando',
    tone: 'info',
    Icon: SettingsOutlinedIcon,
  },
  bajo_pedido: {
    label: 'Bajo pedido',
    tone: 'warning',
    Icon: Inventory2OutlinedIcon,
  },
  cancelado: {
    label: 'Cancelado',
    tone: 'error',
    Icon: CancelOutlinedIcon,
  },
  incidencia: {
    label: 'Incidencia',
    tone: 'error',
    Icon: CancelOutlinedIcon,
  },
  pago_pendiente: {
    label: 'Pago pendiente',
    tone: 'warning',
    Icon: ScheduleOutlinedIcon,
  },
  pago_validando: {
    label: 'Validando pago',
    tone: 'info',
    Icon: ScheduleOutlinedIcon,
  },
  pago_rechazado: {
    label: 'Pago rechazado',
    tone: 'error',
    Icon: CancelOutlinedIcon,
  },
  pago_vencido: {
    label: 'Pago vencido',
    tone: 'error',
    Icon: ScheduleOutlinedIcon,
  },
  confirmado: {
    label: 'Confirmado',
    tone: 'success',
    Icon: CheckCircleOutlinedIcon,
  },
  pendiente: {
    label: 'Pendiente',
    tone: 'neutral',
    Icon: ScheduleOutlinedIcon,
  },
};

const getToneColor = (theme, tone) => {
  if (tone === 'success') return theme.palette.success.main;
  if (tone === 'warning') return theme.palette.warning.main;
  if (tone === 'error') return theme.palette.error.main;
  if (tone === 'info') return theme.palette.info.main;
  if (tone === 'secondary') return theme.palette.secondary.main;

  return theme.palette.text.secondary;
};

const getOptionLabel = (options, value) => {
  return options.find((option) => option.value === value)?.label || value || 'Pendiente';
};

const getMainOrderStatus = (order) => {
  if (order.estado_pedido === 'cancelado') return STATUS_META.cancelado;
  if (order.estado_envio === 'incidencia') return STATUS_META.incidencia;
  if (order.estado_pago === 'vencido') return STATUS_META.pago_vencido;
  if (order.estado_pago === 'rechazado') return STATUS_META.pago_rechazado;
  if (order.estado_envio === 'entregado') return STATUS_META.entregado;
  if (order.estado_envio === 'en_destino') return STATUS_META.en_destino;

  if (['en_transito', 'entregado_repartidora'].includes(order.estado_envio)) {
    return STATUS_META.en_transito;
  }

  if (order.requiere_abastecimiento) return STATUS_META.bajo_pedido;

  if (order.estado_envio === 'preparando' || order.estado_pedido === 'preparando') {
    return STATUS_META.preparando;
  }

  if (order.estado_pago === 'validando') return STATUS_META.pago_validando;

  if (order.estado_pago === 'pendiente') {
    return STATUS_META.pago_pendiente;
  }

  if (order.estado_pedido === 'confirmado') return STATUS_META.confirmado;

  return STATUS_META.pendiente;
};

const getDisplayStatus = (order, filters) => {
  if (filters.estadoEnvio && order.estado_envio) {
    return STATUS_META[order.estado_envio] ?? STATUS_META.pendiente;
  }

  if (filters.estadoPago) {
    if (order.estado_pago === 'pagado') return STATUS_META.confirmado;
    if (order.estado_pago === 'validando') return STATUS_META.pago_validando;
    if (order.estado_pago === 'rechazado') return STATUS_META.pago_rechazado;
    if (order.estado_pago === 'vencido') return STATUS_META.pago_vencido;
    if (order.estado_pago === 'pendiente') return STATUS_META.pago_pendiente;
  }

  if (filters.estadoPedido) {
    if (order.estado_pedido === 'cancelado') return STATUS_META.cancelado;
    if (order.estado_pedido === 'confirmado') return STATUS_META.confirmado;
    if (order.estado_pedido === 'preparando') return STATUS_META.preparando;
    if (order.estado_pedido === 'enviado') return STATUS_META.en_transito;
    if (order.estado_pedido === 'entregado') return STATUS_META.entregado;
    if (order.estado_pedido === 'pendiente') return STATUS_META.pendiente;
  }

  return getMainOrderStatus(order);
};

const formatShortDate = (dateString) => {
  if (!dateString) return 'Sin fecha';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('es-PE', { month: 'short' }).replace('.', '');
  const year = date.getFullYear();

  return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
};

const formatMonthTitle = (dateString) => {
  if (!dateString) return 'Sin fecha';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  const month = date.toLocaleString('es-PE', { month: 'long' });
  const year = date.getFullYear();

  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
};

const groupOrdersByMonth = (orders = []) => {
  return orders.reduce((groups, order) => {
    const key = formatMonthTitle(order.created_at);

    if (!groups[key]) groups[key] = [];

    groups[key].push(order);

    return groups;
  }, {});
};

const getSelectMenuProps = (theme) => {
  const m = theme.palette.custom.semantic.storeMarketing;

  return {
    slotProps: {
      paper: {
        sx: {
          mt: 0.75,
          borderRadius: theme.palette.custom.radius.xs,
          border: `1px solid ${m.border}`,
          bgcolor: m.cardBg,
          backgroundImage: 'none',
          boxShadow: theme.palette.custom.shadows.xs,
        },
      },
    },
  };
};

const getFieldSx = (theme) => {
  const m = theme.palette.custom.semantic.storeMarketing;

  return {
    bgcolor: m.cardBg,
    color: m.text,
    borderRadius: theme.palette.custom.radius.xs,
    fontSize: '0.875rem',

    '& fieldset': {
      borderColor: m.border,
    },

    '&:hover fieldset': {
      borderColor: m.borderStrong,
    },

    '&.Mui-focused fieldset': {
      borderColor: m.accent,
    },

    '& .MuiSelect-icon': {
      color: m.subtle,
    },

    '& input::placeholder': {
      color: m.subtle,
      opacity: 1,
    },
  };
};

const FilterSelect = ({ label, value, options, onChange }) => {
  const theme = useTheme();
  const menuProps = useMemo(() => getSelectMenuProps(theme), [theme]);

  return (
    <FormControl size="small" fullWidth>
      <InputLabel
        shrink
        sx={(theme) => ({
          fontWeight: 700,
          color: theme.palette.custom.semantic.storeMarketing.muted,

          '&.Mui-focused': {
            color: theme.palette.custom.semantic.storeMarketing.accent,
          },
        })}
      >
        {label}
      </InputLabel>

      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        label={label}
        notched
        MenuProps={menuProps}
        sx={(theme) => getFieldSx(theme)}
      >
        {options.map((option) => (
          <MenuItem key={option.value || 'all'} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const StatusBadge = ({ status }) => {
  const Icon = status.Icon;

  return (
    <Box
      sx={(theme) => {
        const main = getToneColor(theme, status.tone);

        return {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 0.6,
          borderRadius: theme.palette.custom.radius.xs,
          bgcolor: alpha(main, 0.08),
          border: `1px solid ${alpha(main, 0.24)}`,
          color: main,
          whiteSpace: 'nowrap',
        };
      }}
    >
      <Icon
        sx={(theme) => ({
          fontSize: 15,
          color: getToneColor(theme, status.tone),
        })}
      />

      <Typography
        variant="caption"
        sx={(theme) => ({
          fontWeight: 850,
          color: getToneColor(theme, status.tone),
          whiteSpace: 'nowrap',
        })}
      >
        {status.label}
      </Typography>
    </Box>
  );
};

const ResultsLoadingCard = () => {
  return (
    <Box
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;

        return {
          minHeight: 240,
          borderRadius: theme.palette.custom.radius.xs,
          border: `1px solid ${m.border}`,
          bgcolor: m.cardBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress size={34} />

        <Typography
          variant="body2"
          sx={(theme) => ({
            color: theme.palette.custom.semantic.storeMarketing.muted,
            fontWeight: 700,
          })}
        >
          Cargando tus pedidos...
        </Typography>
      </Stack>
    </Box>
  );
};

const OrderListItem = ({ order, filters }) => {
  const status = getDisplayStatus(order, filters);
  const isCancelled = order.estado_pedido === 'cancelado';

  const orderNumber = order.numero_pedido || order.id?.toString().substring(0, 8).toUpperCase();
  const title = order.titulo_pedido || `Pedido-${orderNumber}`;
  const totalItems = order.total_items ?? 0;
  const totalAmount = order.total ?? 0;

  return (
    <Box
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;
        const main = getToneColor(theme, status.tone);

        return {
          bgcolor: isCancelled ? alpha(m.cardBg, 0.72) : m.cardBg,
          borderRadius: theme.palette.custom.radius.xs,
          border: `1px solid ${m.border}`,
          borderLeft: `4px solid ${main}`,
          px: { xs: 2, md: 2.5 },
          py: { xs: 2, md: 2.25 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          opacity: isCancelled ? 0.72 : 1,
          transition: `box-shadow ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}, transform ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}`,

          '&:hover': {
            transform: isCancelled ? 'none' : 'translateY(-1px)',
            boxShadow: isCancelled ? 'none' : theme.palette.custom.shadows.sm,
          },
        };
      }}
    >
      <Box sx={{ minWidth: { md: 200 }, flexShrink: 0 }}>
        <Typography
          variant="overline"
          component="p"
          sx={(theme) => ({
            color: theme.palette.custom.semantic.storeMarketing.subtle,
            fontWeight: 850,
            letterSpacing: '0.08em',
            lineHeight: 1.3,
            mb: 0.5,
          })}
        >
          Orden #{orderNumber}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={(theme) => ({
            color: theme.palette.custom.semantic.storeMarketing.text,
            fontWeight: 850,
            lineHeight: 1.35,
          })}
        >
          {formatShortDate(order.created_at)}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={(theme) => ({
            color: isCancelled
              ? theme.palette.custom.semantic.storeMarketing.subtle
              : theme.palette.custom.semantic.storeMarketing.text,
            fontWeight: 850,
            mb: 0.35,
            textDecoration: isCancelled ? 'line-through' : 'none',
            whiteSpace: { xs: 'normal', md: 'nowrap' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          })}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={(theme) => ({
            color: theme.palette.custom.semantic.storeMarketing.muted,
          })}
        >
          {totalItems} artículo{totalItems !== 1 ? 's' : ''} · {formatCurrency(totalAmount)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'space-between', md: 'flex-end' },
          width: { xs: '100%', md: 'auto' },
          gap: { xs: 1.5, md: 3 },
          flexShrink: 0,
        }}
      >
        <StatusBadge status={status} />

        <Button
          component={RouterLink}
          to={`/mis-pedidos/${order.id}`}
          endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
          variant="text"
          size="small"
          sx={(theme) => ({
            color: theme.palette.custom.semantic.storeMarketing.muted,
            fontWeight: 800,
            p: 0,
            minWidth: 'auto',

            '&:hover': {
              bgcolor: 'transparent',
              color: theme.palette.custom.semantic.storeMarketing.text,
            },
          })}
          disableRipple
        >
          Ver detalle
        </Button>
      </Box>
    </Box>
  );
};

export const MyOrdersPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState({
    estadoPedido: '',
    estadoPago: '',
    estadoEnvio: '',
  });

  const { orders = [], pagination = {}, loading, error } = useMyOrders({
    pageNumber,
    pageSize: PAGE_SIZE,
    estadoPedido: filters.estadoPedido || null,
    estadoPago: filters.estadoPago || null,
    estadoEnvio: filters.estadoEnvio || null,
  });

  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasOrders = orders.length > 0;

  const isInitialLoading = loading && !hasOrders;
  const isRefreshing = loading && hasOrders;

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return orders;

    return orders.filter((order) => {
      const orderNumber = order.numero_pedido?.toLowerCase() || '';
      const orderId = order.id?.toString().toLowerCase() || '';
      const title = order.titulo_pedido?.toLowerCase() || '';

      return orderNumber.includes(search) || orderId.includes(search) || title.includes(search);
    });
  }, [orders, searchTerm]);

  const groupedOrders = useMemo(() => {
    return groupOrdersByMonth(filteredOrders);
  }, [filteredOrders]);

  const hasFilteredOrders = filteredOrders.length > 0;

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));

    setPageNumber(1);
  };

  const clearFilters = () => {
    setFilters({
      estadoPedido: '',
      estadoPago: '',
      estadoEnvio: '',
    });

    setPageNumber(1);
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        bgcolor: theme.palette.custom.semantic.storeMarketing.pageBg,
        py: { xs: 3, md: 5 },
      })}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="overline"
              component="p"
              sx={(theme) => ({
                color: theme.palette.custom.semantic.storeMarketing.accent,
                fontWeight: 850,
                letterSpacing: '0.14em',
                mb: 0.5,
              })}
            >
              Cuenta
            </Typography>

            <Typography
              variant="h2"
              sx={(theme) => ({
                color: theme.palette.custom.semantic.storeMarketing.text,
              })}
            >
              Mis pedidos
            </Typography>

            <Typography
              variant="body1"
              sx={(theme) => ({
                mt: 0.5,
                color: theme.palette.custom.semantic.storeMarketing.muted,
                maxWidth: 680,
              })}
            >
              Registro histórico y estado actual de tus compras.
            </Typography>
          </Box>

          <Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por número de pedido o nombre..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        fontSize="small"
                        sx={(theme) => ({
                          color: theme.palette.custom.semantic.storeMarketing.subtle,
                        })}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <CloseIcon
                          sx={(theme) => ({
                            fontSize: 16,
                            color: theme.palette.custom.semantic.storeMarketing.subtle,
                          })}
                        />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={(theme) => ({
                '& .MuiOutlinedInput-root': {
                  ...getFieldSx(theme),
                  py: 0.25,
                },
              })}
            />
          </Box>

          <Box
            sx={(theme) => {
              const m = theme.palette.custom.semantic.storeMarketing;

              return {
                bgcolor: m.cardBg,
                border: `1px solid ${m.border}`,
                borderRadius: theme.palette.custom.radius.xs,
                p: { xs: 2, sm: 2.5 },
              };
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography
                  variant="overline"
                  sx={(theme) => ({
                    color: theme.palette.custom.semantic.storeMarketing.subtle,
                    fontWeight: 850,
                    letterSpacing: '0.1em',
                  })}
                >
                  Filtrar pedidos
                </Typography>

                {activeCount > 0 && (
                  <Button
                    onClick={clearFilters}
                    startIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                    color="error"
                    size="small"
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                    }}
                    disableRipple
                  >
                    Limpiar filtros
                  </Button>
                )}
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    md: '1fr 1fr 1fr',
                  },
                  gap: 2,
                }}
              >
                <FilterSelect
                  label="Estado del pedido"
                  value={filters.estadoPedido}
                  options={ORDER_STATUS_OPTIONS}
                  onChange={(value) => updateFilter('estadoPedido', value)}
                />

                <FilterSelect
                  label="Estado del pago"
                  value={filters.estadoPago}
                  options={PAYMENT_STATUS_OPTIONS}
                  onChange={(value) => updateFilter('estadoPago', value)}
                />

                <FilterSelect
                  label="Estado del envío"
                  value={filters.estadoEnvio}
                  options={SHIPPING_STATUS_OPTIONS}
                  onChange={(value) => updateFilter('estadoEnvio', value)}
                />
              </Box>

              {activeCount > 0 && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  useFlexGap
                  sx={(theme) => ({
                    flexWrap: 'wrap',
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.custom.semantic.storeMarketing.divider}`,
                  })}
                >
                  <Typography
                    variant="caption"
                    sx={(theme) => ({
                      color: theme.palette.custom.semantic.storeMarketing.subtle,
                      alignSelf: 'center',
                      mr: 0.5,
                    })}
                  >
                    Aplicados:
                  </Typography>

                  {filters.estadoPedido && (
                    <Chip
                      label={`Pedido: ${getOptionLabel(ORDER_STATUS_OPTIONS, filters.estadoPedido)}`}
                      size="small"
                      onDelete={() => updateFilter('estadoPedido', '')}
                      variant="outlined"
                    />
                  )}

                  {filters.estadoPago && (
                    <Chip
                      label={`Pago: ${getOptionLabel(PAYMENT_STATUS_OPTIONS, filters.estadoPago)}`}
                      size="small"
                      onDelete={() => updateFilter('estadoPago', '')}
                      variant="outlined"
                    />
                  )}

                  {filters.estadoEnvio && (
                    <Chip
                      label={`Envío: ${getOptionLabel(SHIPPING_STATUS_OPTIONS, filters.estadoEnvio)}`}
                      size="small"
                      onDelete={() => updateFilter('estadoEnvio', '')}
                      variant="outlined"
                    />
                  )}
                </Stack>
              )}
            </Stack>
          </Box>

          <ErrorMessage message={error} />

          <Box sx={{ position: 'relative' }}>
            {isRefreshing && (
              <LinearProgress
                sx={(theme) => ({
                  mb: 2,
                  height: 5,
                  borderRadius: theme.palette.custom.radius.xs,
                  bgcolor: theme.palette.custom.semantic.storeMarketing.accentSofter,

                  '& .MuiLinearProgress-bar': {
                    borderRadius: theme.palette.custom.radius.xs,
                  },
                })}
              />
            )}

            {isInitialLoading ? (
              <ResultsLoadingCard />
            ) : !hasFilteredOrders && !error ? (
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
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={(theme) => ({
                          color: theme.palette.custom.semantic.storeMarketing.text,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        })}
                      >
                        {monthYear}
                      </Typography>

                      <Box
                        sx={(theme) => ({
                          flex: 1,
                          height: 1,
                          bgcolor: theme.palette.custom.semantic.storeMarketing.divider,
                          mx: 2,
                        })}
                      />

                      <Typography
                        variant="caption"
                        sx={(theme) => ({
                          color: theme.palette.custom.semantic.storeMarketing.subtle,
                          whiteSpace: 'nowrap',
                        })}
                      >
                        {monthOrders.length} pedido{monthOrders.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      {monthOrders.map((order) => (
                        <OrderListItem key={order.id} order={order} filters={filters} />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {pagination.totalPages > 1 && (
            <Stack sx={{ alignItems: 'center', pt: 1 }}>
              <Pagination
                count={pagination.totalPages}
                page={pageNumber}
                onChange={(_, page) => setPageNumber(page)}
                color="primary"
                disabled={loading}
              />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
};