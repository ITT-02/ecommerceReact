import React, { useState } from 'react';
import {
  Box, IconButton, Typography, Switch, Stack, Chip, Dialog, DialogContent, DialogTitle
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';

import { ConfirmDialog } from '../../../components/common/ConfirmDialog'; 
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable'; // <-- AQUI USAMOS EL NUEVO COMPONENTE
import { useAtributos } from "../../../hooks/catalog/useAttributes";
import { useAtributoValores } from "../../../hooks/catalog/useAtributoValores";
import { AtributoForm } from './components/AtributoForm';
import { ValoresList } from './components/ValoresList';

// NUEVO: Agregamos flexWrap, maxWidth y textOverflow para evitar derrames
const ValoresSummary = ({ atributoId, refreshKey }) => {
  const { valores, loading, fetchValores } = useAtributoValores(atributoId);
  React.useEffect(() => { fetchValores(); }, [fetchValores, refreshKey]);

  if (loading) return <Typography variant="caption" sx={{ opacity: 0.5 }}>Cargando...</Typography>;
  if (!valores || valores.length === 0) return <Typography variant="caption" color="text.disabled">-</Typography>;

  const maxDisplay = 2;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 220 }}>
      {valores.slice(0, maxDisplay).map(v => (
        <Chip 
           key={v.id} 
           label={v.valor} 
           size="small" 
           variant="outlined" 
           sx={{ height: 20, fontSize: '0.7rem', maxWidth: '120px', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} 
        />
      ))}
      {valores.length > maxDisplay && <Chip label={`+${valores.length - maxDisplay}`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
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

  // NUEVO: Bandera del sensor de optimización de red
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

  const handleToggleInline = async (attr, field) => {
    const newValue = !attr[field];
    try { await update(attr.id, { [field]: newValue }); } catch (error) { alert('Error al actualizar'); }
  };

  const handleOpenValores = (attr) => {
    setSeleccionado(attr);
    setHubieronCambios(false); // Reseteamos el sensor al abrir
    setOpenValoresModal(true);
  };

  // NUEVO: La tabla solo se actualiza si atrapó algo nuevo
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

  // NUEVO: Le agregamos propiedad "width" o "flex" a las columnas para evitar sobrecarga y desbordes. (La tabla de tu líder lo entiende)
  const columns = [
    { field: 'nombre', headerName: 'Nombre', width: 170, renderCell: (row) => <Typography fontWeight={600}>{row.nombre}</Typography> },
    { field: 'valores', headerName: 'Valores', width: 230, renderCell: (row) => <ValoresSummary atributoId={row.id} refreshKey={refreshKey} /> },
    { field: 'tipo_dato', headerName: 'Tipo', width: 100, renderCell: (row) => <Typography variant="body2" sx={{textTransform: 'capitalize'}}>{row.tipo_dato}</Typography> },
    { 
      field: 'se_usa_en_filtro', headerName: 'Filtrable', align: 'center', width: 120,
      renderCell: (row) => <Switch size="small" color="success" checked={row.se_usa_en_filtro} onClick={(e) => { e.stopPropagation(); handleToggleInline(row, 'se_usa_en_filtro') }} /> 
    },
    { 
      field: 'se_usa_en_variantes', headerName: 'Variante', align: 'center', width: 120,
      renderCell: (row) => <Switch size="small" color="success" checked={row.se_usa_en_variantes} onClick={(e) => { e.stopPropagation(); handleToggleInline(row, 'se_usa_en_variantes') }} /> 
    },
    { 
      field: 'es_obligatorio', headerName: 'Obligatorio', align: 'center', width: 120,
      renderCell: (row) => <Switch size="small" color="success" checked={row.es_obligatorio} onClick={(e) => { e.stopPropagation(); handleToggleInline(row, 'es_obligatorio') }} /> 
    },
    { field: 'updated_at', headerName: 'Actualizado', width: 140, renderCell: (row) => <Typography variant="caption">{formatFecha(row.updated_at || row.created_at)}</Typography> },
  ];

  // Acciones en la última columna
  const rowActions = [
    { icon: <LayersIcon />, label: 'Valores', onClick: (row) => handleOpenValores(row) },
    { icon: <EditOutlinedIcon />, label: 'Editar', onClick: (row) => handleOpenModal(row) },
    { type: 'delete', label: 'Eliminar', onClick: (row) => setAtributoEliminar(row) }
  ];

  // Filtros de búsqueda (Según la guía de tu empresa)
  const filtersConfig = [
    {
      name: 'seUsaEnFiltro', label: 'Uso en Filtros', type: 'select',
      options: [
        { label: 'Todos', value: null },
        { label: 'Sí se usan', value: true },
        { label: 'No se usan', value: false }
      ]
    },
    {
      name: 'seUsaEnVariantes', label: 'Uso en Variantes', type: 'select',
      options: [
        { label: 'Todos', value: null },
        { label: 'Sí se usan', value: true },
        { label: 'No se usan', value: false }
      ]
    },
    {
      name: 'esObligatorio', label: 'Obligatorio', type: 'select',
      options: [
        { label: 'Todos', value: null },
        { label: 'Sí son obligatorios', value: true },
        { label: 'No son obligatorios', value: false }
      ]
    }
  ];

  return (
    <Box sx={{ pb: 6, width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}> Panel / Atributos </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#2C2B29' }}>Atributos</Typography>
      </Box>

      {/* AQUÍ INYECTAMOS LA TABLA GLOBAL DEL PROYECTO */}
      <AdminResourceTable
        rows={atributos}
        columns={columns}
        actions={rowActions}
        loading={loading}
        pagination={pagination}
        searchValue={searchValue}
        searchLabel="Buscar por nombre, código o tipo..."
        filterValues={filterValues}
        filters={filtersConfig}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        primaryActionLabel="Nuevo Atributo"
        onPrimaryAction={() => handleOpenModal()}
        emptyTitle="No hay atributos"
        emptyDescription="Comienza creando tu primer atributo."
      />

       <Dialog open={openValoresModal} onClose={handleCloseValoresModal} maxWidth="md" fullWidth>
        {/* Le decimos as="div" para que deje de ser <h2> y no choque */}
        <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">Valores</Typography>
          <IconButton onClick={handleCloseValoresModal} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        
        {/* ESTO FUE LO QUE SE NOS BORRÓ SIN QUERER: */}
        <DialogContent dividers sx={{ p: 0 }}>
            {seleccionado && (
              <ValoresList 
                atributoSeleccionado={seleccionado} 
                onChangeEvent={() => setHubieronCambios(true)} // <-- ESPIAMOS LOS CAMBIOS AQUI
              />
            )}
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
  );
};