import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Typography,
    IconButton,
    Box,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export const PromotionDetailDialog = ({ open, onClose, promotion }) => {
    // Si no hay promoción seleccionada todavía (evita renderizar undefined mientras abre/cierra)
    if (!promotion) return null;

    // Estilos comunes para los contenedores de datos de solo lectura
    const infoBoxStyle = {
        borderRadius: '16px',
        p: 2.5,
        height: '100%',
        border: '2px solid borderDefault'
    };

    const labelStyle = {
        fontWeight: 'bold',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        mb: 0.5
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md" // 'md' nos da los 900px perfectos para meter la tabla de aplicaciones abajo
            paperprops={{
                sx: {
                    borderRadius: `xxl`, // Usando tu radio más amplio para el Dialog (24px)
                    bgcolor: 'backgroundPaper',
                    p: 1
                }
            }}
        >
            {/* CABECERA */}
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h4" >
                        Detalles de Promoción
                    </Typography>
                    <Chip 
                        label={promotion.es_activa ? "Activa" : "Inactiva"} 
                        color={promotion.es_activa ? "success" : "error"}
                        sx={{ fontWeight: 'bold', borderRadius: '10px' }}
                    />
                </Box>
                <IconButton onClick={onClose} variant="button" >
                    <CloseIcon sx={{ fontSize: 28 }} />
                </IconButton>
            </DialogTitle>

            {/* CONTENIDO */}
            <DialogContent dividers sx={{ borderColor: 'divider' }}>
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                    
                    {/* SECCIÓN 1: DATOS PRINCIPALES */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={infoBoxStyle}>
                            <Typography  variant = "h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalOfferIcon fontSize="small" /> Información General
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={12}>
                                    <Typography variant = "subtitle1" sx={labelStyle}>Nombre de la Promoción</Typography>
                                    <Typography variant="body1" >
                                        {promotion.nombre}
                                    </Typography>
                                </Grid>
                                <Grid size={12}>
                                    <Typography variant = "subtitle1" sx={labelStyle}>Descripción</Typography>
                                    <Typography variant="body1" sx={{ color: 'textPrimary', lineHeight: 1.5 }}>
                                        {promotion.descripcion || 'Sin descripción disponible.'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* SECCIÓN 2: REGLAS DE NEGOCIO */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={infoBoxStyle}>
                            <Typography variant = "h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                                <CalendarTodayIcon fontSize="small" /> Reglas y Vigencia
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={6}>
                                    <Typography variant="subtitle1" sx={labelStyle}>Tipo Descuento</Typography>
                                    <Chip 
                                        label={promotion.tipo_descuento === 'porcentaje' ? 'Porcentaje (%)' : 'Monto Fijo ($)'}
                                        sx={{ bgcolor: '#E3F2FD', color: '#0D47A1', fontWeight: 'bold', borderRadius: '8px' }}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <Typography variant="subtitle1" sx={labelStyle}>Valor Descuento</Typography>
                                    <Typography variant="body1" sx={{ ml: 0.5 }}>
                                        {promotion.tipo_descuento === 'porcentaje' ? `${promotion.valor_descuento}%` : `$${promotion.valor_descuento}`}
                                    </Typography>
                                </Grid>
                                <Grid size={6}>
                                    <Typography variant="subtitle1" sx={labelStyle}>Fecha Inicio</Typography>
                                    <Typography variant="body1" sx={{ ml: 0.5 }}>
                                        {promotion.fecha_inicio ? new Date(promotion.fecha_inicio).toLocaleDateString() : 'No definida'}
                                    </Typography>
                                </Grid>
                                <Grid size={6}>
                                    <Typography variant="subtitle1" sx={labelStyle}>Fecha Fin</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {promotion.fecha_fin ? new Date(promotion.fecha_fin).toLocaleDateString() : 'No definida'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* SECCIÓN 3: TABLA DE APLICACIONES (HISTORIAL O COBERTURA) */}
                    <Grid size={12}>
                        <Typography variant="h6" sx={{ mb: 1.5, pl: 0.5 }}>
                            Tabla de Aplicaciones / Segmentos Afectados
                        </Typography>
                        <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid #E0E0E0', overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead >
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Tipo de Aplicación</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Criterio / Categoría afectada</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Monto Mínimo Compra</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {promotion.aplicaciones && promotion.aplicaciones.length > 0 ? (
                                        promotion.aplicaciones.map((app, index) => (
                                            <TableRow key={index} sx={{ '&:last-child cell, &:last-child th': { border: 0 } }}>
                                                <TableCell sx={{ py: 1.5 }}>{app.tipo || 'General'}</TableCell>
                                                <TableCell>{app.criterio || 'Todo el catálogo'}</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>${app.monto_minimo ?? '0.00'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                Esta promoción se aplica de forma global a todas las compras sin restricciones adicionales.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                </Grid>
            </DialogContent>

            {/* ACCIONES */}
            <DialogActions sx={{ p: 2.5 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        borderRadius: '15px',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        px: 4,
                        py: 1.2,
                    }}
                >
                    Cerrar Detalle
                </Button>
            </DialogActions>
        </Dialog>
    );
};