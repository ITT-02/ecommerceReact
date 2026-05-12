import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Typography, IconButton, Divider, alpha } from '@mui/material';
import { Add as AddIcon, EditOutlined as EditIcon, DeleteOutlined as DeleteIcon } from '@mui/icons-material';
import { useAtributoValores } from '../../../../hooks/catalog/useAtributoValores';
import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';
import { ValorForm } from './ValorForm';

export const ValoresList = ({ atributoSeleccionado, onChangeEvent }) => {
  const { valores, loading, fetchValores, create, update, remove } = useAtributoValores(atributoSeleccionado?.id);
  const [openModal, setOpenModal] = useState(false);
  const [valorEditar, setValorEditar] = useState(null);
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
      if (valorEditar) await update(valorEditar.id, formData);
      else await create(formData);
      setOpenModal(false);
      if (onChangeEvent) onChangeEvent();
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
      if (onChangeEvent) onChangeEvent();
    } catch (error) {
      alert('Error eliminando valor');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!atributoSeleccionado) return null;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, overflowX: 'hidden', width: '100%', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 }, width: '100%' }}>
        
        {/* PANEL IZQUIERDO - INFO Y ACCIONES */}
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' }, minWidth: 0 }}>
          <Box sx={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1 }}>
                Gestión de Atributo
              </Typography>
              <Typography variant="h4" sx={{ color: '#D9984A', fontWeight: 700, mt: 0.5 }}>
                {atributoSeleccionado.nombre}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estadísticas:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {valores.length} {valores.length === 1 ? 'registro actual' : 'registros actuales'}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary" // Usar color primary del tema en vez de negro manual
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{ textTransform: 'none', fontWeight: 600, py: 1.5, boxShadow: 3 }}
            >
              Nuevo valor
            </Button>
          </Box>
        </Box>

        {/* PANEL DERECHO - LISTA DE VALORES */}
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(66.66% - 16px)' }, minWidth: 0, overflow: 'auto' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Valores configurados
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress size={32} sx={{ opacity: 0.5 }} />
            </Box>
          ) : (
            <Box sx={{ minHeight: 200 }}>
              {valores.length === 0 ? (
                <Paper
                  sx={{
                    p: 5, textAlign: 'center', border: '1px dashed', borderColor: 'divider',
                    bgcolor: 'background.paper', boxShadow: 'none',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">Aún no has agregado ningún valor.</Typography>
                  <Typography variant="body2" color="text.disabled" mt={1}>(Ej: Pequeño, Rojo, Algodón, etc.)</Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
                  {valores.map((v) => (
                    <Box key={v.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                      <Paper
                        sx={{
                          p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          border: '1px solid', borderColor: 'divider', borderRadius: 2, 
                          bgcolor: 'background.paper', boxShadow: 1, transition: 'all 0.2s', 
                          '&:hover': { borderColor: 'primary.main', boxShadow: 3, transform: 'translateY(-2px)' },
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                          {v.color_hex ? (
                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: v.color_hex, flexShrink: 0, border: '1px solid', borderColor: 'divider' }} />
                          ) : (
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#D9984A', flexShrink: 0 }} />
                          )}
                          <Typography sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {v.valor}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                          <IconButton 
                            size="small" 
                            color="success" // <-- Cambiado de "primary" a "success" (Verde)
                            onClick={() => handleOpenModal(v)} 
                            sx={{ 
                              // 👇 Cambiamos theme.palette.primary.main por theme.palette.success.main
                              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), 
                              '&:hover': { bgcolor: (theme) => alpha(theme.palette.success.main, 0.2) } 
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          
                          <IconButton 
                            size="small" 
                            color="error" // Rojo de alerta
                            onClick={() => setValorEliminar(v)} 
                            sx={{ 
                              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1), 
                              '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.2) } 
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {openModal && (
        <ValorForm
          open={openModal} isEdit={!!valorEditar} valorInicial={valorEditar}
          tipoDatoPadre={atributoSeleccionado.tipo_dato} onClose={() => setOpenModal(false)} onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={Boolean(valorEliminar)} action="delete" title="Eliminar valor"
        message={`¿Estás seguro que deseas eliminar "${valorEliminar?.valor}"?`}
        onCancel={() => setValorEliminar(null)} onConfirm={confirmarEliminacionValor} loading={isDeleting}
      />
    </Box>
  );
};