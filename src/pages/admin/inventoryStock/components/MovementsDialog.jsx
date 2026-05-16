// src/pages/admin/inventoryStock/components/MovementsDialog.jsx
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
import { useInventoryStockMovements } from '../../../../hooks/inventoryStock/useInventoryStockMovements';

export const MovementsDialog = ({ open, onClose, data }) => {
  // ✅ Usamos el hook existente en lugar de fetch manual
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Movimientos de inventario
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {data.producto_nombre} - {data.nombre_variante} ({data.almacen_nombre})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : movements.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
            No hay movimientos registrados para esta variante en este almacén
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell>Referencia</TableCell>
                  <TableCell>Anulado</TableCell>
                  <TableCell>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.map((mov) => (
                  <TableRow key={mov.id} hover>
                    <TableCell>{formatDate(mov.created_at)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={mov.tipo_movimiento} 
                        color={getTipoColor(mov.tipo_movimiento)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{mov.cantidad?.toLocaleString()}</TableCell>
                    <TableCell>{mov.referencia_tipo || '-'}</TableCell>
                    <TableCell>
                      {mov.anulado ? (
                        <Chip label="Anulado" color="error" size="small" />
                      ) : (
                        <Chip label="Activo" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{mov.notas || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};