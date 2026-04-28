// Tarjeta para mostrar un método de pago.

import { Card, CardContent, Typography } from '@mui/material';

export const PaymentMethodCard = ({ method }) => <Card variant="outlined"><CardContent><Typography sx={{ fontWeight: 700 }}>{method?.nombre}</Typography><Typography variant="body2" color="text.secondary">{method?.instrucciones}</Typography></CardContent></Card>;
