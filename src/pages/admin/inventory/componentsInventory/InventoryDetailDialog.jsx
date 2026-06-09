import { useMemo } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import { AdminDialog } from '../../../../components/common/adminDialog/AdminDialog';

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatNumber = (value, fallback = '0') => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toLocaleString('es-PE') : fallback;
};

const getStockState = (data) => {
  const disponible = Number(data?.cantidad_disponible ?? 0);
  const minimo     = Number(data?.stock_minimo ?? 0);

  if (disponible <= 0)                        return { label: 'Sin stock',     color: 'error',   softColor: 'error.main'   };
  if (minimo > 0 && disponible <= minimo)     return { label: 'Stock bajo',    color: 'warning', softColor: 'warning.main' };
  return                                             { label: 'Stock correcto', color: 'success', softColor: 'success.main' };
};

// ── Sub-componentes ────────────────────────────────────────────────────────────

const DetailItem = ({ label, value, icon: Icon }) => (
  <Paper
    variant="outlined"
    sx={(t) => ({
      height: '100%', p: 1.6, borderRadius: 3,
      borderColor: t.palette.divider,
    })}
  >
    <Stack direction="row" spacing={1.3} sx={{ alignItems: 'flex-start' }}>
      {Icon && (
        <Box
          sx={(t) => ({
            width: 34, height: 34, borderRadius: 2, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'primary.main',
            bgcolor: (th) => `${th.palette.primary.main}14`,
          })}
        >
          <Icon fontSize="small" />
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption" color="text.secondary"
          sx={{ display: 'block', mb: 0.3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
          {value || '-'}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const StockMetricCard = ({ label, value, helper, accent = 'primary.main' }) => (
  <Paper
    variant="outlined"
    sx={(t) => ({
      p: 1.8, height: '100%', borderRadius: 3, borderColor: t.palette.divider,
      transition: t.transitions.create(['border-color', 'box-shadow', 'transform'], {
        duration: t.transitions.duration.shortest,
      }),
      '&:hover': { transform: 'translateY(-1px)', boxShadow: t.shadows[2] },
    })}
  >
    <Typography
      variant="caption" color="text.secondary"
      sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}
    >
      {label}
    </Typography>
    <Typography variant="h6" sx={{ mt: 0.4, fontWeight: 900, color: accent, lineHeight: 1.2 }}>
      {value}
    </Typography>
    {helper && <Typography variant="caption" color="text.secondary">{helper}</Typography>}
  </Paper>
);

// ── Componente principal ───────────────────────────────────────────────────────

export const InventoryDetailDialog = ({ open, onClose, data, onViewMovements, onAdjustStock }) => {
  const stockState = useMemo(() => getStockState(data), [data]);

  if (!data) return null;

  const actions = (
    <Button onClick={onClose} variant="contained" color="primary">
      Cerrar
    </Button>
  );

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title="Detalle de inventario"
      icon={<Inventory2OutlinedIcon />}
      maxWidth="md"
      actions={actions}
    >
      <Stack spacing={2.5}>
        {/* Encabezado del producto */}
        <Paper
          variant="outlined"
          sx={(t) => ({
            p: 2, borderRadius: 1,
            borderColor: `${t.palette.primary.main}2E`,
            bgcolor: `${t.palette.primary.main}0A`,
          })}
        >
          <Stack spacing={0.8}>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              PRODUCTO
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {data.producto_nombre || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Variante:</strong> {data.nombre_variante || 'Sin variante registrada'}
            </Typography>
          </Stack>
        </Paper>

        {/* Métricas de stock */}
        <Box>
          <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1.2 }}>
            Resumen de stock
          </Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StockMetricCard label="Disponible"   value={formatNumber(data.cantidad_disponible)} helper="Listo para venta"       accent="success.main"        />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StockMetricCard label="Reservado"    value={formatNumber(data.cantidad_reservada)}  helper="Comprometido"           accent="warning.main"        />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StockMetricCard label="Stock total"  value={formatNumber(data.stock_total)}         helper="Disponible y reservado" accent="primary.main"        />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StockMetricCard
                label="Stock mínimo"
                value={data.stock_minimo != null ? formatNumber(data.stock_minimo) : '-'}
                helper="Alerta operativa"
                accent={stockState.softColor}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Info relacionada */}
        <Box>
          <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1.2 }}>
            Información relacionada
          </Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <DetailItem label="Almacén"  value={data.almacen_nombre}                          icon={WarehouseOutlinedIcon}  />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DetailItem label="Estado"   value={stockState.label}                             icon={Inventory2OutlinedIcon} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <DetailItem label="Atributos" value={data.atributos_resumen || 'Sin atributos'} icon={TuneRoundedIcon}        />
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </AdminDialog>
  );
};