import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

// Hook personalizado
import { useInventoryStockMovements } from '../../../../hooks/inventory/useInventory/useInventoryStockMovements';

export const MovementsDialog = ({ open, onClose, data }) => {
  // Usamos el hook existente con los parámetros de habilitación nativos
  const { data: movementsData, isLoading: loading } = useInventoryStockMovements({
    varianteId: data?.variante_id,
    almacenId: data?.almacen_id,
    enabled: open && !!data?.variante_id && !!data?.almacen_id,
    pageNumber: 1,
    pageSize: 10,
  });

  const movements = movementsData?.items || [];

  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'entrada': return 'success';
      case 'salida': return 'error';
      case 'ajuste': return 'warning';
      case 'reserva': return 'info';
      default: return 'default';
    }
  };
  const handleClose = () => {
    document.activeElement?.blur();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
    >
      <DialogTitle sx={{ pr: 6 }}>
        Movimientos de inventario
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Cerrar diálogo de movimientos"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                PRODUCTO
              </Typography>

              <Typography variant="h6" fontWeight={900}>
                {data.producto_nombre || '-'}
              </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            <strong>Variante: </strong> {data.nombre_variante}  | <strong>Almacén:</strong> {data.almacen_nombre}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : movements.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
            No hay movimientos registrados para esta variante en este almacén
          </Typography>
        ) : (
          <TableContainer 
            component={Paper} 
            variant="outlined"
            sx={{ borderColor: 'divider' }}
          >
            <Table size="small" aria-label="Tabla de movimientos de inventario">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell>Referencia</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.map((mov) => (
                  <TableRow key={mov.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(mov.created_at)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={mov.tipo_movimiento?.toUpperCase()} 
                        color={getTipoColor(mov.tipo_movimiento)}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {mov.cantidad?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell>{mov.referencia_tipo || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={mov.anulado ? "Anulado" : "Activo"} 
                        color={mov.anulado ? "error" : "success"} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                      <TableCell
                        sx={{
                          minWidth: { xs: 220, sm: 260 },
                          maxWidth: 320,
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        {mov.notas || '-'}
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          variant="contained"
          color="primary"
          sx={{
            textTransform: 'none',
            fontWeight: 700,
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};