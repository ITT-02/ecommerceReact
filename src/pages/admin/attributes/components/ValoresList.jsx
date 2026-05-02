import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Typography, Chip } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAtributoValores } from '../../../../hooks/catalog/useAtributoValores';
import { ConfirmDialog } from '../../../../components/common/ConfirmDialog'; // <-- IMPORTAMOS EL DIÁLOGO MÁGICO
import { ValorForm } from './ValorForm';

export const ValoresList = ({ atributoSeleccionado }) => {
  const { valores, loading, fetchValores, create, update, remove } = useAtributoValores(atributoSeleccionado?.id);
  const [openModal, setOpenModal] = useState(false);
  const [valorEditar, setValorEditar] = useState(null);

  // Estados para eliminar valores limpiamente
  const [valorEliminar, setValorEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (atributoSeleccionado) fetchValores();
  }, [atributoSeleccionado, fetchValores]);

  const handleOpenModal = (valor = null) => {
    setValorEditar(valor);
    setOpenModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (valorEditar) {
        await update(valorEditar.id, formData);
      } else {
        await create(formData);
      }
      setOpenModal(false);
    } catch (error) {
      alert('Error guardando valor');
    }
  };

  const confirmarEliminacionValor = async () => {
    if (!valorEliminar) return;
    setIsDeleting(true);
    try {
      await remove(valorEliminar.id);
      setValorEliminar(null);
    } catch (error) {
      alert('Error eliminando valor');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!atributoSeleccionado) return null;

  return (
    <Paper sx={{ p: 3, border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #D9984A', borderRadius: 2, px: 2, py: 0.5, mb: 3, bgcolor: '#fffdf9' }}>
         <Typography sx={{ color: '#D9984A', fontWeight: 600 }}>Atributo: {atributoSeleccionado.nombre}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
         <Typography variant="body2" color="text.secondary">Total registrados ({valores.length})</Typography>
         <Button 
            variant="outlined" size="small" startIcon={<AddIcon />} 
            onClick={() => handleOpenModal()}
            sx={{ borderColor: '#e0e0e0', color: '#2C2B29', bgcolor: '#fff', textTransform: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
         >
            Agregar valor
         </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress size={24} color="inherit" sx={{opacity: 0.5}} /></Box>
      ) : (
        <Paper sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, minHeight: 120, p: 3, borderRadius: 2, border: '1px dashed #e0e0e0', bgcolor: '#fff', boxShadow: 'none' }}>
           {valores.length === 0 && <Typography variant="body2" color="text.disabled" sx={{ m: 'auto' }}>Aún no has agregado ningún valor (Ej: Pequeño, Rojo, etc.)</Typography>}
           {valores.map((v) => (
             <Chip
                key={v.id}
                label={v.valor}
                onClick={() => handleOpenModal(v)}
                onDelete={() => setValorEliminar(v)} // Abre el nuevo modal de confirmación en lugar del viejo confirm()
                deleteIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                sx={{ 
                   bgcolor: '#f5f5f5', 
                   border: '1px solid #ddd', 
                   borderRadius: 1.5,
                   fontWeight: 500,
                   px: 0.5,
                   py: 2,
                   transition: 'all 0.2s ease',
                   '& .MuiChip-label': { px: 1.5 },
                   '&:hover': { bgcolor: '#fff', borderColor: '#ccc', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
                }}
                icon={v.color_hex ? (
                   <Box sx={{ ml: 1.5, width: 14, height: 14, borderRadius: '50%', bgcolor: v.color_hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }} />
                ) : undefined}
             />
           ))}
        </Paper>
      )}

      {openModal && (
        <ValorForm
          open={openModal}
          isEdit={!!valorEditar}
          valorInicial={valorEditar}
          tipoDatoPadre={atributoSeleccionado.tipo_dato}
          onClose={() => setOpenModal(false)}
          onSave={handleSave}
        />
      )}

      {/* MODAL BONITO DE ELIMINACIÓN DE VALORES */}
      <ConfirmDialog
        open={Boolean(valorEliminar)}
        action="delete"
        title="Eliminar valor de atributo"
        message={`¿Estás seguro que deseas eliminar el valor "${valorEliminar?.valor}"? Si algún producto usa actualmente este valor, podría dejar de mostrarse correctamente.`}
        onCancel={() => setValorEliminar(null)}
        onConfirm={confirmarEliminacionValor}
        loading={isDeleting}
      />
    </Paper>
  );
};