import React from 'react';

import {
    Typography,
    Box,
    Grid
} from '@mui/material';

import '@fontsource/cinzel';
import '@fontsource/montserrat';

import { BoxItemComponent } from './BoxItemComponent';

export const ProgMayoristaComponent = () => {

    const beneficios = [
        {
        icon: '💰',
        title: 'Precios Mayoristas',
        description: 'Hasta 40% por debajo del precio al público. Descuentos adicionales por volumen.',
        },
        {
        icon: '📷',
        title: 'Fotos Profesionales',
        description: 'Pack de imágenes HD para redes sociales y tiendas online incluido en cada pedido.',
        },
        {
        icon: '🤝',
        title: 'Asesor Personal',
        description: 'Contacto directo por WhatsApp con tu asesor de ventas dedicado.',
        },
    ];

    return (
        <>
            <Box sx={{ backgroundColor: '#0F3D37', padding: '20px', pl: '20%', pr: '20%', pt: '70px', pb: '70px', display: 'flex', flexDirection: 'column' }}>
                <Typography align="left" sx ={{ color:'#D4A24A', fontFamily:"Montserrat", fontWeight: 500, fontSize: '11px', letterSpacing: '0.25em' }}>
                    PROGRAMA MAYORISTA
                </Typography>
                <Typography align="left" sx ={{ color:'#F6F3EE', fontFamily: 'Cinzel', fontWeight: 500, fontSize: '38px' }}>
                    ÚNETE A NUESTRA RED DE DISTRIBUIDORES
                </Typography>
                <Typography align="left" sx ={{ color:'#F6F3EE', fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px' }}>
                    Accede a precios exclusivos, stock completo y soporte personalizado. Más de 1,200 mayoristas activos ya confían en Aliqora.
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
                    {beneficios.map((item, index) => (
                    // xs=12 (1 por fila en cel), sm=4 (3 por fila en PC)
                    <Grid item xs={12} sm={4} key={index}>
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