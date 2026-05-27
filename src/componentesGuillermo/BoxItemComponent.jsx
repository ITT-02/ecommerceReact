import React from 'react';

import {
    Typography,
    Box,
    Card,
    CardContent
} from '@mui/material';

import '@fontsource/cinzel';
import '@fontsource/montserrat';

export const BoxItemComponent = ({icon, title, description}) => {
    return (
        <>
            <Card
                variant="outlined"
                sx={{
                    height: '100%',
                    width: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                    // Fondo verde muy oscuro sutil, adaptado a tus imágenes
                    bgcolor: '#04241D', 
                    // Usamos el contorno sutil característico de tus tarjetas
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    // Accedemos a tu token de radio lg (16px) o xl (20px) para las esquinas suavizadas
                    borderRadius: (theme) => `${theme.palette.custom?.radius?.lg || 16}px`,
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                    transform: 'translateY(-4px)', // Pequeño efecto dinámico al pasar el mouse
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    },
                }}
                >
                <CardContent sx={{ p: 0, '&:last-child': { paddingBottom: 0 } }}>
                    {/* Contenedor del Ícono / Emoji */}
                    <Box sx={{ fontSize: '2.5rem', mb: 2, display: 'inline-block' }}>
                    {icon}
                    </Box>

                    {/* Título en Fuente Cinzel */}
                    <Typography
                    variant="h6"
                    sx={{
                        fontFamily: "'Cinzel', serif",
                        fontWeight: 600,
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        mb: 1.5,
                    }}
                    >
                    {title}
                    </Typography>

                    {/* Descripción en Fuente Montserrat */}
                    <Typography
                    variant="body2"
                    sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        color: 'rgba(255, 255, 255, 0.7)', // Blanco semitransparente para lectura descansada
                        lineHeight: 1.6,
                    }}
                    >
                    {description}
                    </Typography>
                </CardContent>
            </Card>
        </>
    );
}