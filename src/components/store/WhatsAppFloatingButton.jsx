import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Box, Fab, Tooltip } from '@mui/material';

import { useStoreSettings } from '../../hooks/store/useStoreSettings';
import { buildWhatsAppUrl } from '../../services/store/storeSettingsService';

export const WhatsAppFloatingButton = () => {
  const { settings } = useStoreSettings();
  const showButton = settings.metadata?.mostrar_whatsapp_flotante !== false;
  const phone = settings.whatsapp || settings.telefono_atencion;
  const whatsappUrl = buildWhatsAppUrl({
    phone,
    message: settings.metadata?.mensaje_whatsapp_default,
  });

  if (!showButton || !whatsappUrl) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        right: { xs: 16, md: 24 },
        bottom: { xs: 18, md: 24 },
        zIndex: (theme) => theme.zIndex.snackbar - 1,
      }}
    >
      <Tooltip title="Escribir por WhatsApp" placement="left" arrow>
        <Fab
          component="a"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Contactar por WhatsApp"
          sx={(theme) => ({
            bgcolor: theme.palette.success.light,
            color: theme.palette.success.contrastText,
            boxShadow: theme.palette.custom.shadows.lg,
            border: `1px solid ${theme.palette.success.dark}`,
            '&:hover': {
              bgcolor: theme.palette.success.dark,
              transform: 'translateY(-2px)',
            },
          })}
        >
          <WhatsAppIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};
