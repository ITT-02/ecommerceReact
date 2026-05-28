import { Link as RouterLink } from 'react-router-dom';

import { Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

import { formatCurrency, formatDate, joinText } from '../../../../utils/formatters';

const iconByKey = {
  stock_bajo: Inventory2OutlinedIcon,
  sin_stock: CancelOutlinedIcon,
  normal: CheckCircleOutlineOutlinedIcon,
  cancelado: CancelOutlinedIcon,
  entregado: CheckCircleOutlineOutlinedIcon,
  pendiente: PendingActionsOutlinedIcon,
  confirmado: CheckCircleOutlineOutlinedIcon,
  preparando: Inventory2OutlinedIcon,
  enviado: LocalShippingOutlinedIcon,
  venta: ShoppingCartOutlinedIcon,
  compra: ReceiptLongOutlinedIcon,
  entrada: ReceiptLongOutlinedIcon,
  salida: LocalShippingOutlinedIcon,
  envio: LocalShippingOutlinedIcon,
  validando: ReceiptLongOutlinedIcon,
  aprobado: CheckCircleOutlineOutlinedIcon,
  pagado: CheckCircleOutlineOutlinedIcon,
  rechazado: CancelOutlinedIcon,
  fallido: CancelOutlinedIcon,
  recibo: ReceiptOutlinedIcon,
  movimiento: ReceiptOutlinedIcon,
};

const normalize = (value) => String(value ?? '').trim().toLowerCase();

const formatNumber = (value) =>
  new Intl.NumberFormat('es-PE').format(Number(value ?? 0));

const getTone = (theme, toneKey) => {
  const tones = theme.palette.custom.semantic.entityTone;
  return tones[toneKey] ?? tones.neutral;
};

const getToneByState = (type, stateValue) => {
  const state = normalize(stateValue);

  if (type === 'orders') {
    if (['confirmado', 'entregado'].includes(state)) return 'success';
    if (['pendiente', 'preparando'].includes(state)) return 'warning';
    if (state === 'enviado') return 'info';
    if (state === 'cancelado') return 'danger';
    return 'neutral';
  }

  if (type === 'payments') {
    if (['aprobado', 'pagado'].includes(state)) return 'success';
    if (['pendiente', 'validando'].includes(state)) return 'warning';
    if (['rechazado', 'fallido', 'cancelado'].includes(state)) return 'danger';
    return 'neutral';
  }

  if (type === 'inventory') {
    if (state === 'normal') return 'success';
    if (state === 'stock_bajo') return 'warning';
    if (state === 'sin_stock') return 'danger';
    return 'neutral';
  }

  if (['entrada', 'compra', 'recibo'].includes(state)) return 'success';
  if (['stock_bajo', 'pendiente', 'preparando', 'validando'].includes(state)) return 'warning';
  if (['enviado', 'envio', 'salida', 'venta'].includes(state)) return 'info';
  if (['sin_stock', 'cancelado', 'rechazado', 'fallido'].includes(state)) return 'danger';

  return 'neutral';
};

const getReadableState = (value) => {
  const text = String(value ?? 'Sin estado').replaceAll('_', ' ').trim();

  if (!text) return 'Sin estado';

  return text.charAt(0).toUpperCase() + text.slice(1);
};

const getIconByKey = (key) => iconByKey[normalize(key)] ?? ReceiptLongOutlinedIcon;

const inventoryIconKey = (estadoStock) => {
  const estado = normalize(estadoStock);

  if (estado === 'sin_stock') return 'sin_stock';
  if (estado === 'normal') return 'normal';

  return 'stock_bajo';
};

const orderIconKey = (estadoPedido) => {
  const estado = normalize(estadoPedido);

  if (['cancelado', 'entregado', 'confirmado', 'preparando', 'enviado'].includes(estado)) {
    return estado;
  }

  return 'pendiente';
};

const movementIconKey = (tipoMovimiento) => {
  const tipo = normalize(tipoMovimiento);

  if (['venta', 'salida'].includes(tipo)) return 'venta';
  if (['compra', 'entrada'].includes(tipo)) return 'compra';
  if (['envio', 'enviado'].includes(tipo)) return 'envio';

  return 'recibo';
};

const EmptyDashboardCard = () => (
  <Box
    sx={(theme) => ({
      py: 3,
      px: 2,
      borderRadius: theme.palette.custom.radius.xs,
      backgroundColor: theme.palette.custom.semantic.dataTable.emptyStateBg,
    })}
  >
    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
      No hay datos para el rango seleccionado.
    </Typography>
  </Box>
);

const DashboardActionButton = ({
  linkText = 'Ver detalles',
  detailsPath = '',
  detailsState = null,
  onClick,
}) => {
  const hasLink = Boolean(detailsPath);
  const hasAction = hasLink || typeof onClick === 'function';

  const buttonProps = hasLink
    ? {
        component: RouterLink,
        to: detailsPath,
        state: detailsState,
      }
    : {
        component: 'button',
        onClick,
      };

  return (
    <Button
      {...buttonProps}
      variant="text"
      size="small"
      disabled={!hasAction}
      endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
    >
      {linkText}
    </Button>
  );
};

const DashboardCardShell = ({
  title,
  description,
  children,
  linkText,
  detailsPath,
  detailsState,
  onClick,
}) => (
  <Card
    sx={(theme) => ({
      width: '100%',
      height: '100%',
      borderRadius: theme.palette.custom.radius.xs,
      borderColor: theme.palette.custom.semantic.border,
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.palette.custom.shadows.sm,
    })}
  >
    <CardContent
      sx={{
        p: { xs: 2, md: 2.25 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="h6"
          sx={(theme) => ({
            color: theme.palette.custom.semantic.form.sectionTitleColor,
            fontWeight: 700,
          })}
        >
          {title}
        </Typography>

        {description ? (
          <Typography variant="body2" sx={{ mt: 0.35, color: 'text.secondary' }}>
            {description}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>

      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
        <DashboardActionButton
          linkText={linkText}
          detailsPath={detailsPath}
          detailsState={detailsState}
          onClick={onClick}
        />
      </Box>
    </CardContent>
  </Card>
);

const HorizontalChartRow = ({ item, maxValue }) => {
  const Icon = getIconByKey(item.iconKey);
  const safeValue = Number(item.value ?? 0);
  const safeMax = Math.max(Number(maxValue ?? 0), 1);
  const percent = Math.min((safeValue / safeMax) * 100, 100);
  const minWidth = safeValue > 0 ? 8 : 3;

  return (
    <Stack
      spacing={1}
      sx={(theme) => {
        const tone = getTone(theme, item.toneKey);

        return {
          p: 1.25,
          borderRadius: theme.palette.custom.radius.xs,
          border: '1px solid',
          borderColor: theme.palette.custom.semantic.borderSubtle,
          backgroundColor: theme.palette.custom.semantic.paperWarm,
          transition: `transform ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut},
            border-color ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}`,
          '&:hover': {
            transform: 'translateY(-1px)',
            borderColor: tone.border,
          },
        };
      }}
    >
      <Stack 
          direction="row" 
          sx={{ gap: 1.25, alignItems: "center" }}
        >
        <Box
          sx={(theme) => {
            const tone = getTone(theme, item.toneKey);

            return {
              width: 36,
              height: 36,
              borderRadius: theme.palette.custom.radius.pill,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: tone.bg,
              color: tone.fg,
              border: '1px solid',
              borderColor: tone.border,
              flexShrink: 0,
            };
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            title={item.label}
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </Typography>

          {item.subtitle ? (
            <Typography
              variant="caption"
              title={item.subtitle}
              sx={{
                display: 'block',
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.subtitle}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary' }}>
            {item.valueLabel}
          </Typography>

          {item.helperLabel ? (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {item.helperLabel}
            </Typography>
          ) : null}
        </Box>
      </Stack>

      <Box
        sx={(theme) => ({
          height: 8,
          overflow: 'hidden',
          borderRadius: theme.palette.custom.radius.pill,
          backgroundColor: theme.palette.action.hover,
        })}
      >
        <Box
          sx={(theme) => {
            const tone = getTone(theme, item.toneKey);

            return {
              width: `${Math.max(percent, minWidth)}%`,
              height: '100%',
              borderRadius: theme.palette.custom.radius.pill,
              backgroundColor: tone.fg,
              transition: `width ${theme.palette.custom.motion.durationSlow} ${theme.palette.custom.motion.easeOut}`,
            };
          }}
        />
      </Box>
    </Stack>
  );
};

const HorizontalChart = ({ items = [] }) => {
  const maxValue = items.reduce((max, item) => {
    const current = Number(item.value ?? 0);
    return current > max ? current : max;
  }, 0);

  if (items.length === 0) return <EmptyDashboardCard />;

  return (
    <Stack spacing={1.1}>
      {items.map((item, index) => (
        <HorizontalChartRow
          key={item.id ?? `${item.label}-${index}`}
          item={item}
          maxValue={maxValue}
        />
      ))}
    </Stack>
  );
};

const TextBlock = ({ title, subtitle }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      variant="body2"
      title={title}
      sx={{
        fontWeight: 800,
        color: 'text.primary',
        lineHeight: 1.2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {title}
    </Typography>

    {subtitle ? (
      <Typography
        variant="caption"
        title={subtitle}
        sx={{
          color: 'text.secondary',
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {subtitle}
      </Typography>
    ) : null}
  </Box>
);

const DashboardStatusRow = ({ type, item }) => {
  const Icon = getIconByKey(item.iconKey);
  const toneKey = getToneByState(type, item.state);

  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        width: '100%',
        alignItems: { xs: 'flex-start', sm: 'center' },
      }}
    >
      <Box
        sx={(theme) => {
          const tone = getTone(theme, toneKey);

          return {
            width: 36,
            height: 36,
            borderRadius: theme.palette.custom.radius.pill,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: tone.bg,
            color: tone.fg,
            border: '1px solid',
            borderColor: tone.border,
            flexShrink: 0,
          };
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box
          component="span"
          sx={(theme) => {
            const tone = getTone(theme, toneKey);

            return {
              px: 1.25,
              py: 0.5,
              maxWidth: '100%',
              borderRadius: theme.palette.custom.radius.pill,
              backgroundColor: tone.bg,
              color: tone.fg,
              border: '1px solid',
              borderColor: tone.border,
              fontWeight: 800,
              fontSize: '0.76rem',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            };
          }}
        >
          {getReadableState(item.state)}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>{item.center}</Box>
      </Box>

      <Box sx={{ flexShrink: 0, textAlign: 'right', pt: { xs: 0.5, sm: 0 } }}>
        {item.count !== undefined && item.count !== null ? (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.secondary',
              fontWeight: 700,
            }}
          >
            {item.count} reg.
          </Typography>
        ) : null}

        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
          {item.rightValue ?? '-'}
        </Typography>
      </Box>
    </Stack>
  );
};

const DashboardListCard = ({
  title,
  description,
  type,
  items = [],
  linkText = 'Ver detalles',
  detailsPath = '',
  detailsState = null,
  onClick,
}) => (
  <DashboardCardShell
    title={title}
    description={description}
    linkText={linkText}
    detailsPath={detailsPath}
    detailsState={detailsState}
    onClick={onClick}
  >
    <Stack divider={<Divider flexItem />} spacing={0}>
      {items.length === 0 ? (
        <EmptyDashboardCard />
      ) : (
        items.map((item, index) => (
          <Box key={item.id ?? index} sx={{ py: 1.15, px: 0.25 }}>
            <DashboardStatusRow type={type} item={item} />
          </Box>
        ))
      )}
    </Stack>
  </DashboardCardShell>
);

const buildMovementChartItems = (movimientosRecientes = []) => {
  const grouped = new Map();

  movimientosRecientes.forEach((row) => {
    const key = normalize(row.tipo_movimiento) || 'movimiento';
    const current = grouped.get(key) ?? {
      id: key,
      label: getReadableState(key),
      subtitle: 'Movimientos registrados',
      value: 0,
      records: 0,
      iconKey: movementIconKey(key),
      toneKey: getToneByState('movements', key),
    };

    current.value += Math.abs(Number(row.cantidad ?? 0));
    current.records += 1;

    grouped.set(key, current);
  });

  return Array.from(grouped.values())
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      ...item,
      valueLabel: `${formatNumber(item.value)} und.`,
      helperLabel: `${formatNumber(item.records)} mov.`,
    }));
};

export const PedidosEstadoCard = ({
  pedidosPorEstado = [],
  onViewDetails,
  detailsPath,
  detailsState,
}) => {
  const items = pedidosPorEstado
    .map((row, index) => {
      const estado = row.estado || 'Sin estado';
      const total = Number(row.total ?? 0);

      return {
        id: row.estado ? `${row.estado}-${index}` : index,
        label: getReadableState(estado),
        subtitle: 'Pedidos registrados',
        value: total,
        valueLabel: formatNumber(total),
        helperLabel: 'pedidos',
        iconKey: orderIconKey(estado),
        toneKey: getToneByState('orders', estado),
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <DashboardCardShell
      title="Pedidos por estado"
      description="Distribución de pedidos del periodo."
      linkText="Ver pedidos"
      onClick={onViewDetails}
      detailsPath={detailsPath}
      detailsState={detailsState}
    >
      <HorizontalChart items={items} />
    </DashboardCardShell>
  );
};

export const PagosEstadoCard = ({
  pagosPorEstado = [],
  onViewDetails,
  detailsPath,
  detailsState,
}) => {
  const items = pagosPorEstado
    .map((row, index) => {
      const estado = row.estado || 'Sin estado';
      const montoTotal = Number(row.monto_total ?? 0);
      const totalRegistros = Number(row.total ?? 0);

      return {
        id: row.estado ? `${row.estado}-${index}` : index,
        label: getReadableState(estado),
        subtitle: `${formatNumber(totalRegistros)} operaciones`,
        value: montoTotal,
        valueLabel: formatCurrency(montoTotal),
        helperLabel: 'monto',
        iconKey: estado,
        toneKey: getToneByState('payments', estado),
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <DashboardCardShell
      title="Pagos por estado"
      description="Monto agrupado según estado de pago."
      linkText="Ver pagos"
      onClick={onViewDetails}
      detailsPath={detailsPath}
      detailsState={detailsState}
    >
      <HorizontalChart items={items} />
    </DashboardCardShell>
  );
};

export const InventarioCriticoCard = ({
  inventarioCritico = [],
  onViewDetails,
  detailsPath,
  detailsState,
}) => {
  const items = inventarioCritico
    .map((row, index) => {
      const estado = normalize(row.estado_stock) || 'stock_bajo';
      const cantidad = Number(row.cantidad_disponible ?? 0);
      const producto = row.producto_nombre || 'Producto sin nombre';

      return {
        id: row.producto_nombre ? `${row.producto_nombre}-${index}` : index,
        label: producto,
        subtitle: joinText(getReadableState(estado), row.nombre_variante, row.almacen_nombre),
        value: cantidad,
        valueLabel: formatNumber(cantidad),
        helperLabel: 'stock',
        iconKey: inventoryIconKey(estado),
        toneKey: getToneByState('inventory', estado),
      };
    })
    .sort((a, b) => a.value - b.value)
    .slice(0, 6);

  return (
    <DashboardCardShell
      title="Inventario crítico"
      description="Productos con bajo stock o sin disponibilidad."
      linkText="Ver inventario"
      onClick={onViewDetails}
      detailsPath={detailsPath}
      detailsState={detailsState}
    >
      <HorizontalChart items={items} />
    </DashboardCardShell>
  );
};

export const UltimosPedidosCard = ({
  ultimosPedidos = [],
  onViewDetails,
  detailsPath,
  detailsState,
}) => {
  const items = ultimosPedidos.map((row, index) => ({
    id: row.numero_pedido ? `${row.numero_pedido}-${index}` : index,
    state: normalize(row.estado_pedido) || 'pendiente',
    iconKey: orderIconKey(row.estado_pedido),
    center: (
      <TextBlock
        title={`N° ${row.numero_pedido || 'sin número'}`}
        subtitle={`${row.nombre_cliente || 'Cliente no registrado'} • ${
          row.estado_pago || 'Sin pago'
        }`}
      />
    ),
    rightValue: formatCurrency(row.total ?? 0),
  }));

  return (
    <DashboardListCard
      title="Últimos pedidos"
      description="Pedidos recientes para seguimiento operativo."
      type="orders"
      items={items}
      linkText="Ver pedidos"
      onClick={onViewDetails}
      detailsPath={detailsPath}
      detailsState={detailsState}
    />
  );
};

export const MovimientosRecientesCard = ({
  movimientosRecientes = [],
  onViewDetails,
  detailsPath,
  detailsState,
}) => {
  const chartItems = buildMovementChartItems(movimientosRecientes);

  return (
    <DashboardCardShell
      title="Movimientos recientes"
      description="Unidades movidas agrupadas por tipo."
      linkText="Ver movimientos"
      onClick={onViewDetails}
      detailsPath={detailsPath}
      detailsState={detailsState}
    >
      <HorizontalChart items={chartItems} />
    </DashboardCardShell>
  );
};