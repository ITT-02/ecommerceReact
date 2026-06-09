import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useCommercialPartnerAccountRequestsAdmin } from '../../../hooks/partners/useCommercialPartners';
import {
  emptyPagination,
  getDefaultAdminDateFilters,
  isDateRangeInvalid,
} from '../../../utils/defaultDateRange';

const statusLabel = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  suspendido: 'Suspendido',
};

const statusColor = {
  pendiente: 'warning',
  aprobado: 'success',
  rechazado: 'error',
  suspendido: 'default',
};

const decisionLabel = {
  aprobar: 'aprobar',
  rechazar: 'rechazar',
};

const DetailLine = ({ label, value }) => (
  <div>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={700}>{value || '-'}</Typography>
  </div>
);

export const CommercialPartnerRequestsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [filters, setFilters] = useState(() => getDefaultAdminDateFilters());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogMode, setDialogMode] = useState('detail');
  const [pendingReviewAction, setPendingReviewAction] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [notice, setNotice] = useState('');

  const [approvedPageNumber, setApprovedPageNumber] = useState(1);
  const [approvedPageSize, setApprovedPageSize] = useState(10);
  const [approvedSearch, setApprovedSearch] = useState('');

  const {
    requests,
    pagination,
    loading,
    fetching,
    saving,
    error,
    reviewRequest,
  } = useCommercialPartnerAccountRequestsAdmin({
    pageNumber,
    pageSize,
    estado: estado || null,
    search,
    fechaInicio: filters.fechaInicio || null,
    fechaFin: filters.fechaFin || null,
  });

  const {
    requests: approvedPartners,
    pagination: approvedPagination,
    loading: approvedLoading,
    fetching: approvedFetching,
    error: approvedError,
  } = useCommercialPartnerAccountRequestsAdmin({
    pageNumber: approvedPageNumber,
    pageSize: approvedPageSize,
    estado: 'aprobado',
    search: approvedSearch,
  });

  const invalidDateRange = isDateRangeInvalid({ values: filters });
  const isReviewMode = dialogMode === 'review';
  const canReviewSelected = selectedRequest?.estado === 'pendiente';

  const openDetailDialog = (row) => {
    setSelectedRequest(row);
    setDialogMode('detail');
    setReviewComment(row?.comentario_revision || '');
  };

  const openReviewDialog = (row) => {
    setSelectedRequest(row);
    setDialogMode('review');
    setReviewComment(row?.comentario_revision || '');
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setDialogMode('detail');
    setPendingReviewAction('');
    setReviewComment('');
  };

  const handleReview = async () => {
    if (!selectedRequest || !pendingReviewAction) return;

    await reviewRequest({
      requestId: selectedRequest.id,
      action: pendingReviewAction,
      comment: reviewComment,
    });

    setNotice(
      pendingReviewAction === 'aprobar'
        ? 'Socio comercial aprobado. El usuario ya puede ingresar al módulo de socio.'
        : 'Solicitud de socio comercial rechazada.'
    );
    closeDialog();
  };

  const columns = [
    { field: 'nombre_completo', headerName: 'Usuario', width: 220, emptyText: 'Sin nombre' },
    { field: 'negocio_nombre', headerName: 'Negocio', width: 220, emptyText: '-' },
    { field: 'ruc', headerName: 'RUC / Doc.', width: 130, emptyText: '-' },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 140,
      renderCell: (row) => (
        <Chip
          size="small"
          label={statusLabel[row.estado] || row.estado}
          color={statusColor[row.estado] || 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 150,
      renderCell: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'),
    },
  ];

  const approvedColumns = [
    { field: 'nombre_completo', headerName: 'Socio', width: 220, emptyText: 'Sin nombre' },
    { field: 'negocio_nombre', headerName: 'Negocio', width: 220, emptyText: '-' },
    { field: 'ruc', headerName: 'RUC / Doc.', width: 130, emptyText: '-' },
    { field: 'telefono', headerName: 'Teléfono', width: 140, emptyText: '-' },
    {
      field: 'ya_es_socio',
      headerName: 'Acceso',
      width: 130,
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.ya_es_socio ? 'Activo' : 'Sin rol'}
          color={row.ya_es_socio ? 'success' : 'warning'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'revisado_en',
      headerName: 'Aprobado',
      width: 150,
      renderCell: (row) => (row.revisado_en ? new Date(row.revisado_en).toLocaleDateString() : '-'),
    },
  ];

  return (
    <PlaceholderPage
      title="Solicitudes de socios"
      description="Evalúa usuarios que quieren vender productos como socios comerciales de Aliqora."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || approvedError} />
        {invalidDateRange && <ErrorMessage message="La fecha inicial no puede ser mayor que la fecha final." />}

        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}

        <AdminResourceTable
          rows={invalidDateRange ? [] : requests}
          columns={columns}
          actions={[
            {
              type: 'view',
              label: 'Ver detalle',
              onClick: openDetailDialog,
            },
            {
              type: 'review',
              label: 'Evaluar solicitud',
              visible: (row) => row.estado === 'pendiente',
              onClick: openReviewDialog,
            },
          ]}
          loading={loading || fetching}
          pagination={invalidDateRange ? emptyPagination({ pageNumber, pageSize }) : pagination}
          searchValue={search}
          searchLabel="Buscar"
          filterValues={{ estado, ...filters }}
          filters={[
            {
              name: 'estado',
              label: 'Estado',
              type: 'select',
              width: 180,
              options: [
                { label: 'Todos', value: '' },
                { label: 'Pendientes', value: 'pendiente' },
                { label: 'Aprobados', value: 'aprobado' },
                { label: 'Rechazados', value: 'rechazado' },
                { label: 'Suspendidos', value: 'suspendido' },
              ],
            },
            {
              name: 'fechaInicio',
              label: 'Desde',
              type: 'date',
              width: 160,
              maxDate: filters.fechaFin || undefined,
            },
            {
              name: 'fechaFin',
              label: 'Hasta',
              type: 'date',
              width: 160,
              minDate: filters.fechaInicio || undefined,
            },
          ]}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          onFilterChange={(name, value) => {
            if (name === 'estado') setEstado(value);
            else setFilters((current) => ({ ...current, [name]: value }));
            setPageNumber(1);
          }}
          onResetFilters={() => {
            setEstado('');
            setSearch('');
            setFilters(getDefaultAdminDateFilters());
            setPageNumber(1);
          }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPageNumber(1);
          }}
          emptyTitle="No hay solicitudes"
          emptyDescription="Cuando un usuario solicite ser socio comercial, aparecerá aquí."
          maxHeight={360}
        />

        <Box
          sx={(theme) => ({
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: theme.palette.custom.radius.xs,
            p: { xs: 1.5, md: 2 },
          })}
        >
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Socios comerciales aprobados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios con acceso activo al panel de socio.
              </Typography>
            </Box>

            <AdminResourceTable
              rows={approvedPartners}
              columns={approvedColumns}
              actions={[
                {
                  type: 'view',
                  label: 'Ver detalle',
                  onClick: openDetailDialog,
                },
              ]}
              loading={approvedLoading || approvedFetching}
              pagination={approvedPagination}
              searchValue={approvedSearch}
              searchLabel="Buscar socio"
              onSearchChange={(value) => {
                setApprovedSearch(value);
                setApprovedPageNumber(1);
              }}
              onResetFilters={() => {
                setApprovedSearch('');
                setApprovedPageNumber(1);
              }}
              onPageChange={setApprovedPageNumber}
              onPageSizeChange={(value) => {
                setApprovedPageSize(value);
                setApprovedPageNumber(1);
              }}
              emptyTitle="Sin socios aprobados"
              emptyDescription="Cuando apruebes una solicitud, el socio aparecerá aquí."
              maxHeight={360}
            />
          </Stack>
        </Box>
      </Stack>

      <AdminDialog
        open={Boolean(selectedRequest)}
        onClose={closeDialog}
        title={isReviewMode ? 'Evaluar solicitud de socio' : 'Detalle de solicitud de socio'}
        icon={isReviewMode ? <HandshakeOutlinedIcon /> : <VisibilityOutlinedIcon />}
        maxWidth="sm"
        loading={saving}
        actions={(
          <>
            <Button onClick={closeDialog} disabled={saving}>Cerrar</Button>
            {isReviewMode && (
              <>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => setPendingReviewAction('rechazar')}
                  disabled={!canReviewSelected || saving}
                >
                  Rechazar solicitud
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setPendingReviewAction('aprobar')}
                  disabled={!canReviewSelected || saving}
                >
                  Aprobar solicitud
                </Button>
              </>
            )}
          </>
        )}
      >
        {selectedRequest && (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Usuario" value={selectedRequest.nombre_completo || selectedRequest.usuario_id} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Negocio" value={selectedRequest.negocio_nombre} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="RUC / documento" value={selectedRequest.ruc || selectedRequest.documento_identidad} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Teléfono" value={selectedRequest.telefono || selectedRequest.perfil_telefono} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Estado" value={statusLabel[selectedRequest.estado] || selectedRequest.estado} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DetailLine label="Mensaje" value={selectedRequest.mensaje} />
              </Grid>
            </Grid>

            {selectedRequest.ya_es_socio && (
              <Alert severity="info">Este usuario ya tiene el rol socio comercial.</Alert>
            )}

            {isReviewMode ? (
              <TextField
                label="Comentario de revisión"
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                helperText="Este comentario será visible como resultado de revisión para el usuario."
                fullWidth
                multiline
                minRows={2}
              />
            ) : selectedRequest.comentario_revision ? (
              <Alert severity="info">Comentario de revisión: {selectedRequest.comentario_revision}</Alert>
            ) : null}
          </Stack>
        )}
      </AdminDialog>

      <ConfirmDialog
        open={Boolean(pendingReviewAction)}
        action={pendingReviewAction === 'aprobar' ? 'approve' : 'warning'}
        title={pendingReviewAction === 'aprobar' ? 'Aprobar socio comercial' : 'Rechazar solicitud de socio'}
        message={
          pendingReviewAction === 'aprobar'
            ? '¿Deseas aprobar esta solicitud? El usuario recibirá acceso como socio comercial.'
            : '¿Deseas rechazar esta solicitud? El usuario verá el resultado en Mis solicitudes.'
        }
        confirmText={pendingReviewAction ? decisionLabel[pendingReviewAction] : 'Confirmar'}
        loading={saving}
        onCancel={() => setPendingReviewAction('')}
        onConfirm={handleReview}
      />
    </PlaceholderPage>
  );
};
