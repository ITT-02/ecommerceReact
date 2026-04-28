// Tarjeta de indicador para dashboard administrativo.

import { Card, CardContent, Typography } from '@mui/material';

export const AdminStatsCard = ({ title, value }) => <Card><CardContent><Typography variant="body2" color="text.secondary">{title}</Typography><Typography variant="h4">{value}</Typography></CardContent></Card>;
