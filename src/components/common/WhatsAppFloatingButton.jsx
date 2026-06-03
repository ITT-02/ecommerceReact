import { Tooltip } from '@mui/material';
import { Box } from '@mui/material';

const WHATSAPP_PHONE = '51999999999';
const WHATSAPP_MESSAGE = 'Hola! Vengo desde la web de Aliqora';

export const WhatsAppFloatingButton = () => {
  const href = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <Tooltip title="Chatea con nosotros" placement="left" arrow>
      <Box
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatea con nosotros por WhatsApp"
        sx={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 1300,
          width: 52,
          height: 52,
          borderRadius: '14px',
          bgcolor: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          boxShadow: '0 2px 10px rgba(37,211,102,0.45)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 6px 18px rgba(37,211,102,0.55)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="28"
          height="28"
          fill="white"
        >
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.492.655 4.835 1.798 6.865L2 30l7.331-1.763A13.926 13.926 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 2c6.627 0 12 5.373 12 12S22.627 28 16 28c-2.19 0-4.235-.588-6-1.612l-.414-.247-4.35 1.047 1.083-4.218-.27-.43A11.943 11.943 0 0 1 4 16C4 9.373 9.373 4 16 4zm-3.64 6.5c-.2 0-.524.075-.8.375-.274.3-1.048 1.025-1.048 2.5s1.073 2.9 1.223 3.1c.15.2 2.097 3.274 5.147 4.574 2.55 1.1 3.072.882 3.625.826.55-.05 1.774-.725 2.024-1.424.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35-.3-.15-1.774-.874-2.05-.974-.274-.1-.474-.15-.674.15-.2.3-.773.974-.948 1.174-.175.2-.35.225-.65.075-.3-.15-1.265-.466-2.41-1.49-.89-.796-1.49-1.778-1.665-2.078-.175-.3-.018-.462.131-.61.134-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.665-1.625-.916-2.225-.24-.584-.487-.5-.674-.508l-.573-.01z" />
        </svg>
      </Box>
    </Tooltip>
  );
};
