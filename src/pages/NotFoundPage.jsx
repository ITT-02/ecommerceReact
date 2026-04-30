// Página 404.

import { Button, Container, Typography, Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'scale(1.02)' } }}>
        <Box sx={{ mb: 4 }}>
          {/* SVG Animado 404 */}
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            style={{ margin: '0 auto 20px', display: 'block' }}
          >
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
            
            {/* Círculo de fondo girando */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="#ff6b6b" strokeWidth="2" opacity="0.3" className="spinning" />
            
            {/* Número 404 flotante */}
            <g className="floating">
              <text x="100" y="120" fontSize="80" fontWeight="bold" textAnchor="middle" fill="#ff6b6b">
                404
              </text>
            </g>
            
            {/* Pequeñas luces parpadeantes */}
            <circle cx="30" cy="50" r="5" fill="#4ecdc4" opacity="0.6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="170" cy="60" r="5" fill="#f9b233" opacity="0.6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="160" r="5" fill="#a8e6cf" opacity="0.6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>

          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'error.main' }}>
            ¡Oops!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Página no encontrada.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </Typography>
        </Box>
        <Button component={Link} to="/" variant="contained" size="large" sx={{ px: 4, py: 1.5, borderRadius: 2 }}>
          Volver al inicio
        </Button>
      </Paper>
    </Container>
  );
};