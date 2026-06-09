import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon      from '@mui/icons-material/InfoOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SwapVertIcon          from '@mui/icons-material/SwapVert';
import FormatQuoteIcon       from '@mui/icons-material/FormatQuote';

import { AdminDialog } from '../../../../components/common/adminDialog/AdminDialog';

// ── Sub-componente DetailRow ───────────────────────────────────────────────────

const DetailRow = ({ label, value }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '120px 1fr',
      gap: 2,
      alignItems: 'center',
      mb: 1.5,
      p: 0.5,
      borderRadius: 1,
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {value || '-'}
    </Typography>
  </Box>
);

// ── Componente principal ───────────────────────────────────────────────────────

export const MovementDetailDialog = ({ open, movimiento, onClose }) => {
  if (!movimiento) return null;

  const actions = (
    <Button onClick={onClose} variant="contained" color="primary">
      Cerrar
    </Button>
  );

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title="Detalle del movimiento"
      icon={<SwapVertIcon />}
      maxWidth="md"
      actions={actions}
    >
      {/* Alerta de anulación */}
      {movimiento.anulado && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={900}>
            Movimiento anulado
          </Typography>
          <Typography variant="body2">
            Motivo: {movimiento.motivo_anulacion || 'No especificado'}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={5}>
        {/* Columna 1: Información base */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <InfoOutlinedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Información base
            </Typography>
          </Box>

          <DetailRow
            label="ID"
            value={`${movimiento.id?.toUpperCase()?.slice(0, 13)}…`}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: 2,
              alignItems: 'center',
              mb: 1.5,
              p: 0.5,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Tipo y acción
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={movimiento.tipo_movimiento}
                sx={{ textTransform: 'uppercase', fontWeight: 700 }}
              />
              <Chip
                size="small"
                label={movimiento.referencia_tipo?.replace('_', ' ')}
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          </Box>

          <DetailRow label="Cantidad" value={movimiento.cantidad} />
        </Grid>

        {/* Columna 2: Datos del item */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Inventory2OutlinedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Item afectado
            </Typography>
          </Box>
          <DetailRow label="Producto" value={movimiento.producto_nombre} />
          <DetailRow label="Variante"  value={movimiento.nombre_variante}  />
          <DetailRow label="Almacén"   value={movimiento.almacen_nombre}   />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Historial de stocks */}
      <Box
        sx={{
          bgcolor: 'action.hover',
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <SwapVertIcon color="action" />
          <Typography variant="subtitle1" fontWeight={700}>
            Historial de stock (auditoría)
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="overline" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
              Stock disponible
            </Typography>
            <DetailRow label="Antes"  value={movimiento.stock_disponible_antes}   />
            <DetailRow label="Después" value={movimiento.stock_disponible_despues} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="overline" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
              Stock reservado
            </Typography>
            <DetailRow label="Antes"  value={movimiento.stock_reservado_antes}   />
            <DetailRow label="Después" value={movimiento.stock_reservado_despues} />
          </Grid>
        </Grid>
      </Box>

      {/* Notas */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <FormatQuoteIcon color="action" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={700}>
            Notas del operador
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            fontStyle: movimiento.notas ? 'normal' : 'italic',
            opacity: movimiento.notas ? 1 : 0.6,
          }}
        >
          {movimiento.notas || 'Sin observaciones registradas.'}
        </Typography>
      </Box>
    </AdminDialog>
  );
};