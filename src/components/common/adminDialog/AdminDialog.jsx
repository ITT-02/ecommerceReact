import { useId } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Zoom,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Quita el foco activo antes de cerrar el modal.
 * Evita warnings de accesibilidad cuando MUI oculta el contenido con aria-hidden.
 */
const blurActiveElement = () => {
  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

/**
 * Modal base para el panel administrativo.
 *
 * Uso recomendado:
 * - Formularios de creación/edición.
 * - Detalles administrativos.
 * - Modales estándar del panel.
 *
 * No usar para confirmaciones críticas.
 * Para eso debe usarse ConfirmDialog(como eliminar).
 */
export const AdminDialog = ({
  open,
  onClose,
  title,
  icon,
  children,
  actions,
  onSubmit,
  loading = false,
  maxWidth = 'sm',
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
}) => {
  const theme = useTheme();
  const titleId = useId();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Tokens del theme.
   * Si algún token no existe, se usa fallback seguro de MUI.
   * Así el componente no se rompe si el theme cambia.
   */
  const custom = theme.palette.custom || {};
  const semantic = custom.semantic || {};
  const radius = custom.radius || {};
  const shadows = custom.shadows || {};
  const dialog = semantic.adminDialog || {};

  const fallbackBg =
    theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : theme.palette.common.white;

  /**
   * Colores principales del modal.
   * viene de theme.palette.custom.semantic.adminDialog.
   */
  const paperBg = dialog.paperBg || fallbackBg;
  const headerBg = dialog.headerBg || paperBg;
  const contentBg = dialog.contentBg || paperBg;
  const footerBg = dialog.footerBg || paperBg;

  const paperBorder = dialog.paperBorder || theme.palette.divider;
  const separator = dialog.separator || theme.palette.divider;

  const titleColor = dialog.titleColor || theme.palette.text.primary;

  const iconColor = dialog.iconColor || theme.palette.primary.main;
  const iconBg = dialog.iconBg || alpha(theme.palette.primary.main, 0.08);
  const iconBorder = dialog.iconBorder || alpha(theme.palette.primary.main, 0.16);

  const closeColor = dialog.closeColor || theme.palette.text.secondary;
  const closeHoverColor = dialog.closeHoverColor || theme.palette.text.primary;
  const closeHoverBg = dialog.closeHoverBg || alpha(theme.palette.text.primary, 0.055);

  /**
   * Control único de cierre.
   * Permite bloquear cierre por backdrop o Escape cuando sea necesario.
   */
  const handleClose = (event, reason) => {
    if (loading) return;
    if (reason === 'backdropClick' && disableBackdropClick) return;
    if (reason === 'escapeKeyDown' && disableEscapeKeyDown) return;

    blurActiveElement();
    onClose?.(event, reason);
  };

  /**
   * Contenido interno del modal.
   * Se mantiene separado para reutilizarlo igual con form o div.
   */
  const dialogContent = (
    <>
      <DialogTitle
        id={titleId}
        component="div"
        sx={{
          '&&': {
            position: 'relative',
            flexShrink: 0,
            px: { xs: 2.25, sm: 3 },
            py: { xs: 1.65, sm: 1.9 },
            pr: { xs: 6, sm: 6.25 },
            borderBottom: '1px solid',
            borderColor: separator,
            bgcolor: headerBg,
            backgroundColor: headerBg,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1.35}
          sx={{
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                color: iconColor,
                bgcolor: iconBg,
                border: '1px solid',
                borderColor: iconBorder,

                '& .MuiSvgIcon-root': {
                  fontSize: 19,
                },
              }}
            >
              {icon}
            </Box>
          )}

          <Typography
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
            {title}
          </Typography>
        </Stack>

        {/* Cierre ligero sin IconButton para evitar estilos globales pesados */}
        <Box
          component="button"
          type="button"
          aria-label="Cerrar"
          disabled={loading}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => handleClose(event, 'closeButton')}
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
      </DialogTitle>

      <DialogContent
        sx={{
          '&&': {
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: { xs: 2.25, sm: 3 },
            pt: { xs: 2.75, sm: 3 },
            pb: { xs: 2.5, sm: 3 },
            bgcolor: contentBg,
            backgroundColor: contentBg,
          },

          /**
           * Evita que formularios, grids o inputs largos rompan el ancho del modal.
           */
          '& > *': {
            minWidth: 0,
          },

          '& .MuiFormControl-root, & .MuiTextField-root': {
            minWidth: 0,
          },
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            '&&': {
              flexShrink: 0,
              px: { xs: 2.25, sm: 3 },
              py: { xs: 1.5, sm: 1.85 },
              borderTop: '1px solid',
              borderColor: separator,
              bgcolor: footerBg,
              backgroundColor: footerBg,
            },

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
            {actions}
          </Stack>
        </DialogActions>
      )}
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth={maxWidth}
      scroll="paper"
      disableRestoreFocus
      aria-labelledby={titleId}
      slots={{
        transition: Zoom,
      }}
      slotProps={{
        /**
         * Efecto elegante de entrada/salida.
         * Al cerrar se visualiza como un leve retroceso.
         */
        transition: {
          timeout: {
            enter: 170,
            exit: 140,
          },
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
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              overflow: 'hidden',
              maxHeight: isMobile
                ? '100dvh'
                : { xs: 'calc(100dvh - 16px)', sm: 'calc(100dvh - 48px)' },
              borderRadius: isMobile ? 0 : radius.xs || 1.5,
              border: '1px solid',
              borderColor: paperBorder,
              bgcolor: paperBg,
              backgroundColor: paperBg,
              backgroundImage: 'none',
              boxShadow: dialog.shadow || shadows.xl || 24,
              transformOrigin: 'center top',
            },
          },
        },
      }}
    >
      <Box
        component={onSubmit ? 'form' : 'div'}
        onSubmit={onSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minHeight: 0,
          bgcolor: paperBg,
          backgroundColor: paperBg,
        }}
      >
        {dialogContent}
      </Box>
    </Dialog>
  );
};