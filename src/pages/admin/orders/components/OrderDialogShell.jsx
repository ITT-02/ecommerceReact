import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { preventButtonFocus } from '../utils/dialogFocusUtils';

export const OrderDialogShell = ({
  open,
  title,
  subtitle,
  children,
  actions,
  onClose,
  onSubmit,
  loading = false,
  maxWidth = 'md',
  contentSx,
}) => {
  const theme = useTheme();

  const content = (
    <>
      <DialogTitle
        sx={{
          flexShrink: 0,
          p: { xs: 2, sm: 2.5 },
          pr: { xs: 6, sm: 7 },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.primary.main, 0.035),
        }}
      >
        <Stack spacing={0.35}>
          <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.25 }}>
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>

        <IconButton
          onMouseDown={preventButtonFocus}
          onClick={onClose}
          disabled={loading}
          size="small"
          aria-label="Cerrar"
          sx={{
            position: 'absolute',
            top: { xs: 12, sm: 16 },
            right: { xs: 12, sm: 16 },
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers={false}
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          p: { xs: 2, sm: 2.5 },
          bgcolor: 'background.default',
          ...contentSx,
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            flexShrink: 0,
            position: { xs: 'sticky', sm: 'static' },
            bottom: 0,
            zIndex: 2,
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 1 },
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: {
              xs: `0 -10px 24px ${alpha(theme.palette.common.black, 0.08)}`,
              sm: 'none',
            },
            '& > :not(style)': {
              m: 0,
              width: { xs: '100%', sm: 'auto' },
            },
            '& .MuiButton-root': {
              minHeight: { xs: 42, sm: 38 },
            },
          }}
        >
          {actions}
        </DialogActions>
      )}
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth={maxWidth}
      scroll="paper"
      disableRestoreFocus
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 2.5, sm: 3 },
            overflow: 'hidden',
            maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 48px)' },
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {onSubmit ? (
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {content}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {content}
        </Box>
      )}
    </Dialog>
  );
};
