import {
    Modal,
    Box,
    Typography,
    TextField,
    Checkbox,
    Stack,
    IconButton,
    Grid,
    FormControlLabel,
    Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FileUploadField } from '../../common/Field/FileUploadField';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { useState, useMemo } from 'react';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 650,
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: '#FFF',
    borderRadius: '40px', 
    boxShadow: '0px 8px 30px rgba(0,0,0,0.1)',
    p: 4,
    outline: 'none',
    border: '2px solid #333'
};

const labelStyle = {
    fontWeight: 'bold',
    color: '#555',
    mb: 0.5,
    ml: 0.5,
    fontSize: '0.9rem'
};

const inputStyle = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#E0E0E0',
        borderRadius: '15px',
        '& fieldset': { border: 'none' },
    },
    '& .MuiInputBase-input': {
        padding: '10px 15px',
        fontSize: '0.9rem'
    }
};

export const CategoryModal = ({ 
    open, 
    onClose, 
    onSave, 
    category = null,
    isLoading = false 
}) => {
    const initialFormData = useMemo(() => {
        if (category) {
            return {
                categoria_padre_id: category.categoria_padre_id ?? null,
                nombre: category.nombre || '',
                descripcion: category.descripcion || '',
                orden_visual: category.orden_visual ?? 1,
                icono: category.icono || '',
                es_visible: category.es_visible ?? true,
                es_activa: category.es_activa ?? true,
                imagen_url: category.imagen_url || '',
                imagen_path: category.imagen_path || '',
                color_hex: category.color_hex || '#262EC3',
                _file: null,
            };
        }
        return {
            categoria_padre_id: null,
            nombre: '',
            descripcion: '',
            orden_visual: 1,
            icono: '',
            es_visible: true,
            es_activa: true,
            imagen_url: '',
            imagen_path: '',
            color_hex: '#262EC3',
            _file: null,
        };
    }, [category]); // Solo recalcula cuando category cambia

    const [formData, setFormData] = useState(initialFormData);
    const [color, setColor] = useState(category?.color_hex || "#262EC3");
    const [pendingSaveData, setPendingSaveData] = useState(null);
    const [openConfirmSave, setOpenConfirmSave] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageChange = (file) => {
        handleChange('_file', file);
    };

    const handleImageRemove = () => {
        handleChange('_file', null);
        handleChange('imagen_url', '');
        handleChange('imagen_path', '');
    };

    const handleCheckboxChange = (field) => {
        handleChange(field, !formData[field]);
    };

    const handleSave = () => {
        const dataToSave = {
            categoria_padre_id: formData.categoria_padre_id ?? null,
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            imagen_url: formData.imagen_url ?? null,
            imagen_path: formData.imagen_path ?? null,
            _file: formData._file,
            icono: formData.icono,
            color_hex: color,
            orden_visual: Number(formData.orden_visual),
            es_visible: formData.es_visible,
            es_activa: formData.es_activa,
            ...(category?.id && { id: category.id })
        };
        setPendingSaveData(dataToSave);
        setOpenConfirmSave(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingSaveData) return;
        await onSave(pendingSaveData);
        setOpenConfirmSave(false);
        setPendingSaveData(null);
    };

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <Box sx={modalStyle}>
                    {/* Cabecera */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#333' }}>
                            {category?.id ? 'Editar categoría' : 'Crear categoría'}
                        </Typography>
                        <IconButton onClick={onClose} sx={{ color: '#333', p: 0 }}>
                            <CloseIcon sx={{ fontSize: 35 }} />
                        </IconButton>
                    </Box>

                    <Grid container spacing={2}>
                        {/* Nombre */}
                        <Grid item xs={12} size={12}>
                            <Typography sx={labelStyle}>Nombre</Typography>
                            <TextField 
                                sx={{ ...inputStyle, width: '50%' }} 
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                            />
                        </Grid>

                        {/* Descripción */}
                        <Grid item xs={12} size={12}>
                            <Typography sx={labelStyle}>Descripción</Typography>
                            <TextField 
                                fullWidth 
                                multiline 
                                rows={3} 
                                sx={inputStyle}
                                value={formData.descripcion}
                                onChange={(e) => handleChange('descripcion', e.target.value)}
                            />
                        </Grid>

                        {/* Imagen */}
                        <Grid item xs={6} size={12}>
                            <Typography sx={labelStyle}>Imagen de categoría</Typography>
                            <FileUploadField 
                                label="Seleccionar imagen"
                                accept="image/*"
                                value={formData._file}
                                previewUrl={formData.imagen_url}
                                onChange={handleImageChange}
                                onRemove={handleImageRemove}
                                helperText="PNG, JPG, JPEG (máx. 5MB)"
                                height={150}
                            />
                        </Grid>
                        
                        {/* Orden Visual */}
                        <Grid item xs={6} size={6}>
                            <Typography sx={labelStyle}>Orden Visual</Typography>
                            <TextField 
                                fullWidth 
                                sx={inputStyle}
                                value={formData.orden_visual}
                                onChange={(e) => handleChange('orden_visual', e.target.value)}
                            />
                        </Grid>

                        {/* Nombre de Ícono */}
                        <Grid item xs={6} size={6}>
                            <Typography sx={labelStyle}>Nombre de ícono</Typography>
                            <TextField 
                                fullWidth 
                                sx={inputStyle}
                                value={formData.icono}
                                onChange={(e) => handleChange('icono', e.target.value)}
                            />
                        </Grid>

                        {/* Color */}
                        <Grid container item xs={12} size={12} spacing={2} sx={{ mt: 1}}>
                            <Grid item xs={12} size={6}>
                                <Typography sx={labelStyle}>Color</Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                                    <TextField
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        fullWidth 
                                        sx={{...inputStyle, width: '20%' }}
                                    />
                                    <TextField
                                        type='text'
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        fullWidth
                                        sx={{ ...inputStyle, width: '70%', mt: 1 }}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={6} />   
                        </Grid>

                        {/* Checkboxes */}
                        <Grid item xs={6} size={12} >
                            <Stack spacing={0.5} sx={{ mb: 0.5 }}>
                                <FormControlLabel 
                                    control={
                                        <Checkbox 
                                            checked={formData.es_visible}
                                            onChange={() => handleCheckboxChange('es_visible')}
                                            size="small" 
                                            sx={{ color: '#673ab7' }} 
                                        />
                                    } 
                                    label={<Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>¿Es visible?</Typography>}
                                />
                                <FormControlLabel 
                                    control={
                                        <Checkbox 
                                            checked={formData.es_activa}
                                            onChange={() => handleCheckboxChange('es_activa')}
                                            size="small" 
                                            sx={{ color: '#673ab7' }} 
                                        />
                                    } 
                                    label={<Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>¿Está activa?</Typography>}
                                />
                            </Stack>
                        </Grid>

                        {/* Botones */}
                        <Grid item xs={12} sx={{ mt: 2, alignItems: 'end', display: 'flex', justifyContent: 'flex-end' }}>
                            <Stack direction="row" spacing={2}>
                                <Button 
                                    variant="contained"
                                    disabled={isLoading}
                                    onClick={handleSave}
                                    sx={{ 
                                        bgcolor: '#E6EE9C', 
                                        color: '#000', 
                                        borderRadius: '15px',
                                        fontWeight: 'bold', 
                                        textTransform: 'none', 
                                        fontSize: '1rem',
                                        px: 4, 
                                        py: 1.5, 
                                        '&:hover': { bgcolor: '#D4E157' }
                                    }}
                                >
                                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>

            <ConfirmDialog
                open={openConfirmSave}
                action="warning"
                title={category?.id ? 'Confirmar guardado' : 'Guardar categoría'}
                message={category?.id
                    ? '¿Deseas guardar los cambios realizados en esta categoría?'
                    : '¿Deseas guardar esta nueva categoría?'}
                onCancel={() => setOpenConfirmSave(false)}
                onConfirm={handleConfirmSave}
                confirmText={category?.id ? 'Guardar cambios' : 'Guardar'}
                loading={isLoading}
            />
        </>
    );
};
