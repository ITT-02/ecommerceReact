// Página 404.

import { Button, Container, Typography, Box, Paper, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const info = theme.palette.info.main;

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ margin: '0 auto 20px', display: 'block' }}>
            <defs>
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-20px); }
                }
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                .floating { animation: float 3s ease-in-out infinite; }
                .spinning { animation: spin 20s linear infinite; }
              `}</style>
            </defs>

            <circle cx="100" cy="100" r="90" fill="none" stroke={primary} strokeWidth="2" opacity="0.3" className="spinning" />

            <g className="floating">
              <text x="100" y="120" fontSize="80" fontWeight="bold" textAnchor="middle" fill={primary}>
                404
              </text>
            </g>

            <circle cx="30" cy="50" r="5" fill={secondary} opacity="0.6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="170" cy="60" r="5" fill={info} opacity="0.6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="160" r="5" fill={theme.palette.success.main} opacity="0.6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>

          <Typography variant="h3" sx={{ mb: 1 }}>
            ¡Oops!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Página no encontrada.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </Typography>
        </Box>
        <Button component={Link} to="/" variant="contained" size="large">
          Volver al inicio
        </Button>
      </Paper>
    </Container>
  );
};
