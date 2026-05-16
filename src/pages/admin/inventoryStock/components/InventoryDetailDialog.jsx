// src/pages/admin/inventoryStock/components/InventoryDetailDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  IconButton,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export const InventoryDetailDialog = ({ 
  open, 
  onClose, 
  data, 
  onViewMovements, 
  onAdjustStock 
}) => {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Detalle de inventario
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Producto</Typography>
              <Typography variant="body1">{data.producto_nombre}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Variante</Typography>
              <Typography variant="body1">{data.nombre_variante}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Atributos</Typography>
              <Typography variant="body1">{data.atributos_resumen || '-'}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Almacén</Typography>
              <Typography variant="body1">{data.almacen_nombre}</Typography>
            </Grid>
            
            <Grid item xs={4}>
              <Typography variant="subtitle2" color="text.secondary">Disponible</Typography>
              <Typography variant="body1">{data.cantidad_disponible?.toLocaleString() || '0'}</Typography>
            </Grid>
            
            <Grid item xs={4}>
              <Typography variant="subtitle2" color="text.secondary">Reservado</Typography>
              <Typography variant="body1">{data.cantidad_reservada?.toLocaleString() || '0'}</Typography>
            </Grid>
            
            <Grid item xs={4}>
              <Typography variant="subtitle2" color="text.secondary">Stock total</Typography>
              <Typography variant="body1">{data.stock_total?.toLocaleString() || '0'}</Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Stock mínimo</Typography>
              <Typography variant="body1">{data.stock_minimo?.toLocaleString() || '-'}</Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
              <Chip 
                label={data.stock_bajo ? 'Bajo' : 'Correcto'}
                color={data.stock_bajo ? 'error' : 'success'}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button onClick={() => onViewMovements(data)} color="secondary">
          Ver movimientos
        </Button>
        <Button onClick={() => onAdjustStock(data)} variant="contained" color="primary">
          Ajustar stock
        </Button>
      </DialogActions>
    </Dialog>
  );
};