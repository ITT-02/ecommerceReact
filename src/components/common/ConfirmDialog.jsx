// Diálogo para confirmar acciones críticas.

import { useId } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
  Zoom,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';

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

const blurActiveElement = () => {
  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

export const ConfirmDialog = ({
  open,
  action = 'warning',
  title,
  message = '¿Deseas continuar?',
  onCancel,
  onConfirm,
  confirmText,
  cancelText = 'Cancelar',
  loading = false,
}) => {
  const theme = useTheme();
  const titleId = useId();
  const descriptionId = useId();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const custom = theme.palette.custom || {};
  const semantic = custom.semantic || {};
  const radius = custom.radius || {};
  const shadows = custom.shadows || {};
  const dialog = semantic.adminDialog || {};

  const fallbackBg =
    theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : theme.palette.common.white;

  const paperBg = dialog.paperBg || fallbackBg;
  const headerBg = dialog.headerBg || paperBg;
  const contentBg = dialog.contentBg || paperBg;
  const footerBg = dialog.footerBg || paperBg;

  const paperBorder = dialog.paperBorder || theme.palette.divider;
  const separator = dialog.separator || theme.palette.divider;

  const titleColor = dialog.titleColor || theme.palette.text.primary;

  const closeColor = dialog.closeColor || theme.palette.text.secondary;
  const closeHoverColor = dialog.closeHoverColor || theme.palette.text.primary;
  const closeHoverBg = dialog.closeHoverBg || alpha(theme.palette.text.primary, 0.055);

  const config = dialogActions[action] ?? dialogActions.warning;
  const ActionIcon = config.Icon;
  const actionColor = theme.palette[config.color] || theme.palette.warning;

  const handleClose = () => {
    if (loading) return;

    blurActiveElement();
    onCancel?.();
  };

  const handleConfirm = () => {
    if (loading) return;

    blurActiveElement();
    onConfirm?.();
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
        transition: {
          timeout: 160,
        },
        backdrop: {
          sx: {
            bgcolor:
              semantic.overlay ||
              alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.62 : 0.42),
            backdropFilter: 'blur(3px)',
          },
        },
        paper: {
          sx: {
            '&&': {
              overflow: 'hidden',
              borderRadius: isMobile ? 0 : radius.xs || 1.5,
              border: '1px solid',
              borderColor: paperBorder,
              bgcolor: paperBg,
              backgroundColor: paperBg,
              backgroundImage: 'none',
              boxShadow: dialog.shadow || shadows.xl || 24,
            },
          },
        },
      }}
    >
      <Box
        component="header"
        sx={{
          position: 'relative',
          px: { xs: 2.25, sm: 3 },
          py: { xs: 1.65, sm: 1.9 },
          pr: { xs: 6, sm: 6.25 },
          borderBottom: '1px solid',
          borderColor: separator,
          bgcolor: headerBg,
        }}
      >
        <Stack direction="row" spacing={1.35} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              color: actionColor.main,
              bgcolor: alpha(actionColor.main, 0.1),
              border: '1px solid',
              borderColor: alpha(actionColor.main, 0.2),

              '& .MuiSvgIcon-root': {
                fontSize: 19,
              },
            }}
          >
            <ActionIcon />
          </Box>

          <Typography
            id={titleId}
            variant="h6"
            noWrap
            sx={{
              minWidth: 0,
              color: titleColor,
              fontWeight: 700,
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              lineHeight: 1.2,
              letterSpacing: '0.015em',
            }}
          >
            {title || config.title}
          </Typography>
        </Stack>

        <Box
          component="button"
          type="button"
          aria-label="Cerrar"
          disabled={loading}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleClose}
          sx={{
            all: 'unset',
            position: 'absolute',
            top: { xs: 17, sm: 18 },
            right: { xs: 18, sm: 20 },
            width: 24,
            height: 24,
            borderRadius: '50%',
            cursor: loading ? 'default' : 'pointer',
            display: 'grid',
            placeItems: 'center',
            opacity: loading ? 0.45 : 1,
            transition: theme.transitions.create(
              ['background-color', 'transform', 'opacity'],
              {
                duration: theme.transitions.duration.shortest,
              }
            ),

            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              width: 12.5,
              height: 1.45,
              borderRadius: 1,
              bgcolor: closeColor,
              transition: theme.transitions.create('background-color', {
                duration: theme.transitions.duration.shortest,
              }),
            },

            '&::before': {
              transform: 'rotate(45deg)',
            },

            '&::after': {
              transform: 'rotate(-45deg)',
            },

            '&:hover': {
              bgcolor: closeHoverBg,
            },

            '&:hover::before, &:hover::after': {
              bgcolor: closeHoverColor,
            },

            '&:active': {
              transform: 'scale(0.94)',
            },

            '&:focus-visible': {
              outline: `2px solid ${alpha(theme.palette.primary.main, 0.32)}`,
              outlineOffset: 2,
            },

            '&:disabled': {
              pointerEvents: 'none',
            },
          }}
        />
      </Box>

      <DialogContent
        sx={{
          px: { xs: 2.25, sm: 3 },
          py: { xs: 2.5, sm: 3 },
          bgcolor: contentBg,
        }}
      >
        <Typography
          id={descriptionId}
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.65,
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.25, sm: 3 },
          py: { xs: 1.5, sm: 1.85 },
          borderTop: '1px solid',
          borderColor: separator,
          bgcolor: footerBg,

          '& > :not(style)': {
            m: 0,
          },
        }}
      >
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={1.25}
          sx={{
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: { xs: 'stretch', sm: 'center' },

            '& .MuiButton-root': {
              width: { xs: '100%', sm: 'auto' },
              minHeight: 40,
            },
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            color="secondary"
          >
            {cancelText}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant="contained"
            color={config.color}
            startIcon={<ActionIcon />}
          >
            {loading ? 'Procesando...' : confirmText || config.confirmText}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};