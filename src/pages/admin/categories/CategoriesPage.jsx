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
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MuiColorInput } from 'mui-color-input'

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import {useCategories} from '../../../hooks/catalog/useCategories';
import { useState, useMemo } from 'react';

export const CategoriesPage = () => {
    const { categories, loading } = useCategories();
    const [searchValue, setSearchValue] = useState('');
    const [filterValues, setFilterValues] = useState({});
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [open, setOpen] = useState(false);

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
        width: 780, // Ancho suficiente para que respire el diseño
        bgcolor: '#FFF',
        borderRadius: '60px', // Bordes muy redondeados del contenedor
        boxShadow: '0px 10px 40px rgba(0,0,0,0.12)',
        p: 7,
        outline: 'none',
        border: '2px solid #333'
        };

    const labelStyle = {
        fontWeight: 'bold',
        color: '#555',
        mb: 1,
        ml: 0.5,
        fontSize: '1.1rem'
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            bgcolor: '#E0E0E0',
            borderRadius: '20px',
            '& fieldset': { border: 'none' },
        },
        '& .MuiInputBase-input': {
            padding: '14px 20px',
            fontSize: '1.1rem'
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
                        
                        {/* Cabecera: Título y X a la extrema derecha */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#333' }}>
                                Detalles de categoría
                            </Typography>
                            <IconButton onClick={handleCloseEdit} sx={{ color: '#333', p: 0 }}>
                                <CloseIcon sx={{ fontSize: 50 }} />
                            </IconButton>
                        </Box>

                        <Grid container spacing={4}>
                        {/* Fila 1: Nombre (Izquierda) y Descripción (Derecha) */}
                            <Grid item xs={6}>
                                <Typography sx={labelStyle}>Nombre</Typography>
                                <TextField fullWidth sx={inputStyle} defaultValue="Categoría 1" />
                            </Grid>

                            {/* Fila 2: Descripción (Ocupa el ancho total, se mueve abajo automáticamente) */}
                            <Grid item xs={12}>
                                <Typography sx={labelStyle}>Descripción</Typography>
                                <TextField fullWidth multiline rows={4} sx={inputStyle} defaultValue="Esta es la categoría 1" />
                            </Grid>

                        {/* Fila 2: URL Imagen (Izquierda) y Orden (Derecha) */}
                            <Grid item xs={6}>
                                <Typography sx={labelStyle}>URL de Imagen</Typography>
                                <TextField fullWidth sx={inputStyle} defaultValue="categoría1_img.url" />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography sx={labelStyle}>Orden Visual</Typography>
                                <TextField fullWidth sx={inputStyle} defaultValue="1" />
                            </Grid>

                        {/* Fila 3: Nombre Icono y Bloque Color/Checks */}
                            <Grid item xs={6}>
                                <Typography sx={labelStyle}>Nombre de ícono</Typography>
                                <TextField fullWidth sx={inputStyle} defaultValue="Icono Categoria 1" />
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: 3 }}>
                                {/* Indicador de Color */}
                                <MuiColorInput format="hex"  />
                                
                                {/* Checkboxes alineados */}
                                <Stack spacing={1} sx={{ mb: 1 }}>
                                    <FormControlLabel 
                                    control={<Checkbox defaultChecked sx={{ color: '#673ab7', '&.Mui-checked': { color: '#673ab7' }, transform: 'scale(1.2)' }} />} 
                                    label={<Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>¿Es visible?</Typography>}
                                    />
                                    <FormControlLabel 
                                    control={<Checkbox defaultChecked sx={{ color: '#673ab7', '&.Mui-checked': { color: '#673ab7' }, transform: 'scale(1.2)' }} />} 
                                    label={<Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>¿Está activa?</Typography>}
                                    />
                                </Stack>
                                </Box>
                            </Grid>

                            {/* Botones de Acción: Abajo a la izquierda */}
                            <Grid item xs={12} sx={{ mt: 3 }}>
                                <Stack direction="row" spacing={4}>
                                    <Button 
                                        variant="contained" 
                                        sx={{ 
                                        bgcolor: '#E6EE9C', color: '#000', borderRadius: '25px',
                                        fontWeight: 900, textTransform: 'none', fontSize: '1.3rem',
                                        px: 6, py: 2.5, '&:hover': { bgcolor: '#D4E157' }
                                        }}
                                    >
                                        Guardar Cambios
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        sx={{ 
                                        bgcolor: '#D32F2F', color: '#FFF', borderRadius: '25px',
                                        fontWeight: 900, textTransform: 'none', fontSize: '1.3rem',
                                        px: 6, py: 2.5, '&:hover': { bgcolor: '#B71C1C' }
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
