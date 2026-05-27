import React from 'react';

import {
    Typography,
    Box,
    Grid
} from '@mui/material';

import '@fontsource/cinzel';
import '@fontsource/montserrat';

import { BoxItemComponent } from './BoxItemComponent';

export const ValoresComponent = () => {

    const valores = [
        {
        icon: '🎯',
        title: 'Transparencia',
        description: 'Precios claros, sin costos ocultos. Lo que ves es lo que pagas.',
        },
        {
        icon: '🏅',
        title: 'Calidad',
        description: 'Cada pieza pasa control antes de salir de nuestra bodega.',
        },
        {
        icon: '🤝',
        title: 'Comunidad',
        description: 'Crecemos cuando nuestros mayoristas crecen. Tu éxito es el nuestro.',
        },
        {
        icon: '🚀',
        title: 'Innovación',
        description: 'Buscamos constantemente mejores productos, procesos y herramientas.',
        },
    ];

    return (
        <>
            <Box sx={{
                backgroundColor: '#0F3D37',
                pt: '70px',
                pb: '70px',
                px: { xs: 2, sm: 4 },
            }}>
                <Typography align="center" sx={{ color: '#D4A24A', fontFamily: 'Montserrat', fontWeight: 500, fontSize: '11px', letterSpacing: '0.25em' }}>
                    NUESTROS VALORES
                </Typography>
                <Typography align="center" sx={{ color: '#F6F3EE', fontFamily: 'Cinzel', fontWeight: 500, fontSize: '38px', mb: 5 }}>
                    LO QUE NOS GUÍA
                </Typography>

                <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',   // 👈 4 en una fila en desktop
                        },
                        gap: 3,
                    }}>
                        {valores.map((item, index) => (
                        <BoxItemComponent key={index} {...item} />
                        ))}
                    </Box>
                </Box>
            </Box>
        </>
    );
}