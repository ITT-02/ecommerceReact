import React from 'react'
import { alpha } from '@mui/material/styles'
import {
  Box,
  Container,
  Typography,
} from '@mui/material'

const steps = [
  {
    number: 1,
    title: 'Completa el registro',
    description: 'Llena el formulario con tus datos de negocio. Es gratuito y toma menos de 3 minutos.',
  },
  {
    number: 2,
    title: 'Verificamos tu cuenta',
    description: 'Nuestro equipo revisará tu solicitud en menos de 24 horas hábiles y te contactará por WhatsApp.',
  },
  {
    number: 3,
    title: '¡Empieza a pedir!',
    description: 'Accede al catálogo completo con precios mayoristas y realiza tu primer pedido.',
  },
]

const Steps = ({ number, title, description, isLast }) => {
  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        px: { xs: 1, sm: 2 },
        '&::after': {
          content: isLast ? 'none' : '""',
          position: 'absolute',
          top: 34,
          left: 'calc(50% + 44px)',
          width: 'calc(100% - 88px)',
          borderTop: `1px solid ${alpha(theme.palette.primary.dark, 0.22)}`,
          display: { xs: 'none', md: 'block' },
        },
      })}
    >
      <Box
        sx={(theme) => ({
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          placeItems: 'center',
          width: { xs: 56, md: 68 },
          height: { xs: 56, md: 68 },
          mb: 2.5,
          borderRadius: '50%',
          color: 'primary.contrastText',
          bgcolor: 'success.dark',
          border: `1px solid ${theme.palette.primary.main}`,
          boxShadow: `0 14px 28px ${alpha(theme.palette.success.dark, 0.18)}`,
        })}
      >
        <Typography component="span" sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 700 }}>
          {number}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 340 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            mb: 1,
            color: 'text.primary',
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.75,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  )
}

export const ComponentSteps = () => {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: 'background.paper',
        px: { xs: 2, sm: 3, md: 6 },
        py: { xs: 7, md: 11 },
      }}
    >
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
        <Box sx={{ mx: 'auto', mb: { xs: 5, md: 7 }, maxWidth: 760 }}>
          <Typography
            component="p"
            sx={{
              mb: 1.75,
              color: 'primary.dark',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.26em',
              lineHeight: 1.2,
              textTransform: 'uppercase',
            }}
          >
            Cómo funciona
          </Typography>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              color: 'text.primary',
              fontWeight: 500,
              fontSize: { xs: 32, sm: 36, md: 42 },
              lineHeight: 1.1,
            }}
          >
            Tres pasos para empezar
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            gap: { xs: 5, md: 3 },
            alignItems: 'start',
          }}
        >
          {steps.map((step, index) => (
            <Steps
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default ComponentSteps
