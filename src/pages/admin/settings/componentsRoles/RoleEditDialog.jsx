import { useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

import { backendMsg } from './roleHelpers';

export const RoleEditDialog = ({ open, role, onClose, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && role) {
      setNombre(role.nombre || '');
      setDescripcion(role.descripcion || '');
      setTouched(false);
      setSaving(false);
      setError(null);
    }
  }, [open, role]);

  if (!role) return null;

  const isSuperAdmin = role.codigo === 'super_admin';
  const allDisabled = isSuperAdmin || !role.puede_editar;
  const nameInvalid = !nombre.trim();

  const handleSave = async () => {
    setTouched(true);

    if (nameInvalid) return;

    setSaving(true);
    setError(null);

    try {
      await onSave({
        id: role.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
      });

      onClose();
    } catch (e) {
      setError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <EditOutlinedIcon fontSize="small" />

        <Box sx={{ flex: 1 }}>
          Editar rol

          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            sx={{
              ml: 1,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            {role.codigo}
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} disabled={saving}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {saving && <LinearProgress />}

      <DialogContent dividers sx={{ p: 3 }}>
        {isSuperAdmin && (
          <Alert
            severity="warning"
            icon={<GppGoodOutlinedIcon fontSize="inherit" />}
            sx={{ mb: 2 }}
          >
            <AlertTitle>Rol protegido</AlertTitle>
            <b>super_admin</b> es un rol del sistema y no puede modificarse desde el panel.
          </Alert>
        )}

        {!isSuperAdmin && !role.puede_editar && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No tienes permisos para editar este rol en este momento.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error al guardar</AlertTitle>
            {backendMsg(error)}
          </Alert>
        )}

        <Stack spacing={2.5}>
          <TextField
            fullWidth
            size="small"
            label="Código (no editable)"
            value={role.codigo}
            disabled
            helperText="El código es inmutable y no se envía al backend."
            slotProps={{
              input: {
                sx: {
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                },
              },
            }}
          />

          <TextField
            fullWidth
            size="small"
            required
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={allDisabled}
            error={touched && nameInvalid}
            helperText={touched && nameInvalid ? 'El nombre es obligatorio' : ''}
          />

          <TextField
            fullWidth
            size="small"
            label="Descripción"
            multiline
            minRows={3}
            maxRows={6}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={allDisabled}
            helperText="Opcional. Si lo dejas vacío se enviará null."
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancelar
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={allDisabled || saving}
          startIcon={
            saving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SaveOutlinedIcon fontSize="small" />
            )
          }
          sx={{ minWidth: 160 }}
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};