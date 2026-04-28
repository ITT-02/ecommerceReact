// Tarjeta de pedido para el cliente.

import { Card, CardContent, Typography } from '@mui/material';

export const OrderCard = ({ order }) => <Card><CardContent><Typography sx={{ fontWeight: 700 }}>{order?.numero_pedido}</Typography><Typography variant="body2">Total: {order?.total}</Typography></CardContent></Card>;
