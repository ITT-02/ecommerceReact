import { Box } from '@mui/material';

import aliqoraLogo from '../../../assets/brand/aliqora-logo.png';
import { useStoreSettings } from '../../../hooks/store/useStoreSettings';

export const StoreBrandLogo = () => {
  const { settings } = useStoreSettings();
  const logoSrc = settings.logo_url || aliqoraLogo;

  return (
    <Box
      component="img"
      src={logoSrc}
      alt={settings.nombre_tienda || 'Aliqora Empaques'}
      sx={{
        display: 'block',
        width: 'auto',
        height: {
          xs: 42,
          sm: 48,
          md: 54,
        },
        maxWidth: {
          xs: 150,
          sm: 180,
          md: 210,
        },
        objectFit: 'contain',
      }}
    />
  );
};
