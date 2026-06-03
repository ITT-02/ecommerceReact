import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, IconButton, Tooltip, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import { useStoreProfile } from '../../../../hooks/store/useStoreProfile';
import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';

const buildLocationLine = (address = {}) => {
  if (address.direccion_completa) return address.direccion_completa;

  if ((address.pais_codigo || 'PE') === 'PE') {
    return [
      address.direccion_linea,
      address.distrito,
      address.provincia,
      address.departamento,
      address.pais_nombre || 'Perú',
    ]
      .filter(Boolean)
      .join(', ');
  }

  return [
    address.direccion_linea,
    address.ciudad_texto || address.distrito,
    address.region_texto || address.departamento,
    address.codigo_postal,
    address.pais_nombre || address.pais_codigo,
  ]
    .filter(Boolean)
    .join(', ');
};

export const AddressCard = ({ address, onEdit }) => {
  const { setMainAddress, deleteAddress } = useStoreProfile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSetMain = () => {
    if (!address.es_principal) {
      setMainAddress(address.id);
    }
  };

  const handleDelete = async () => {
    await deleteAddress(address.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: address.es_principal ? 'primary.main' : 'divider',
          bgcolor: address.es_principal ? 'primary.50' : 'background.paper',
          transition: '0.2s',
          '&:hover': {
            boxShadow: 2,
            borderColor: 'primary.main',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {address.alias || 'Dirección de entrega'}
            </Typography>
            {address.es_principal && (
              <Chip label="Principal" size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
            )}
            <Chip
              label={address.pais_nombre || address.pais_codigo || 'Perú'}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={address.es_principal ? 'Dirección principal' : 'Marcar como principal'}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleSetMain}
                  sx={{
                    color: address.es_principal ? 'warning.main' : 'inherit',
                    cursor: address.es_principal ? 'default' : 'pointer',
                  }}
                  disableRipple={address.es_principal}
                >
                  {address.es_principal ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Editar">
              <IconButton size="small" onClick={onEdit} color="info">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Eliminar">
              <IconButton size="small" onClick={() => setDeleteDialogOpen(true)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <Box component="span" fontWeight={600}>
              Recibe:{' '}
            </Box>
            {address.destinatario} {address.telefono && `- Telf: ${address.telefono}`}
          </Typography>

          <Typography variant="body2">
            <Box component="span" fontWeight={600}>
              Dirección:{' '}
            </Box>
            {buildLocationLine(address) || 'Sin dirección registrada'}
          </Typography>

          {address.ubigeo && (
            <Typography variant="caption" color="text.secondary">
              UBIGEO: {address.ubigeo}
            </Typography>
          )}

          {address.referencia && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Ref: {address.referencia}
            </Typography>
          )}
        </Box>
      </Paper>

      <ConfirmDialog
        open={deleteDialogOpen}
        action="delete"
        title="Eliminar dirección"
        message={`¿Estás seguro que deseas eliminar la dirección "${address.alias || address.direccion_linea}"? Esta acción no se puede deshacer.`}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        confirmText="Sí, eliminar"
      />
    </>
  );
};

export default AddressCard;