import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { fmtDate, getModuleColor, moduleFromCode } from './roleHelpers';

export const RoleCard = ({ role, canManagePermissions, onDetail, onEdit, onAssign }) => {
  const isSuperAdmin = role.codigo === 'super_admin';
  const isCliente = role.codigo === 'cliente';

  const editDisabled = !role.puede_editar || isSuperAdmin;
  const assignDisabled = !canManagePermissions || isSuperAdmin || isCliente;

  const editTooltip = isSuperAdmin
    ? 'Rol protegido — no editable'
    : !role.puede_editar
    ? 'Sin permisos para editar este rol'
    : 'Editar nombre y descripción';

  const assignTooltip = isSuperAdmin
    ? 'Rol protegido — permisos fijos'
    : isCliente
    ? 'El cliente no recibe permisos administrativos'
    : !canManagePermissions
    ? 'Solo administrador o super_admin pueden asignar permisos'
    : 'Asignar permisos';

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow .15s ease',
        '&:hover': { boxShadow: 2 },
      }}
    >
      <CardHeader
        sx={{ pb: 1 }}
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: role.es_protegido ? '#fef3c7' : '#dbeafe',
              color: role.es_protegido ? '#92400e' : '#1e40af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {role.es_protegido ? (
              <GppGoodOutlinedIcon sx={{ fontSize: 22 }} />
            ) : (
              <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 22 }} />
            )}
          </Box>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {role.nombre}
          </Typography>
        }
        subheader={
          <Typography
            variant="caption"
            sx={{ fontFamily: 'ui-monospace, monospace', color: 'text.secondary' }}
          >
            {role.codigo}
          </Typography>
        }
        action={
          role.es_protegido ? (
            <Tooltip title="Rol del sistema. No puede crearse ni eliminarse.">
              <Chip
                size="small"
                label="Rol protegido"
                icon={<LockOutlinedIcon />}
                sx={{
                  mt: 0.5,
                  bgcolor: '#fef3c7',
                  color: '#92400e',
                  fontWeight: 500,
                  '& .MuiChip-icon': { color: '#92400e', fontSize: 14 },
                }}
              />
            </Tooltip>
          ) : null
        }
      />

      <CardContent sx={{ pt: 0, flex: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, mb: 1.5 }}>
          {role.descripcion || (
            <Box component="em" sx={{ color: '#94a3b8' }}>
              Sin descripción
            </Box>
          )}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
          <KeyOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            <Box component="b" sx={{ color: 'text.primary' }}>
              {role.total_permisos}
            </Box>{' '}
            permisos asignados
          </Typography>
        </Stack>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(role.permisos_preview || []).map((p, i) => {
            const isStr = typeof p === 'string';
            const codigo = isStr ? p : (p.codigo ?? p.code ?? p.permiso ?? '');
            const nombre = isStr ? p : (p.nombre ?? p.name ?? p.codigo ?? p.code ?? p);
            const descripcion = isStr ? '' : (p.descripcion ?? p.description ?? '');
            const c = getModuleColor(moduleFromCode(codigo));
            return (
              <Tooltip key={codigo || i} title={[codigo, descripcion].filter(Boolean).join(' — ') || nombre}>
                <Chip
                  size="small"
                  label={nombre}
                  sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 500, height: 22 }}
                />
              </Tooltip>
            );
          })}
          {role.total_permisos > (role.permisos_preview?.length || 0) && (
            <Chip
              size="small"
              variant="outlined"
              label={`+${role.total_permisos - role.permisos_preview.length} más`}
              sx={{ height: 22 }}
            />
          )}
          {role.total_permisos === 0 && (
            <Typography variant="caption" color="text.disabled">
              Sin permisos
            </Typography>
          )}
        </Box>
      </CardContent>

      <Divider />

      <CardActions sx={{ px: 2, py: 1, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {fmtDate(role.created_at)}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Ver detalle">
            <IconButton size="small" onClick={() => onDetail(role)}>
              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={editTooltip}>
            <span>
              <IconButton size="small" onClick={() => onEdit(role)} disabled={editDisabled}>
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={assignTooltip}>
            <span>
              <IconButton size="small" onClick={() => onAssign(role)} disabled={assignDisabled}>
                <KeyOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </CardActions>
    </Card>
  );
};
