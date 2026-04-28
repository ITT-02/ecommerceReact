// Card reutilizable para secciones administrativas.

import { Card, CardContent, Typography } from '@mui/material';

export const AdminSectionCard = ({ title, children }) => <Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>{children}</CardContent></Card>;
