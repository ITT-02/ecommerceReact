import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Switch,
  Stack,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LayersIcon from '@mui/icons-material/Layers';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import LabelIcon from '@mui/icons-material/Label';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { PageHeader } from '../../../components/common/PageHeader';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'; 
import { useAtributos } from "../../../hooks/catalog/useAttributes";
import { useAtributoValores } from "../../../hooks/catalog/useAtributoValores";
import { AtributoForm } from './components/AtributoForm';
import { ValoresList } from './components/ValoresList';

// Agregamos refreshKey a las dependencias de ValoresSummary
const ValoresSummary = ({ atributoId, refreshKey }) => {
  const { valores, loading, fetchValores } = useAtributoValores(atributoId);
  
  // Al cambiar refreshKey, reejecuta fetchValores silenciosamente
  useEffect(() => { 
    fetchValores(); 
  }, [fetchValores, refreshKey]);

  if (loading) return <CircularProgress size={16} color="inherit" sx={{ opacity: 0.5 }} />;
  if (!valores || valores.length === 0) return <Typography variant="caption" color="text.disabled">-</Typography>;

  const maxDisplay = 3;
  const displayed = valores.slice(0, maxDisplay);
  const extra = valores.length - maxDisplay;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {displayed.map(v => (
        <Chip key={v.id} label={v.valor} size="small" sx={{ bgcolor: '#f5f5f5', color: '#555', borderRadius: 1, height: 24, fontSize: '0.75rem', border: '1px solid #eee' }} />
      ))}
      {extra > 0 && <Chip label={`+${extra}`} size="small" sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', color: '#888', borderRadius: 1, height: 24, fontSize: '0.75rem' }} />}
    </Stack>
  );
};

const getIconForAttr = (name) => {
  const n = name.toLowerCase();
  if (n.includes('tamaño')) return <AspectRatioIcon sx={{ color: '#D9984A', fontSize: 20 }} />;
  if (n.includes('color')) return <ColorLensIcon sx={{ color: '#D9984A', fontSize: 20 }} />;
  if (n.includes('material')) return <CategoryIcon sx={{ color: '#D9984A', fontSize: 20 }} />;
  if (n.includes('acabado')) return <SettingsBrightnessIcon sx={{ color: '#D9984A', fontSize: 20 }} />;
  if (n.includes('cierre')) return <LockOutlineIcon sx={{ color: '#D9984A', fontSize: 20 }} />;
  return <LabelIcon sx={{ color: '#D9984A', fontSize: 20 }} />;
};

