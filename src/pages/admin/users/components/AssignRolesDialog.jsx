import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';

import { useRoleOptions } from '../../../../hooks/users/useAdminUsers';

export const AssignRolesDialog = ({ open, usuario, isSaving, onClose, onConfirm }) => {
  const theme = useTheme();
  const { data: roleOptions = [], isLoading: isLoadingRoles } = useRoleOptions();
  const [selectedCodigos, setSelectedCodigos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && usuario) {
      const current = (usuario.roles || []).map((r) => r.codigo);
      setSelectedCodigos(current);
      setError('');
    }
  }, [open, usuario]);

  if (!usuario) return null;

  const toggle = (codigo) => {
    setSelectedCodigos((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onConfirm({ usuarioId: usuario.id, roles: selectedCodigos });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al asignar roles.');
    }
  };

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} maxWidth="xs" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800 }}>Asignar Roles</DialogTitle>

        <DialogContent dividers>
          {error && (
            <Typography color="error" variant="body2" fontWeight={600} sx={{ mb: 2 }}>
              • {error}
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            Selecciona los roles para <strong>{usuario.nombre_completo || usuario.email}</strong>.
            Los roles no seleccionados serán removidos.
          </Typography>

          {isLoadingRoles ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {roleOptions.map((rol, index) => (
                <Box key={rol.codigo}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedCodigos.includes(rol.codigo)}
                        onChange={() => toggle(rol.codigo)}
                        disabled={isSaving}
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ py: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                          {rol.nombre}
                        </Typography>
                        {rol.descripcion && (
                          <Typography variant="caption" color="text.secondary">
                            {rol.descripcion}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ mx: 0, py: 0.5 }}
                  />
                  {index < roleOptions.length - 1 && (
                    <Divider sx={{ borderStyle: 'dashed', opacity: 0.5 }} />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSaving} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving || isLoadingRoles} disableElevation>
            {isSaving ? 'Guardando...' : 'Guardar roles'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
