import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import { AdminDialog } from '../../../../components/common/adminDialog/AdminDialog';

export const InventoryAdjustDialog = ({
  open,
  onClose,
  data,
  onConfirm,
  loading,
}) => {
  const [formData, setFormData] = useState({
    nuevoStockFinal: 0,
    referenciaTipo: 'conteo_fisico',
    notas: '',
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (data && open) {
      setFormData({
        nuevoStockFinal: data.cantidad_disponible || 0,
        referenciaTipo: 'conteo_fisico',
        notas: '',
      });
      setError(null);
    }
  }, [data, open]);

  if (!data) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (formData.nuevoStockFinal < 0) {
      setError('El stock final no puede ser negativo');
      return;
    }

    setError(null);

    try {
      await onConfirm(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al ajustar el stock');
    }
  };

  const actions = (
    <>
      <Button
        onClick={onClose}
        disabled={loading}
        color="inherit"
      >
        Cancelar
      </Button>

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        startIcon={
          loading ? (
            <CircularProgress
              size={16}
              color="inherit"
            />
          ) : null
        }
      >
        {loading ? 'Guardando…' : 'Guardar'}
      </Button>
    </>
  );

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title="Ajustar inventario"
      icon={<TuneRoundedIcon />}
      maxWidth="sm"
      loading={loading}
      actions={actions}
      onSubmit={handleSubmit}
    >
      {/* Resumen del producto */}
      <Box
        sx={{
          mb: 2.5,
          p: 2,
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={800}
        >
          PRODUCTO
        </Typography>

        <Typography
          variant="subtitle1"
          fontWeight={900}
        >
          {data.producto_nombre || '-'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          <strong>Variante:</strong> {data.nombre_variante}
          {' | '}
          <strong>Almacén:</strong> {data.almacen_nombre}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5 }}
        >
          {error}
        </Alert>
      )}

      {/* Ya NO es un form porque AdminDialog ya crea el form */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        <TextField
          label="Nuevo stock final"
          type="number"
          value={formData.nuevoStockFinal}
          onChange={(e) =>
            setFormData({
              ...formData,
              nuevoStockFinal:
                parseInt(e.target.value, 10) || 0,
            })
          }
          fullWidth
          helperText="Ingrese el stock físico final después del ajuste"
          slotProps={{
            input: {
              min: 0,
            },
          }}
          disabled={loading}
        />

        <FormControl fullWidth>
          <InputLabel id="adjust-reason-label">
            Motivo / Referencia
          </InputLabel>

          <Select
            labelId="adjust-reason-label"
            value={formData.referenciaTipo}
            onChange={(e) =>
              setFormData({
                ...formData,
                referenciaTipo: e.target.value,
              })
            }
            label="Motivo / Referencia"
            disabled={loading}
          >
            <MenuItem value="conteo_fisico">
              Conteo físico
            </MenuItem>

            <MenuItem value="ajuste_manual">
              Ajuste manual
            </MenuItem>

            <MenuItem value="correccion_stock">
              Corrección de stock
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Notas"
          multiline
          rows={3}
          value={formData.notas}
          onChange={(e) =>
            setFormData({
              ...formData,
              notas: e.target.value,
            })
          }
          fullWidth
          disabled={loading}
        />
      </Box>
    </AdminDialog>
  );
};