export const AttributesPage = () => {
  const { atributos, fetchAtributos, create, update, remove } = useAtributos();
  const [openModal, setOpenModal] = useState(false);
  const [atributoEditar, setAtributoEditar] = useState(null);
  
  const [seleccionado, setSeleccionado] = useState(null);
  const [openValoresModal, setOpenValoresModal] = useState(false);
  
  // NUEVO: El estado que fuerza a las cajitas del fondo a repintarse
  const [refreshKey, setRefreshKey] = useState(0);

  const [atributoEliminar, setAtributoEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    fetchAtributos();
  }, [fetchAtributos]);

  const handleOpenModal = (atributo = null) => {
    setAtributoEditar(atributo);
    setOpenModal(true);
    handleCloseMenu();
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
      if (seleccionado?.id === atributoEliminar.id) setSeleccionado(null);
      setAtributoEliminar(null); 
    } catch (error) { 
      alert('Error eliminando el atributo'); 
    } finally {
      setIsDeleting(false);
    }
  };

  const pedirEliminarAtributo = (attr) => {
    handleCloseMenu();
    setAtributoEliminar(attr); 
  };

  const handleToggleInline = async (attr, field) => {
    const newValue = !attr[field];
    try { await update(attr.id, { [field]: newValue }); } catch (error) { alert('Error al actualizar'); }
  };

  const handleOpenMenu = (event, attr) => {
    setSeleccionado(attr);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => setAnchorEl(null);

  const handleOpenValoresModal = () => {
    if (!seleccionado) {
      alert("Por favor, selecciona un atributo de la tabla primero haciendo clic en él.");
      return;
    }
    setOpenValoresModal(true);
  };

  // NUEVO: Función para cerrar el modal de valores. Notifica a toda la tabla que recargue.
  const handleCloseValoresModal = () => {
    setOpenValoresModal(false);
    setRefreshKey(prev => prev + 1); // Suma un número. Esto obliga a la tabla a refrescar solos
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return { fecha: '-', hora: '' };
    const d = new Date(fechaString);
    return {
      fecha: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      hora: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <Box sx={{ pb: 6, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>
            Panel / Atributos
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#2C2B29' }}>Atributos</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Configura atributos y valores para filtros y variantes
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
             variant="contained" sx={{ bgcolor: '#D9984A', '&:hover': { bgcolor: '#C2843A' }, borderRadius: 2, textTransform: 'none', px: 3, boxShadow: 'none' }}
             startIcon={<AddIcon />} onClick={() => handleOpenModal()}
          >
            Nuevo atributo
          </Button>
          <Button 
             variant="outlined" sx={{ borderColor: '#D9984A', color: '#D9984A', bgcolor: '#fff', '&:hover': { bgcolor: 'rgba(217, 152, 74, 0.05)', borderColor: '#C2843A' }, borderRadius: 2, textTransform: 'none', px: 3 }}
             startIcon={<LayersIcon fontSize="small" />}
             onClick={handleOpenValoresModal}
          >
            Gestionar valores
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0px 4px 24px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0', width: '100%' }}>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#fafafa', '& th': { color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid #eee', py: 2 } }}>
              <TableCell sx={{ pl: 4 }}>Nombre</TableCell>
              <TableCell>Valores (ejemplos)</TableCell>
              <TableCell align="center">Tipo de dato</TableCell>
              <TableCell align="center">Uso</TableCell>
              <TableCell align="center">Filtrable</TableCell>
              <TableCell align="center">Variante</TableCell>
              <TableCell align="center">Activo</TableCell>
              <TableCell>Actualizado ↓</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {atributos.length === 0 && (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}>No hay atributos creados</TableCell></TableRow>
            )}
            {atributos.map((attr) => {
              const esSeleccionado = seleccionado?.id === attr.id;
              const { fecha, hora } = formatFecha(attr.updated_at || attr.created_at);

              return (
                <TableRow 
                  key={attr.id} hover onClick={() => setSeleccionado(attr)}
                  sx={{ cursor: 'pointer', bgcolor: esSeleccionado ? 'rgba(217, 152, 74, 0.15)' : 'inherit', '& td': { borderBottom: '1px solid #f5f5f5', py: 2.5 } }}
                >
                  <TableCell sx={{ pl: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 36, height: 36, bgcolor: '#FFFaf0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fbeedb' }}>
                        {getIconForAttr(attr.nombre)}
                      </Box>
                      <Typography sx={{ fontWeight: 600, color: esSeleccionado ? '#D9984A' : '#333' }}>{attr.nombre}</Typography>
                    </Stack>
                  </TableCell>
                  
                  {/* AQUÍ SE PASA EL REFRESH KEY */}
                  <TableCell><ValoresSummary atributoId={attr.id} refreshKey={refreshKey} /></TableCell>
                  
                  <TableCell align="center"><Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>{attr.tipo_dato}</Typography></TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {attr.se_usa_en_filtro && attr.se_usa_en_variantes ? 'Ambos' : (attr.se_usa_en_filtro ? 'Filtros' : 'Variantes')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center"><Switch size="small" color="success" checked={attr.se_usa_en_filtro} onClick={(e) => { e.stopPropagation(); handleToggleInline(attr, 'se_usa_en_filtro') }} /></TableCell>
                  <TableCell align="center"><Switch size="small" color="success" checked={attr.se_usa_en_variantes} onClick={(e) => { e.stopPropagation(); handleToggleInline(attr, 'se_usa_en_variantes') }} /></TableCell>
                  <TableCell align="center"><Switch size="small" color="success" checked={attr.es_obligatorio} onClick={(e) => { e.stopPropagation(); handleToggleInline(attr, 'es_obligatorio') }} /></TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#555', fontSize: '0.85rem' }}>{fecha}</Typography>
                    {hora && <Typography variant="caption" sx={{ color: 'text.disabled' }}>{hora}</Typography>}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      sx={{ border: '1px solid #eee', borderRadius: 1.5, bgcolor: '#fff' }} 
                      onClick={(e) => { e.stopPropagation(); handleOpenMenu(e, attr); }}
                    >
                      <MoreHorizIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}
        PaperProps={{ elevation: 3, sx: { borderRadius: 2, mt: 1, minWidth: 150 } }}
      >
        <MenuItem onClick={() => handleOpenModal(seleccionado)}>
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> Editar atributo
        </MenuItem>
        <MenuItem onClick={() => { handleCloseMenu(); handleOpenValoresModal(); }}>
          <LayersIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> Gestionar valores
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => pedirEliminarAtributo(seleccionado)} sx={{ color: 'error.main' }}>
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      <Dialog 
        open={openValoresModal} 
        onClose={handleCloseValoresModal} // <-- Usamos la función que refresca todo 
        maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#fbfbfb' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">Configuración de Valores</Typography>
          <IconButton onClick={handleCloseValoresModal} size="small" sx={{ bgcolor: '#eee' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
            {seleccionado && <ValoresList atributoSeleccionado={seleccionado} />}
        </DialogContent>
      </Dialog>

      {openModal && (
        <AtributoForm open={openModal} isEdit={!!atributoEditar} atributoInicial={atributoEditar} onClose={() => setOpenModal(false)} onSave={handleSaveAttr} />
      )}

      <ConfirmDialog
        open={Boolean(atributoEliminar)}
        action="delete"
        title="Eliminar atributo"
        message={`¿Estás seguro de que deseas eliminar permanentemente el atributo "${atributoEliminar?.nombre}" y TODOS los valores que tiene registrados dentro?`}
        onCancel={() => setAtributoEliminar(null)}
        onConfirm={confirmarEliminacion}
        loading={isDeleting}
      />
    </Box>
  );
};