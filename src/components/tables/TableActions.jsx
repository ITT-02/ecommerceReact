// Acciones estándar para filas de tabla.

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IconButton, Stack, Tooltip } from '@mui/material';

export const TableActions = ({ onView, onEdit, onDelete }) => {
  return (
    <Stack direction="row" spacing={0.5}>
      {onView && <Tooltip title="Ver"><IconButton size="small" onClick={onView}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>}
      {onEdit && <Tooltip title="Editar"><IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton></Tooltip>}
      {onDelete && <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={onDelete}><DeleteIcon fontSize="small" /></IconButton></Tooltip>}
    </Stack>
  );
};
