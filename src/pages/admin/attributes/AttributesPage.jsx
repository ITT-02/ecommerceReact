import React, { useState } from 'react';
import {
  Box, IconButton, Typography, Switch, Stack, Chip, Dialog, DialogContent, DialogTitle, useTheme, alpha, useMediaQuery
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'; 
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';

import { ConfirmDialog } from '../../../components/common/ConfirmDialog'; 
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable'; 
import { useAtributos } from "../../../hooks/catalog/useAttributes";
import { useAtributoValores } from "../../../hooks/catalog/useAtributoValores";
import { AtributoForm } from './components/AtributoForm';
import { ValoresList } from './components/ValoresList';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';


const ValoresSummary = ({ atributoId, tipoDato, refreshKey }) => {
  const { valores, loading, fetchValores } = useAtributoValores(atributoId);
  const theme = useTheme(); 
  
  // Detectamos los tamaños de pantalla
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Celulares
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));    // Pantallas grandes (como tu monitor de 27")

  React.useEffect(() => { fetchValores(); }, [fetchValores, refreshKey]);

  if (loading) return <Typography variant="caption" sx={{ opacity: 0.5 }}>Cargando...</Typography>;
  if (!valores || valores.length === 0) return <Typography variant="caption" color="text.disabled">-</Typography>;

  const isColor = tipoDato === 'color';
  
  
  let maxDisplay = 2; 
  if (isColor) {
    maxDisplay = isMobile ? 4 : (isLarge ? 8 : 5);
  } else {
    maxDisplay = isMobile ? 1 : (isLarge ? 4 : 2); // 4 chips en monitores grandes, 1 en celulares
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxWidth: isLarge ? 400 : 220, alignItems: 'center' }}>
      {valores.slice(0, maxDisplay).map(v => {
        if (isColor) {
           return (
             <Box 
               key={v.id}
               title={v.valor} 
               sx={{ 
                 width: 22, 
                 height: 22, 
                 borderRadius: '50%', 
                 bgcolor: v.color_hex || theme.palette.text.disabled, 
                 boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.text.primary, 0.15)}, 0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`,
                 cursor: 'default',
                 transition: 'transform 0.2s',
                 '&:hover': { transform: 'scale(1.15)' } 
               }} 
             />
           );
        }
        
        return (
          <Chip 
             key={v.id} 
             label={v.valor} 
             size="small" 
             sx={{ 
               height: 24, 
               fontSize: '0.75rem', 
               maxWidth: '120px', 
               // ADAPTADO AL MODO OSCURO AUTOMÁTICAMENTE:
               bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : '#f5f5f5', 
               color: 'text.primary',
               fontWeight: 600,
               border: '1px solid',
               borderColor: 'divider',
               borderRadius: '6px', 
               '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', px: 1 } 
             }} 
          />
        );
      })}
      
      {valores.length > maxDisplay && (
        <Typography variant="caption" sx={{ 
          color: 'text.secondary', fontWeight: 700, ml: 0.5, px: 1, py: 0.2, borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : '#f0f0f0', 
        }}>
          +{valores.length - maxDisplay}
        </Typography>
      )}
    </Box>
  );
};


export const AttributesPage = () => {
  const { 
    atributos, loading, 
    pagination, searchValue, filterValues, 
    onSearchChange, onFilterChange, onResetFilters, onPageChange, onPageSizeChange,
    create, update, remove 
  } = useAtributos();

  const [openModal, setOpenModal] = useState(false);
  const [atributoEditar, setAtributoEditar] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  
  const [openValoresModal, setOpenValoresModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [hubieronCambios, setHubieronCambios] = useState(false);
  const [atributoEliminar, setAtributoEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenModal = (atributo = null) => {
    setAtributoEditar(atributo);
    setOpenModal(true);
  };

  const handleSaveAttr = async (formData) => {
    try {
      if (atributoEditar) await update(atributoEditar.id, formData);
      else await create(formData);
      setOpenModal(false);
    } catch (error) {
      alert('Hubo un error al guardar el atributo');
    }
  };

  const confirmarEliminacion = async () => {
    if (!atributoEliminar) return;
    setIsDeleting(true);
    try { 
      await remove(atributoEliminar.id); 
      setAtributoEliminar(null); 
    } catch (error) { 
      alert('Error eliminando el atributo'); 
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenValores = (attr) => {
    setSeleccionado(attr);
    setHubieronCambios(false); 
    setOpenValoresModal(true);
  };

  const handleCloseValoresModal = () => {
    setOpenValoresModal(false);
    if (hubieronCambios) {
       setRefreshKey(prev => prev + 1);
       setHubieronCambios(false);
    }
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return '-';
    return new Date(fechaString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const columns = [
    { field: 'nombre', headerName: 'Nombre', width: 170, renderCell: (row) => <Typography fontWeight={600} color="text.primary">{row.nombre}</Typography> },
    { field: 'valores', headerName: 'Valores', width: 230, renderCell: (row) => <ValoresSummary atributoId={row.id} tipoDato={row.tipo_dato} refreshKey={refreshKey} /> },
    { field: 'tipo_dato', headerName: 'Tipo', width: 100, renderCell: (row) => <Typography variant="body2" color="text.secondary" sx={{textTransform: 'capitalize'}}>{row.tipo_dato}</Typography> },
    { 
      field: 'se_usa_en_filtro', headerName: 'Filtrable', align: 'center', width: 120,
      renderCell: (row) => (
        <Chip label={row.se_usa_en_filtro ? "Sí" : "No"} size="small" color={row.se_usa_en_filtro ? "success" : "error"} variant="outlined" />
      )
    },
    { 
      field: 'se_usa_en_variantes', headerName: 'Variante', align: 'center', width: 120,
      renderCell: (row) => (
        <Chip label={row.se_usa_en_variantes ? "Sí" : "No"} size="small" color={row.se_usa_en_variantes ? "success" : "error"} variant="outlined" />
      )
    },
    { 
      field: 'es_obligatorio', headerName: 'Obligatorio', align: 'center', width: 120,
      renderCell: (row) => (
        <Chip label={row.es_obligatorio ? "Sí" : "No"} size="small" color={row.es_obligatorio ? "success" : "error"} variant="outlined" />
      )
    },
    { field: 'updated_at', headerName: 'Actualizado', width: 140, renderCell: (row) => <Typography variant="caption" color="text.secondary">{formatFecha(row.updated_at || row.created_at)}</Typography> },
  ];

  const rowActions = [
    { 
      icon: <FormatListBulletedIcon color="primary" />, 
      label: 'Gestionar Valores', // Mucho más explícito para el usuario
      onClick: (row) => handleOpenValores(row) 
    },
    { 
      icon: <EditOutlinedIcon color="success" />, // Verde
      label: 'Editar', 
      onClick: (row) => handleOpenModal(row) 
    },
    { 
      type: 'delete', 
      icon: <DeleteOutlineIcon color="error" />, // Rojo
      label: 'Eliminar', 
      onClick: (row) => setAtributoEliminar(row) 
    }
  ];

  const filtersConfig = [
    { name: 'seUsaEnFiltro', label: 'Uso en Filtros', type: 'select', options: [ { label: 'Sí se usan', value: true }, { label: 'No se usan', value: false } ] },
    { name: 'seUsaEnVariantes', label: 'Uso en Variantes', type: 'select', options: [ { label: 'Sí se usan', value: true }, { label: 'No se usan', value: false } ] },
    { name: 'esObligatorio', label: 'Obligatorio', type: 'select', options: [ { label: 'Sí son obligatorios', value: true }, { label: 'No son obligatorios', value: false } ] }
  ];

  return (
     <PlaceholderPage title="Atributos" description="Gestiona atributos y valores personalizados.">
        <Box sx={{ pb: 6, width: '100%' }}>
        
          <AdminResourceTable
            rows={atributos} columns={columns} actions={rowActions} loading={loading} pagination={pagination}
            searchValue={searchValue} searchLabel="Buscar por nombre, código o tipo..."
            filterValues={filterValues} filters={filtersConfig}
            onSearchChange={onSearchChange} onFilterChange={onFilterChange} onResetFilters={onResetFilters}
            onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
            primaryActionLabel="Nuevo Atributo" onPrimaryAction={() => handleOpenModal()}
            emptyTitle="No hay atributos" emptyDescription="Comienza creando tu primer atributo."
          />

          <Dialog open={openValoresModal} onClose={handleCloseValoresModal} maxWidth="md" fullWidth>
            <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography variant="h6" fontWeight="bold">Valores</Typography>
              <IconButton onClick={handleCloseValoresModal} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                {seleccionado && ( <ValoresList atributoSeleccionado={seleccionado} onChangeEvent={() => setHubieronCambios(true)} /> )}
            </DialogContent>
          </Dialog>

          {openModal && (
            <AtributoForm open={openModal} isEdit={!!atributoEditar} atributoInicial={atributoEditar} onClose={() => setOpenModal(false)} onSave={handleSaveAttr} />
          )}

          <ConfirmDialog
            open={Boolean(atributoEliminar)} action="delete" title="Eliminar atributo"
            message={`¿Eliminar ${atributoEliminar?.nombre}? Se perderán todos sus valores.`}
            onCancel={() => setAtributoEliminar(null)} onConfirm={confirmarEliminacion} loading={isDeleting}
          />
        </Box>
    </PlaceholderPage>
  );
};

