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
            <Box sx={{ backgroundColor: '#0F3D37',
                pt: '70px',
                pb: '70px',
                // Reemplazamos los porcentajes por espaciados fijos y responsivos del tema
                px: { xs: 3, sm: 6, md: 8 }, 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <Typography align="center" sx ={{ color:'#D4A24A', fontFamily:"Montserrat", fontWeight: 500, fontSize: '11px', letterSpacing: '0.25em' }}>
                    NUESTROS VALORES
                </Typography>
                <Typography align="center" sx ={{ color:'#F6F3EE', fontFamily: 'Cinzel', fontWeight: 500, fontSize: '38px' }}>
                    LO QUE NOS GUÍA
                </Typography>

                <Grid
                    container 
                    spacing={3} 
                    sx={{ 
                    maxWidth: '1200px', 
                    width: '100%', 
                    mx: 'auto' 
                    }}
                >
                    {valores.map((item, index) => (
                    // xs=12 (1 por fila en cel), sm=6 (2 por fila en tablet), md=3 (4 por fila en PC)
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <BoxItemComponent
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                        />
                    </Grid>
                    ))}
                </Grid>
            </Box>
        </>
    );
}