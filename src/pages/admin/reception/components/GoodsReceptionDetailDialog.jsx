import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import { formatCurrency, formatDate } from '../../../../utils/formatters';

const statusLabel = {
  parcial: 'Parcial',
  completa: 'Completa',
  anulada: 'Anulada',
};

export const GoodsReceptionDetailDialog = ({ open, data, loading, error, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pr: 6, fontWeight: 900 }}>
        Detalle de recepción
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }} aria-label="Cerrar">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Stack sx={{ py: 4, alignItems: 'center' }}>
            <CircularProgress size={28} />
          </Stack>
        )}

        {!loading && <ErrorMessage message={error} />}

        {!loading && data && (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">Recepción</Typography>
                  <Typography variant="h6" fontWeight={900}>{data.codigo_recepcion}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Orden</Typography>
                  <Typography variant="body2" fontWeight={800}>{data.numero_orden || 'Manual'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Proveedor</Typography>
                  <Typography variant="body2" fontWeight={800}>{data.proveedor_nombre || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Almacén</Typography>
                  <Typography variant="body2" fontWeight={800}>{data.almacen_nombre || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Estado</Typography>
                  <Box><Chip size="small" label={statusLabel[data.estado] || data.estado} variant="outlined" color="success" /></Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Fecha</Typography>
                  <Typography variant="body2" fontWeight={800}>{formatDate(data.created_at)}</Typography>
                </Box>
              </Stack>
            </Paper>

            {(data.documento_referencia || data.observaciones) && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={900}>Documento / observaciones</Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.documento_referencia || 'Sin documento'} {data.observaciones ? `· ${data.observaciones}` : ''}
                </Typography>
              </Paper>
            )}

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto / variante</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Costo unit.</TableCell>
                    <TableCell align="right">Costo total</TableCell>
                    <TableCell>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.items || []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800}>{item.variante_label || item.producto_nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.codigoproducto || '-'}</Typography>
                      </TableCell>
                      <TableCell align="right">{item.cantidad_recibida}</TableCell>
                      <TableCell align="right">{formatCurrency(item.costo_unitario)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.costo_total)}</TableCell>
                      <TableCell>{item.observaciones || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
