// Línea de tiempo para seguimiento de compra.

import { Stack, Typography } from '@mui/material';

export const OrderTimeline = ({ history = [] }) => <Stack spacing={1}>{history.map((item) => <Typography key={item.id} variant="body2">{item.estado_nuevo} - {item.comentario}</Typography>)}</Stack>;
