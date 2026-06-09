import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { AdminDialog } from '../../common/adminDialog/AdminDialog';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const promotionStatusConfig = {
  vigente: { label: 'Vigente', color: 'success' },
  programada: { label: 'Programada', color: 'info' },
  vencida: { label: 'Vencida', color: 'warning' },
  inactiva: { label: 'Inactiva', color: 'error' },
};

const promotionTypeLabel = {
  descuento_directo: 'Descuento directo',
  cupon: 'Cupón',
  envio_gratis: 'Envío gratis',
};

const discountTypeLabel = {
  porcentaje: 'Porcentaje (%)',
  monto_fijo: 'Monto fijo',
  envio_gratis: 'Envío gratis',
};

const appliesToLabel = {
  todos: 'Todo el catálogo',
  categoria: 'Categoría',
  producto: 'Producto',
  variante: 'Variante',
};

const targetTypeLabel = {
  categoria: 'Categoría',
  producto: 'Producto',
  variante: 'Variante',
};

const getPromotionStatusConfig = (status) => {
  return promotionStatusConfig[status] || {
    label: status || 'Sin estado',
    color: 'default',
  };
};

const formatDiscountValue = (promotion) => {
  if (promotion.tipo_descuento === 'envio_gratis') return 'Envío gratis';
  if (promotion.tipo_descuento === 'porcentaje') return `${Number(promotion.valor_descuento || 0)}%`;
  return formatCurrency(promotion.valor_descuento);
};

const InfoItem = ({ label, value }) => (
  <Box>
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700 }}>
      {value || '-'}
    </Typography>
  </Box>
);

export const PromotionDetailDialog = ({ open, onClose, promotion }) => {
  if (!promotion) return null;

  const statusConfig = getPromotionStatusConfig(promotion.estado_calculado);

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title="Detalle de promoción"
      maxWidth="md"
      actions={
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      }
    >
      <Stack spacing={3}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={promotion.es_activa ? 'Activa' : 'Inactiva'}
            color={promotion.es_activa ? 'success' : 'error'}
            variant="outlined"
          />
          <Chip
            size="small"
            label={statusConfig.label}
            color={statusConfig.color}
            variant="outlined"
          />
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 3,
                bgcolor: 'background.paper',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <LocalOfferIcon fontSize="small" /> Información general
              </Typography>

              <Stack spacing={2}>
                <InfoItem label="Nombre" value={promotion.nombre} />
                <InfoItem label="Descripción" value={promotion.descripcion || 'Sin descripción'} />
                <InfoItem
                  label="Tipo de promoción"
                  value={promotionTypeLabel[promotion.tipo_promocion] || promotion.tipo_promocion}
                />
                <InfoItem
                  label="Aplica a"
                  value={appliesToLabel[promotion.aplica_a] || promotion.aplica_a}
                />
                <InfoItem label="Código cupón" value={promotion.codigo || 'Sin código'} />
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 3,
                bgcolor: 'background.paper',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <CalendarTodayIcon fontSize="small" /> Reglas y vigencia
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem
                    label="Tipo descuento"
                    value={discountTypeLabel[promotion.tipo_descuento] || promotion.tipo_descuento}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label="Valor" value={formatDiscountValue(promotion)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label="Fecha inicio" value={formatDate(promotion.fecha_inicio)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label="Fecha fin" value={formatDate(promotion.fecha_fin)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label="Monto mínimo" value={formatCurrency(promotion.monto_minimo_pedido)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label="Prioridad" value={String(promotion.prioridad ?? 0)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label="Uso máximo total" value={promotion.uso_maximo ?? 'Ilimitado'} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label="Uso por cliente" value={promotion.uso_por_cliente ?? 'Ilimitado'} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 800 }}>
              Aplicaciones de la promoción
            </Typography>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 3, overflow: 'hidden' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Tipo de objetivo</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Objetivo afectado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {promotion.aplicaciones?.length > 0 ? (
                    promotion.aplicaciones.map((app) => (
                      <TableRow key={app.id || `${app.target_tipo}-${app.target_id}`}>
                        <TableCell>{targetTypeLabel[app.target_tipo] || app.target_tipo || 'General'}</TableCell>
                        <TableCell>{app.target_nombre || 'Todo el catálogo'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        Esta promoción se aplica de forma global a todo el catálogo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Stack>
    </AdminDialog>
  );
};
