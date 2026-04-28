// Instrucciones de pago para el cliente.

import { Alert, Stack, Typography } from '@mui/material';

export const PaymentInstructions = ({ method }) => <Stack spacing={1}><Typography variant="h6">Instrucciones de pago</Typography><Alert severity="info">{method?.instrucciones || 'Selecciona un método de pago para ver las instrucciones.'}</Alert></Stack>;
