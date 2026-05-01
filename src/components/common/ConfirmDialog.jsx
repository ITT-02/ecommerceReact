//Componente para confirmar acciones críticas del sistema.
// Usar solo cuando la acción pueda eliminar datos, cambiar estados importantes

import { useId } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Zoom,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';

/**
 * Configuración interna de acciones del diálogo.
 *
 * Cada acción define:
 * - color: color semántico del theme de MUI.
 * - Icon: ícono que representa visualmente la acción.
 * - title: título por defecto si no se envía uno personalizado.
 * - confirmText: texto por defecto del botón principal.
 *
 * Este objeto permite reutilizar el mismo componente para distintos casos
 */
const dialogActions = {
  delete: {
    color: 'error',
    Icon: DeleteOutlineRoundedIcon,
    title: 'Eliminar registro',
    confirmText: 'Eliminar',
  },
  deactivate: {
    color: 'warning',
    Icon: BlockRoundedIcon,
    title: 'Desactivar registro',
    confirmText: 'Desactivar',
  },
  discard: {
    color: 'warning',
    Icon: UndoRoundedIcon,
    title: 'Descartar cambios',
    confirmText: 'Descartar',
  },
  approve: {
    color: 'success',
    Icon: CheckCircleOutlineRoundedIcon,
    title: 'Aprobar registro',
    confirmText: 'Aprobar',
  },
  warning: {
    color: 'warning',
    Icon: WarningAmberRoundedIcon,
    title: 'Confirmar acción',
    confirmText: 'Continuar',
  },
};

export const ConfirmDialog = ({
  open,
  action = 'warning',
  title,
  message = '¿Estás seguro de continuar?',
  onCancel,
  onConfirm,
  confirmText,
  cancelText = 'Cancelar',
  loading = false,
}) => {

  const theme = useTheme();

  /**
   * IDs únicos para conectar el título y el mensaje con el Dialog.
   * Esto mejora la accesibilidad para lectores de pantalla.
   */
  const titleId = useId();
  const descriptionId = useId();

  /**
   * Obtiene la configuración visual según la acción recibida.
   * Si la acción no existe, se usa "warning" como valor seguro por defecto.
   */
  const config = dialogActions[action] ?? dialogActions.warning;
  const ActionIcon = config.Icon;
  const actionColor = theme.palette[config.color];

  /**
   * Cierra el diálogo solo si no está en estado de carga.
   *
   * El blur evita que el foco quede retenido en un botón al cerrar el modal,
   * lo cual puede generar warnings relacionados con aria-hidden.
   */
  const handleClose = () => {
    if (loading) return;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    onCancel?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      disableRestoreFocus
      slots={{
        transition: Zoom,
      }}
      slotProps={{
        /**
         * Transición de entrada/salida del modal.
         * Se mantiene breve para que la interacción se sienta rápida.
         */
        transition: {
          timeout: 160,
        },

        /**
         * Fondo del modal.
         * Usa el color negro del theme y alpha para no colocar colores sueltos.
         */
        backdrop: {
          sx: {
            bgcolor: alpha(theme.palette.common.black, 0.42),
            backdropFilter: 'blur(3px)',
          },
        },

        /**
         * Contenedor visual del diálogo.
         * Se apoya en el theme para fondo, borde, sombra y compatibilidad dark/light.
         */
        paper: {
          sx: {
            position: 'relative',
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[5],
            backgroundImage: 'none',
          },
        },
      }}
    >
      {/* Botón de cierre ubicado en la esquina superior derecha del modal. */}
      <IconButton
        onClick={handleClose}
        disabled={loading}
        size="small"
        aria-label="Cerrar diálogo"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          color: 'text.secondary',
        }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>

      {/* Contenido principal del diálogo: ícono, título y mensaje. */}
      <DialogContent sx={{ pr: 6 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          {/* Ícono semántico según la acción del diálogo. */}
          <Box
            sx={{
              width: 40,
              height: 40,
              minWidth: 40,
              display: 'grid',
              placeItems: 'center',
              color: actionColor.main,
              bgcolor: alpha(actionColor.main, 0.1),
              border: `1px solid ${alpha(actionColor.main, 0.18)}`,
              borderRadius: 1.5,
            }}
          >
            <ActionIcon fontSize="small" />
          </Box>

          {/* Bloque textual del diálogo. */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <DialogTitle id={titleId} sx={{ p: 0, mb: 0.5 }}>
              {title || config.title}
            </DialogTitle>

            <DialogContentText id={descriptionId}>
              {message}
            </DialogContentText>
          </Box>
        </Stack>
      </DialogContent>

      {/* Acciones del diálogo: cancelar y confirmar. */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          autoFocus
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          color="secondary"
          fullWidth
        >
          {cancelText}
        </Button>

        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={config.color}
          startIcon={<ActionIcon />}
          fullWidth
        >
          {loading ? 'Procesando...' : confirmText || config.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
