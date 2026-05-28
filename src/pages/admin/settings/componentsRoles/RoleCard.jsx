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
import { useTheme } from '@mui/material/styles';

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { fmtDate, getModuleColor, moduleFromCode } from './roleHelpers';

const getTone = (theme, toneName = 'neutral') => {
  const tones = theme.palette.custom.semantic.entityTone;

  return tones?.[toneName] || {
    bg: theme.palette.action.selected,
    fg: theme.palette.text.secondary,
    border: theme.palette.divider,
  };
};

export const RoleCard = ({ role, canManagePermissions, onDetail, onEdit, onAssign }) => {
  const theme = useTheme();

  const isSuperAdmin = role.codigo === 'super_admin';
  const isCliente = role.codigo === 'cliente';

  const editDisabled = !role.puede_editar || isSuperAdmin;
  const assignDisabled = !canManagePermissions || isSuperAdmin || isCliente;

  const protectedTone = getTone(theme, 'warning');
  const regularTone = getTone(theme, 'info');
  const roleTone = role.es_protegido ? protectedTone : regularTone;

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
        ? 'Solo super_admin pueden asignar permisos'
        : 'Asignar permisos';

  return (
    <Card
      variant="outlined"
      sx={(muiTheme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: muiTheme.transitions.create(['box-shadow', 'border-color'], {
          duration: muiTheme.transitions.duration.shorter,
        }),
        '&:hover': {
          boxShadow: muiTheme.palette.custom.shadows.md,
          borderColor: muiTheme.palette.custom.semantic.borderStrong,
        },
      })}
    >
      <CardHeader
        sx={{ pb: 1 }}
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: roleTone.bg,
              color: roleTone.fg,
              border: '1px solid',
              borderColor: roleTone.border,
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
            sx={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              color: 'text.secondary',
            }}
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
                  bgcolor: protectedTone.bg,
                  color: protectedTone.fg,
                  border: '1px solid',
                  borderColor: protectedTone.border,
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: protectedTone.fg,
                    fontSize: 14,
                  },
                }}
              />
            </Tooltip>
          ) : null
        }
      />

      <CardContent sx={{ pt: 0, flex: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ minHeight: 40, mb: 1.5 }}
        >
          {role.descripcion || (
            <Box component="em" sx={{ color: 'text.disabled' }}>
              Sin descripción
            </Box>
          )}
        </Typography>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: 'center',
          }}
        >
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
            const c = getModuleColor(moduleFromCode(codigo), theme);

            return (
              <Tooltip
                key={codigo || i}
                title={[codigo, descripcion].filter(Boolean).join(' — ') || nombre}
              >
                <Chip
                  size="small"
                  label={nombre}
                  sx={{
                    height: 22,
                    bgcolor: c.bg,
                    color: c.fg,
                    border: '1px solid',
                    borderColor: c.border || 'transparent',
                    fontWeight: 500,
                  }}
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