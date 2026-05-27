import React from 'react';
import { 
  Dialog, DialogContent, IconButton, Typography, Box, 
  Paper, Chip, useTheme, alpha 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/VerifiedUser';
import NatureIcon from '@mui/icons-material/Nature'; 
import SpeedIcon from '@mui/icons-material/Speed';

// ─── IMPORTACIÓN DE IMÁGENES CORREGIDAS ──────────────────────────────────────
import heroImg from '../../assets/images/about/hero-bg.png';
import imgMision1 from '../../assets/images/about/cardboard.png'; 
import imgMision2 from '../../assets/images/about/director1.png';

export const AboutUsModal = ({ open, onClose }) => {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      scroll="paper"
      // Se utiliza sx nativo en el dialog para redondear el paper interno
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3, 
          overflow: 'hidden',
          backgroundColor: 'background.default' 
        }
      }}
    >
      {/* ─── BOTÓN DE CERRAR ─── */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          color: '#fff',
          zIndex: 10,
          bgcolor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>
        
        {/* ─── HERO SECTION ─── */}
        <Box sx={{ 
          position: 'relative', 
          height: { xs: 350, md: 500 },
          display: 'flex', 
          alignItems: 'center',
          backgroundImage: `url("${heroImg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          {/* Malla oscura más fuerte para que cualquier imagen resalte las letras blancas */}
          <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />
          
          <Box sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 8 }, maxWidth: '800px' }}>
            <Chip 
              label="Desde 1994" 
              color="primary" 
              sx={{ mb: 2, fontWeight: 700, px: 1 }} 
            />
            {/* Sombras forzadas y forzado de color exacto (#ffffff) */}
            <Typography 
              variant="h2" 
              fontWeight={800} 
              sx={{ 
                color: '#ffffff',
                textShadow: '0px 2px 10px rgba(0,0,0,0.6)', 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 1
              }}
            >
              Nuestra Historia
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#f5f5f5',
                fontWeight: 400, 
                maxWidth: '600px', 
                lineHeight: 1.6,
                textShadow: '0px 1px 6px rgba(0,0,0,0.6)' 
              }}
            >
              Nacimos de la convicción de que cada envío cuenta una historia. Lo que comenzó como un pequeño taller en la ciudad, se ha transformado en el estándar de oro de la logística estructural.
            </Typography>
          </Box>
        </Box>

        {/* ─── MISIÓN Y VISIÓN ─── */}
        <Box sx={{ py: 10, px: { xs: 3, md: 8 }, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 8, alignItems: 'center' }}>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Box sx={{ borderLeft: `4px solid ${theme.palette.primary.main}`, pl: 4 }}>
                <Typography variant="h4" color="primary.main" fontWeight={800} gutterBottom>
                  Nuestra Misión
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                  Proveer soluciones de embalaje y transporte que garanticen la integridad absoluta de cada objeto, fusionando ingeniería de materiales con una logística impecable y respetuosa con el medio ambiente.
                </Typography>
              </Box>
              <Box sx={{ borderLeft: `4px solid ${theme.palette.primary.main}`, pl: 4 }}>
                <Typography variant="h4" color="primary.main" fontWeight={800} gutterBottom>
                  Nuestra Visión
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                  Ser el referente global en logística táctil y consciente, donde la eficiencia y el refinamiento estético se encuentran para redefinir el arte de entregar.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box 
                component="img" 
                src={imgMision1} 
                sx={{ width: '100%', height: '100%', minHeight: 200, objectFit: 'cover', borderRadius: 4, boxShadow: 3 }}
              />
              <Box 
                component="img" 
                src={imgMision2} 
                sx={{ width: '100%', height: '100%', minHeight: 200, objectFit: 'cover', borderRadius: 4, boxShadow: 3, mt: 4 }}
              />
            </Box>
          </Box>
        </Box>

        {/* ─── VALORES ─── */}
        <Box sx={{ py: 10, px: { xs: 3, md: 8 }, bgcolor: 'background.default' }}>
          <Box sx={{ textAlign: 'center', mb: 8, maxWidth: '700px', mx: 'auto' }}>
            <Typography variant="h3" color="primary.main" fontWeight={800} gutterBottom>
              Valores que nos Definen
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              La excelencia no es un acto, es un hábito que aplicamos en cada centímetro cuadrado de nuestra ruta.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {[
              { title: 'Calidad Superior', icon: <VerifiedIcon sx={{ fontSize: 40 }}/>, desc: 'Utilizamos tecnología de punta para asegurar nuestra mejor presentación.' },
              { title: 'Sostenibilidad', icon: <NatureIcon sx={{ fontSize: 40 }}/>, desc: 'Nuestras cajas son 100% reciclables. Creemos en un mundo verde.' },
              { title: 'Eficiencia Táctica', icon: <SpeedIcon sx={{ fontSize: 40 }}/>, desc: 'Optimizado mediante algoritmos para reducir tiempos de espera.' }
            ].map((valor, i) => (
              <Paper key={i} elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', transition: '0.3s', '&:hover': { boxShadow: 4, transform: 'translateY(-5px)' } }}>
                <Box sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  {valor.icon}
                </Box>
                <Typography variant="h5" fontWeight={800} color="text.primary" mb={2}>{valor.title}</Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>{valor.desc}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* ─── COMPROMISO ─── */}
        <Box sx={{ 
          py: 12, 
          px: { xs: 3, md: 8 }, 
          bgcolor: theme.palette.mode === 'light' ? '#fcfcfc' : 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center'
        }}>
          {/* Pequeña línea decorativa superior */}
          <Box sx={{ width: 60, height: 4, bgcolor: 'primary.main', mx: 'auto', mb: 6, borderRadius: 2 }} />

          <Typography 
            variant="h3" 
            color="primary.main" 
            fontWeight={800} 
            fontStyle="italic"
            sx={{ maxWidth: '900px', mx: 'auto', lineHeight: 1.4, mb: 4 }}
          >
            "Nuestro compromiso es con la confianza que depositas en cada caja que cerramos."
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            fontWeight={700}
          >
            Compromiso con la Calidad BoxShip
          </Typography>
        </Box>

      </DialogContent>
    </Dialog>
  );
};