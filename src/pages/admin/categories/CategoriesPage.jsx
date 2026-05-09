// Página administrativa: Categorías.

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

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ImageUploadField } from '../../../components/forms/ImageUploadField';
import {useCategories} from '../../../hooks/catalog/useCategories';
import { useState, useMemo } from 'react';

export const CategoriesPage = () => {
    const { categories, loading } = useCategories();
    const [searchValue, setSearchValue] = useState('');
    const [filterValues, setFilterValues] = useState({});
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [open, setOpen] = useState(false);
    const [color, setColor] = useState("#262EC3"); // Estado para el color seleccionado

    const filteredCategories = useMemo(() => {
        return categories.filter((category) => 
            category.nombre.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [categories, searchValue]);

    const visibleRows = filteredCategories.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize
    );

    const handleOpenEdit = () => {
        setOpen(true);
    }
    
    const handleCloseEdit = () => {
        setOpen(false);
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 650, // Reducido de 800
        maxHeight: '90vh', // No ocupa toda la pantalla
        overflowY: 'auto', // Scroll si el contenido es largo
        bgcolor: '#FFF',
        borderRadius: '40px', 
        boxShadow: '0px 8px 30px rgba(0,0,0,0.1)',
        p: 4, // Reducido de 7
        outline: 'none',
        border: '2px solid #333'
    };

    const labelStyle = {
        fontWeight: 'bold',
        color: '#555',
        mb: 0.5,
        ml: 0.5,
        fontSize: '0.9rem' // Texto más pequeño
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            bgcolor: '#E0E0E0',
            borderRadius: '15px',
            '& fieldset': { border: 'none' },
        },
        '& .MuiInputBase-input': {
            padding: '10px 15px', // Padding reducido
            fontSize: '0.9rem'
        }
    };

    return (
        <>
            <PlaceholderPage title="Categorías" description="Gestiona categorías principales." >
                <AdminResourceTable
                    rows={visibleRows}
                    columns={[
                        { field: 'orden_visual', headerName: 'Orden' },
                        { field: 'nombre', headerName: 'Nombre' },
                        { field: 'descripcion', headerName: 'Descripción' },
                        { field: 'slug', headerName: 'Slug' },
                        {
                            id: 'categoria_padre',
                            headerName: 'Categoría padre',
                            renderCell: (row) => row.categoria_padre?.nombre ?? 'Principal',
                        },
                    ]}   
                    actions={[]}
                    loading={loading}
                    pagination={{
                        pageNumber: pageNumber,
                        pageSize: pageSize,
                        totalCount: filteredCategories.length,
                        totalPages: Math.ceil(filteredCategories.length / pageSize),
                    }}
                    searchValue={searchValue}
                    searchLabel="Buscar categorías..."
                    filterValues={filterValues}
                    filters={[]}
                    onSearchChange={setSearchValue}
                    onFilterChange={(name, value) => {
                        setFilterValues((prev) => ({ ...prev, [name]: value }));
                    }}
                    onResetFilters={() => {
                        setSearchValue('');
                        setFilterValues({});
                    }}
                    onPageChange={setPageNumber}
                    onPageSizeChange={setPageSize}
                    primaryActionLabel="Crear categoría"
                    onPrimaryAction={handleOpenEdit}
                    emptyTitle="No hay categorías"
                    emptyDescription="Crea tu primera categoría para organizar tus productos."
                />
                
                <Modal open={open} onClose={handleCloseEdit}>
                    <Box sx={modalStyle}>
                        
                        {/* Cabecera reducida */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#333' }}>
                                Detalles de categoría
                            </Typography>
                            <IconButton onClick={handleCloseEdit} sx={{ color: '#333', p: 0 }}>
                                <CloseIcon sx={{ fontSize: 35 }} />
                            </IconButton>
                        </Box>

                        <Grid container spacing={2}>
                        {/* Nombre (xs=12, pero 50% de ancho) */}
                            <Grid item xs={12} size={12}>
                                <Typography sx={labelStyle}>Nombre</Typography>
                                <TextField sx={{ ...inputStyle, width: '50%' }} defaultValue="Categoría 1" />
                            </Grid>

                            {/* Descripción (Ancho total) */}
                            <Grid item xs={12} size={12}>
                                <Typography sx={labelStyle}>Descripción</Typography>
                                <TextField fullWidth multiline rows={3} sx={inputStyle} defaultValue="Esta es la categoría 1" />
                            </Grid>

                            <Grid item xs={6} size={12}>
                                <Typography sx={labelStyle}>Archivo de Imagen</Typography>
                                <ImageUploadField label="Seleccionar imagen" file={null} onChange={() => {}} />
                            </Grid>
                            
                            <Grid item xs={6} size={6}>
                                <Typography sx={labelStyle}>Orden Visual</Typography>
                                <TextField fullWidth sx={inputStyle} defaultValue="1" />
                            </Grid>

                            <Grid item xs={6} size={6}>
                                <Typography sx={labelStyle}>Nombre de ícono</Typography>
                                <TextField fullWidth sx={inputStyle} defaultValue="Icono Categoria 1" />
                            </Grid>

                            <Grid container item xs={12} size={12} spacing={2} sx={{ mt: 1}}>
                                <Grid item xs={12} size={6} >
                                    <Typography sx={labelStyle}>Color</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                                        <TextField
                                            type="color"
                                            value={color} // Conectado al estado
                                            onChange={(e) => setColor(e.target.value)}
                                            fullWidth sx={{inputStyle, width: '20%' }}
                                        />
                                        <TextField
                                            type='text'
                                            value={color} // Conectado al mismo estado
                                            onChange={(e) => setColor(e.target.value)}
                                            fullWidth
                                            sx={{ ...inputStyle, width: '70%', mt: 1 }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={6} />   
                            </Grid>

                            
                        
                            <Grid item xs={6}>
                                <Stack spacing={0.5} sx={{ mb: 0.5 }}>
                                    <FormControlLabel 
                                        control={<Checkbox defaultChecked size="small" sx={{ color: '#673ab7' }} />} 
                                        label={<Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>¿Es visible?</Typography>}
                                    />
                                    <FormControlLabel 
                                        control={<Checkbox defaultChecked size="small" sx={{ color: '#673ab7' }} />} 
                                        label={<Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>¿Está activa?</Typography>}
                                    />
                                </Stack>
                            </Grid>

                            {/* Botones más compactos */}
                            <Grid item xs={12} sx={{ mt: 2, alignItems: 'end', display: 'flex', justifyContent: 'flex-end' }}>
                                <Stack direction="row" spacing={2}>
                                    <Button 
                                        variant="contained" 
                                        sx={{ 
                                        bgcolor: '#E6EE9C', color: '#000', borderRadius: '15px',
                                        fontWeight: 'bold', textTransform: 'none', fontSize: '1rem',
                                        px: 4, py: 1.5, '&:hover': { bgcolor: '#D4E157' }, alignItems: 'end'
                                        }}
                                    >
                                        Guardar Cambios
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        sx={{ 
                                        bgcolor: '#D32F2F', color: '#FFF', borderRadius: '15px',
                                        fontWeight: 'bold', textTransform: 'none', fontSize: '1rem',
                                        px: 4, py: 1.5, '&:hover': { bgcolor: '#B71C1C' }
                                        }}
                                    >
                                        Eliminar categoría
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                </Modal>
            </PlaceholderPage>
        </>
    );
};
