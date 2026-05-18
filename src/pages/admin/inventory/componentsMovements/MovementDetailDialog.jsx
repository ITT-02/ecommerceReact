import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Grid, Divider, Chip, Box, useTheme, alpha
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

export const MovementDetailDialog = ({ open, movimiento, onClose }) => {
  const theme = useTheme();

  if (!movimiento) return null;

  // NUEVO DISEÑO PARA FILAS: Rejilla perfecta (120px para la etiqueta, el resto para el valor)
  const DetailRow = ({ label, value }) => (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: '120px 1fr', 
      gap: 2, 
      alignItems: 'center', 
      mb: 1.5,
      p: 0.5,
      borderRadius: 1,
      '&:hover': { bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.black, 0.02) }
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
        {value || '-'}
      </Typography>
    </Box>
  );

    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            maxWidth: '800px !important' // Ajustamos el ancho ideal
          }
        }}
      >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Detalle del Movimiento</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 4 } }}>
        
        {movimiento.anulado && (
          <Box sx={{ mb: 4, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${alpha(theme.palette.error.main, 0.3)}` }}>
             {/* Usamos align="center" y pasamos mb y fontWeight adentro de sx */}
            <Typography variant="subtitle1" color="error.main" align="center" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              ESTE MOVIMIENTO FUE ANULADO
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Motivo: <strong>{movimiento.motivo_anulacion || 'No especificado'}</strong>
            </Typography>
          </Box>
        )}

        <Grid container spacing={5}>
          {/* COLUMNA 1: BASE */}
          <Grid xs={12} md={6} sx={{ alignSelf: 'stretch' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <InfoOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  Información Base
                </Typography>
             </Box>
             
             <DetailRow label="ID Movimiento" value={movimiento.id?.toUpperCase()?.slice(0, 13) + '...'} />
             
             <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center', mb: 1.5, p: 0.5 }}>
               <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Tipo y Acción</Typography>
               <Box sx={{ display: 'flex', gap: 1 }}>
                 <Chip size="small" label={movimiento.tipo_movimiento} color="default" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} />
                 <Chip size="small" label={movimiento.referencia_tipo?.replace('_', ' ')} variant="outlined" sx={{ textTransform: 'capitalize' }} />
               </Box>
             </Box>

             <DetailRow label="Cantidad neta" value={movimiento.cantidad} />
          </Grid>

          {/* COLUMNA 2: ITEM */}
          <Grid xs={12} md={6} sx={{ alignSelf: 'stretch' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Inventory2OutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  Datos del Item Afectado
                </Typography>
             </Box>
             
             <DetailRow label="Producto" value={movimiento.producto_nombre} />
             <DetailRow label="Variante" value={movimiento.nombre_variante} />
             <DetailRow label="Almacén" value={movimiento.almacen_nombre} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* MARCO INFERIOR DE STOCKS */}
        <Box sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02), 
            p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 4,
            border: `1px solid ${theme.palette.divider}`
        }}> 
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SwapVertIcon color="text.secondary" />
              <Typography variant="subtitle1" fontWeight="bold">Historial de Stock Interno (Auditoría)</Typography>
           </Box>

           <Grid container spacing={3}>
              <Grid xs={12} sm={6} sx={{ alignSelf: 'stretch' }}>
                <Typography variant="overline" color="text.disabled" sx={{ display: 'block', mb: 1, pl: 0.5 }}>Stock Disponible</Typography>
                <DetailRow label="Antes del mov." value={movimiento.stock_disponible_antes} />
                <DetailRow label="Después del mov." value={movimiento.stock_disponible_despues} />
              </Grid>
              <Grid xs={12} sm={6} sx={{ alignSelf: 'stretch' }}>
                <Typography variant="overline" color="text.disabled" sx={{ display: 'block', mb: 1, pl: 0.5 }}>Stock Reservado</Typography>
                <DetailRow label="Antes del mov." value={movimiento.stock_reservado_antes} />
                <DetailRow label="Después del mov." value={movimiento.stock_reservado_despues} />
              </Grid>
           </Grid>
        </Box>

        {/* NOTAS */}
        <Box>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <FormatQuoteIcon color="text.secondary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight="bold">Retroalimentación / Notas del Operador</Typography>
           </Box>
           <Typography variant="body2" color="text.primary" sx={{ 
               p: 2, 
               bgcolor: theme.palette.background.paper,
               border: '1px solid', 
               borderColor: 'divider',  
               borderRadius: 2,
               fontStyle: movimiento.notas ? 'normal' : 'italic',
               opacity: movimiento.notas ? 1 : 0.6
           }}>
             {movimiento.notas || 'Ninguna observación especial brindada durante el registro de esta operación.'}
           </Typography>
        </Box>

      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: theme.palette.background.default }}>
        <Button onClick={onClose} variant="contained" disableElevation autoFocus>Cerrar Vista</Button>
      </DialogActions>
    </Dialog>
  );
};