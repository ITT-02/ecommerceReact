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
        <Box sx={{
            backgroundColor: '#0F3D37',
            pt: '70px',
            pb: '70px',
            px: { xs: 2, sm: 4 },
        }}>
            {/* ✅ Un solo Box con maxWidth envuelve títulos Y grid */}
            <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
                <Typography sx={{ color: '#D4A24A', fontFamily: 'Montserrat', fontWeight: 500, fontSize: '11px', letterSpacing: '0.25em', mb: 1 }}>
                PROGRAMA MAYORISTA
                </Typography>
                <Typography sx={{ color: '#F6F3EE', fontFamily: 'Cinzel', fontWeight: 500, fontSize: { xs: '28px', md: '38px' }, mb: 2 }}>
                ÚNETE A NUESTRA RED DE DISTRIBUIDORES
                </Typography>
                <Typography sx={{ color: '#F6F3EE', fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', mb: 4, maxWidth: '700px' }}>
                Accede a precios exclusivos, stock completo y soporte personalizado. Más de 1,200 mayoristas activos ya confían en Aliqora.
                </Typography>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(3, 1fr)',
                    },
                    gap: 3,
                    }}>
                    {beneficios.map((item, index) => (
                        <BoxItemComponent key={index} {...item} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}