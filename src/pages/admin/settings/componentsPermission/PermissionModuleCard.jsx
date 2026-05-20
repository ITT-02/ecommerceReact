import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Tooltip } from '@mui/material';

const getModuleLabel = (moduleName = '') => {
  if (!moduleName) return '';

  return moduleName
    .replaceAll('_', ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getModuleColor = (moduleName = '') => {
  const palette = ['primary', 'info', 'success', 'warning', 'error'];
  return palette[moduleName.length % palette.length];
};

export const PermissionModuleCard = ({ module, onViewModule }) => {
  const color = getModuleColor(module.modulo);

  return (
    <Card
      sx={{
        height: 140,
        borderRadius: 1,
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: (theme) => `5px solid ${theme.palette[color].main}`,
        transition: (theme) =>
          theme.transitions.create(['transform', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, height: '100%' }}>
        <Stack
          spacing={2}
          sx={{
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  letterSpacing: '0.24em',
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                }}
              >
                Módulo
              </Typography>

              <Typography
                variant="h6"
                noWrap
                sx={{
                  mt: 0.75,
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                {getModuleLabel(module.modulo)}
              </Typography>
            </Box>

         
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                maxWidth: 180,
                fontWeight: 500,
                color: (theme) => theme.palette[color].main,
                lineHeight: 1.25,
              }}
            >
              {module.total_permisos} permisos registrados
            </Typography>

            <Tooltip title="Ver permisos">
           <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onViewModule(module)}
              sx={{
                minWidth: 50,
                height:24,
                px: 0.75,
                borderRadius: 1,
                color: (theme) => theme.palette[color].main,
                borderColor: (theme) => theme.palette[color].main,
                bgcolor: 'background.paper',
                ml: 'auto',
                '& .MuiButton-startIcon': {
                  mr: 0,
                  ml: 0,
                },
                '&:hover': {
                  borderColor: (theme) => theme.palette[color].dark,
                  bgcolor: (theme) => theme.palette.action.hover,
                },
              }}
            />
          </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};