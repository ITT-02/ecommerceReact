import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { StatusChip } from '../../components/common/StatusChip';
import { useMyCommercialRequests } from '../../hooks/partners/useMyCommercialRequests';
import { formatDate } from '../../utils/formatters';

const STATUS_CONFIG = {
  no_solicitado: { label: 'Sin solicitud', color: 'default' },
  pendiente: { label: 'En revisión', color: 'warning' },
  aprobado: { label: 'Aprobado', color: 'success' },
  rechazado: { label: 'Rechazado', color: 'error' },
  suspendido: { label: 'Suspendido', color: 'error' },
};

const getStatusInfo = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.no_solicitado;

const DetailRow = ({ label, value }) => {
  if (!value) return null;

  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary">
        {value}
      </Typography>
    </Stack>
  );
};

const RequestCard = ({
  icon,
  title,
  description,
  request,
  profileStatus,
  approved,
  emptyActionLabel,
  emptyActionTo,
  approvedActionLabel,
  approvedActionTo,
}) => {
  const effectiveStatus = approved ? 'aprobado' : request?.estado || profileStatus || 'no_solicitado';
  const statusInfo = getStatusInfo(effectiveStatus);
  const hasRequest = Boolean(request?.id);

  return (
    <Card
      sx={(theme) => ({
        height: '100%',
        borderRadius: theme.palette.custom.radius.xs,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      })}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Box
              sx={(theme) => ({
                width: 44,
                height: 44,
                borderRadius: theme.palette.custom.radius.xs,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: 'action.hover',
                flexShrink: 0,
              })}
            >
              {icon}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="h5" sx={{ fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
                  {title}
                </Typography>
                <StatusChip label={statusInfo.label} color={statusInfo.color} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                {description}
              </Typography>
            </Box>
          </Stack>

          {approved && (
            <Alert severity="success" sx={{ borderRadius: (theme) => theme.palette.custom.radius.xs }}>
              Tu cuenta ya está aprobada para este flujo.
            </Alert>
          )}

          {!approved && effectiveStatus === 'pendiente' && (
            <Alert severity="warning" sx={{ borderRadius: (theme) => theme.palette.custom.radius.xs }}>
              Aliqora está revisando tu solicitud. Cuando se apruebe, se activará automáticamente en tu cuenta.
            </Alert>
          )}

          {!approved && effectiveStatus === 'rechazado' && (
            <Alert severity="error" sx={{ borderRadius: (theme) => theme.palette.custom.radius.xs }}>
              Tu solicitud fue rechazada. Puedes coordinar con Aliqora antes de enviar una nueva solicitud.
            </Alert>
          )}

          <Divider />

          {hasRequest ? (
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailRow label="Negocio" value={request.negocio_nombre} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailRow label="RUC / documento" value={request.ruc} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailRow label="Enviada" value={formatDate(request.created_at)} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailRow label="Revisada" value={request.revisado_en ? formatDate(request.revisado_en) : ''} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DetailRow label="Mensaje enviado" value={request.mensaje} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DetailRow label="Comentario de revisión" value={request.comentario_revision} />
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Todavía no tienes una solicitud registrada para esta opción.
            </Typography>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            {approved && approvedActionLabel && approvedActionTo && (
              <Button component={RouterLink} to={approvedActionTo} variant="contained">
                {approvedActionLabel}
              </Button>
            )}

            {!approved && effectiveStatus !== 'pendiente' && emptyActionLabel && emptyActionTo && (
              <Button component={RouterLink} to={emptyActionTo} variant="outlined">
                {emptyActionLabel}
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const MyCommercialRequestsPage = () => {
  const { data, loading, error } = useMyCommercialRequests();

  if (loading) {
    return <LoadingScreen message="Cargando tus solicitudes..." />;
  }

  const { perfil, mayorista, socioComercial, esMayoristaAprobado, esSocioComercialAprobado } = data;

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>
                Mis solicitudes
              </Typography>
              <Chip icon={<AssignmentTurnedInOutlinedIcon />} label="Cuenta comercial" variant="outlined" />
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
              Aquí puedes revisar si Aliqora aprobó tu cuenta mayorista o tu acceso como socio comercial.
            </Typography>
          </Box>

          <ErrorMessage message={error} />

          {(esMayoristaAprobado || esSocioComercialAprobado) && (
            <Alert severity="success" sx={{ borderRadius: (theme) => theme.palette.custom.radius.xs }}>
              Tienes al menos una condición comercial activa en tu cuenta.
            </Alert>
          )}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <RequestCard
                icon={<GroupsOutlinedIcon />}
                title="Cuenta mayorista"
                description="Para clientes aprobados que compran de forma recurrente o por volumen. Los precios mayoristas se activan solo si Aliqora aprueba tu cuenta."
                request={mayorista}
                profileStatus={perfil?.mayorista_estado}
                approved={esMayoristaAprobado}
                emptyActionLabel="Solicitar cuenta mayorista"
                emptyActionTo="/mayoristas"
                approvedActionLabel="Ver catálogo"
                approvedActionTo="/catalogo"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <RequestCard
                icon={<StorefrontOutlinedIcon />}
                title="Socio comercial"
                description="Para usuarios aprobados que podrán proponer productos con presentación, imágenes y seguimiento de ventas."
                request={socioComercial}
                profileStatus={perfil?.socio_comercial_estado}
                approved={esSocioComercialAprobado}
                emptyActionLabel="Solicitar ser socio"
                emptyActionTo="/solicitud-socio-comercial"
                approvedActionLabel="Proponer productos"
                approvedActionTo="/admin/mis-productos-socio"
              />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};
