import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

const formatNumber = (value, fallback = '0') => {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue)) return fallback;

  return numberValue.toLocaleString('es-PE');
};

const getStockState = (data) => {
  const cantidadDisponible = Number(data?.cantidad_disponible ?? 0);
  const stockMinimo = Number(data?.stock_minimo ?? 0);

  if (cantidadDisponible <= 0) {
    return {
      label: 'Sin stock',
      color: 'error',
      softColor: 'error.main',
    };
  }

  if (stockMinimo > 0 && cantidadDisponible <= stockMinimo) {
    return {
      label: 'Stock bajo',
      color: 'warning',
      softColor: 'warning.main',
    };
  }

  return {
    label: 'Stock correcto',
    color: 'success',
    softColor: 'success.main',
  };
};

const DetailItem = ({ label, value, icon: Icon }) => {
  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        height: '100%',
        p: 1.6,
        borderRadius: 3,
        borderColor: theme.palette.divider,
        backgroundColor: alpha(theme.palette.background.paper, 0.72),
      })}
    >
      <Stack
        direction="row"
        spacing={1.3}
        sx={{ alignItems: 'flex-start' }}
      >
        {Icon && (
          <Box
            sx={(theme) => ({
              width: 34,
              height: 34,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            })}
          >
            <Icon fontSize="small" />
          </Box>
        )}

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mb: 0.3,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            }}
          >
            {label}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              wordBreak: 'break-word',
            }}
          >
            {value || '-'}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const StockMetricCard = ({ label, value, helper, accent = 'primary.main' }) => {
  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        p: 1.8,
        height: '100%',
        borderRadius: 3,
        borderColor: alpha(theme.palette.divider, 0.9),
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        transition: theme.transitions.create(['border-color', 'box-shadow', 'transform'], {
          duration: theme.transitions.duration.shortest,
        }),

        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[2],
          borderColor: alpha(theme.palette.primary.main, 0.28),
        },
      })}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="h6"
        sx={{
          mt: 0.4,
          fontWeight: 900,
          color: accent,
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>

      {helper && (
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      )}
    </Paper>
  );
};

export const InventoryDetailDialog = ({
  open,
  onClose,
  data,
  onViewMovements,
  onAdjustStock,
}) => {
  const stockState = useMemo(() => getStockState(data), [data]);

  if (!data) return null;

  const handleClose = () => {
    document.activeElement?.blur();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Detalle de inventario
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>  

      <DialogContent
        dividers
        sx={(theme) => ({
          p: { xs: 2, sm: 3 },
          backgroundColor: alpha(theme.palette.background.default, 0.45),
        })}
      >
        <Stack spacing={2.5}>
          <Paper
            variant="outlined"
            sx={(theme) => ({
              p: 2,
              borderRadius: 1,
              borderColor: alpha(theme.palette.primary.main, 0.18),
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
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
                <strong>Variante: </strong>{data.nombre_variante || 'Sin variante registrada'}
              </Typography>
            </Stack>
          </Paper>

          <Box>
            <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1.2 }}>
              Resumen de stock
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, md: 3 }}>
                <StockMetricCard
                  label="Disponible"
                  value={formatNumber(data.cantidad_disponible)}
                  helper="Listo para venta"
                  accent="success.main"
                />
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <StockMetricCard
                  label="Reservado"
                  value={formatNumber(data.cantidad_reservada)}
                  helper="Comprometido"
                  accent="warning.main"
                />
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <StockMetricCard
                  label="Stock total"
                  value={formatNumber(data.stock_total)}
                  helper="Disponible y reservado"
                  accent="primary.main"
                />
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

          <Box>
            <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1.2 }}>
              Información relacionada
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailItem
                  label="Almacén"
                  value={data.almacen_nombre}
                  icon={WarehouseOutlinedIcon}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DetailItem
                  label="Estado"
                  value={stockState.label}
                  icon={Inventory2OutlinedIcon}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <DetailItem
                  label="Atributos"
                  value={data.atributos_resumen || 'Sin atributos registrados'}
                  icon={TuneRoundedIcon}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={(theme) => ({
          px: { xs: 2, sm: 3 },
          py: 2,
          gap: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          flexWrap: 'wrap',
        })}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 800,
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};