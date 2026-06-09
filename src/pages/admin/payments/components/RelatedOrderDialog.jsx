import {
  Box,
  Button,
  Typography,
  Grid,
  Divider,
  useTheme,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  alpha,
  Paper,
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import Inventory2Icon from '@mui/icons-material/Inventory2';

import { AdminDialog } from '../../../../components/common/adminDialog/AdminDialog';
import { useAdminRelatedOrder } from '../../../../hooks/sales/useAdminPayments';

const SectionCard = ({ title, icon, children, sx }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.default, 0.5),
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const formatFecha = (fechaStr) =>
  fechaStr
    ? new Intl.DateTimeFormat('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }).format(new Date(fechaStr))
    : '-';

export const RelatedOrderDialog = ({ open, pedidoId, onClose }) => {
  const theme = useTheme();
  const { data: order, isLoading } = useAdminRelatedOrder(open ? pedidoId : null);

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title="Pedido relacionado"
      icon={<ShoppingBagIcon />}
      maxWidth="md"
      actions={
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cerrar
        </Button>
      }
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : !order ? (
        <Typography color="error" align="center" sx={{ py: 4 }}>
          No se pudo cargar la información.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3, borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>N° DE PEDIDO</Typography>
              <Typography variant="h5" fontWeight={900} color="primary.main">{order.numero_pedido}</Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>ESTADO</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={order.estado_pedido} size="small" variant="outlined" sx={{ fontWeight: 700, textTransform: 'uppercase' }} />
                <Chip
                  label={order.estado_pago}
                  size="small"
                  color={order.estado_pago === 'pagado' ? 'success' : 'warning'}
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                />
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <SectionCard title="Cliente" icon={<PersonIcon fontSize="small" color="primary" />} sx={{ height: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Nombre</Typography>
                    <Typography variant="body2" fontWeight={600}>{order.nombre_cliente}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Contacto</Typography>
                    <Typography variant="body2" fontWeight={600}>{order.telefono_cliente}</Typography>
                    <Typography variant="body2" color="text.secondary">{order.correo_cliente}</Typography>
                  </Box>
                </Box>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <SectionCard title="Items" icon={<Inventory2Icon fontSize="small" color="primary" />}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', pl: 0 }}>Producto</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>Cant.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', pr: 0 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map((item, idx) => (
                      <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ pl: 0, py: 1.5 }}>
                          <Typography variant="body2" fontWeight={600}>{item.nombre_producto}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.nombre_variante}</Typography>
                        </TableCell>
                        <TableCell align="center">{item.cantidad}</TableCell>
                        <TableCell align="right" sx={{ pr: 0, fontWeight: 700 }}>{formatCurrency(item.total_linea)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="primary.main">{formatCurrency(order.total)}</Typography>
                </Box>
              </SectionCard>
            </Grid>
          </Grid>

          {order.pagos?.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" /> PAGOS REGISTRADOS
              </Typography>
              <Grid container spacing={2}>
                {order.pagos.map((pago, idx) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2, borderRadius: 3, bgcolor: 'background.paper',
                        transition: '0.2s', '&:hover': { boxShadow: theme.shadows[2] },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="body2" fontWeight={800}>{pago.metodo_pago.toUpperCase()}</Typography>
                        <Chip
                          label={pago.estado}
                          size="small"
                          color={pago.estado === 'aprobado' ? 'success' : pago.estado === 'rechazado' ? 'error' : 'default'}
                          sx={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '0.65rem' }}
                        />
                      </Box>
                      <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          <strong>Fecha:</strong> {formatFecha(pago.created_at)}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                          <strong>Ref:</strong> {pago.referencia_transaccion || 'S/N'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}
    </AdminDialog>
  );
};
