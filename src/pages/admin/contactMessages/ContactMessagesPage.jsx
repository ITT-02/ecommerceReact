// Página administrativa: mensajes recibidos desde formulario público de contacto.

import { useMemo, useState } from 'react';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PageHeader } from '../../../components/common/PageHeader';
import { SystemMessageGrid } from '../../../components/common/SystemMessageCard';
import { useAuth } from '../../../hooks/auth/useAuth';
import { getDefaultAdminDateRange, isDateRangeInvalid } from '../../../utils/defaultDateRange';
import { useAdminContactMessages } from '../../../hooks/store/useContactMessages';

const statusOptions = [
  { label: 'Nuevo', value: 'nuevo' },
  { label: 'Leído', value: 'leido' },
  { label: 'Respondido', value: 'respondido' },
  { label: 'Archivado', value: 'archivado' },
];

const reasonOptions = [
  { label: 'Consulta general', value: 'Consulta general' },
  { label: 'Registro como mayorista', value: 'Registro como mayorista' },
  { label: 'Cotización personalizada', value: 'Cotización personalizada' },
  { label: 'Seguimiento de pedido', value: 'Seguimiento de pedido' },
  { label: 'Pagos y comprobantes', value: 'Pagos y comprobantes' },
];

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const getStatusColor = (estado) => {
  if (estado === 'nuevo') return 'warning';
  if (estado === 'leido') return 'info';
  if (estado === 'respondido') return 'success';
  return 'default';
};

export const ContactMessagesPage = () => {
  const { roles = [] } = useAuth();
  const isSuperAdmin = roles.includes('super_admin');

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [motivo, setMotivo] = useState('');
  const initialDateRange = useMemo(() => getDefaultAdminDateRange(), []);
  const [fechaInicio, setFechaInicio] = useState(initialDateRange.fechaInicio);
  const [fechaFin, setFechaFin] = useState(initialDateRange.fechaFin);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [operationError, setOperationError] = useState('');

  const rangoFechasInvalido = useMemo(() => isDateRangeInvalid({ fechaInicio, fechaFin }), [fechaInicio, fechaFin]);

  const {
    messages,
    pagination,
    loading,
    fetching,
    saving,
    error,
    markAsRead,
    deleteMessage,
  } = useAdminContactMessages({
    pageNumber,
    pageSize,
    search,
    estado: estado || null,
    motivo: motivo || null,
    fechaInicio: rangoFechasInvalido ? null : fechaInicio || null,
    fechaFin: rangoFechasInvalido ? null : fechaFin || null,
  });

  const unreadCount = useMemo(
    () => messages.filter((message) => message.estado === 'nuevo').length,
    [messages],
  );

  const handleOpenMessage = async (message) => {
    setSelectedMessage(message);
    if (message.estado === 'nuevo') {
      await markAsRead(message.id);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete?.id) return;

    try {
      await deleteMessage(messageToDelete.id);
      setMessageToDelete(null);
      setOperationError('');
    } catch (err) {
      setOperationError(err?.response?.data?.message || err.message || 'No se pudo eliminar el mensaje.');
    }
  };

  const columns = [
    {
      field: 'estado',
      headerName: 'Estado',
      renderCell: (row) => (
        <Chip size="small" color={getStatusColor(row.estado)} variant="outlined" label={row.estado || 'nuevo'} />
      ),
    },
    {
      field: 'nombre',
      headerName: 'Cliente',
      minWidth: 190,
      renderCell: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={800}>{row.nombre}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>{row.email}</Typography>
          {row.whatsapp && <Typography variant="caption" color="text.secondary">{row.whatsapp}</Typography>}
        </Box>
      ),
    },
    { field: 'motivo', headerName: 'Motivo', minWidth: 180 },
    {
      field: 'mensaje',
      headerName: 'Mensaje',
      minWidth: 280,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ maxWidth: 420 }}>
          {row.mensaje?.length > 130 ? `${row.mensaje.slice(0, 130)}...` : row.mensaje}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Fecha',
      minWidth: 150,
      renderCell: (row) => formatDateTime(row.created_at),
    },
  ];

  const actions = [
    {
      type: 'view',
      label: 'Ver mensaje',
      onClick: handleOpenMessage,
    },
    {
      type: 'receipt',
      label: 'Marcar como leído',
      icon: <MarkEmailReadOutlinedIcon sx={{ fontSize: 17 }} />,
      visible: (row) => row.estado === 'nuevo',
      onClick: async (row) => markAsRead(row.id),
    },
    {
      type: 'delete',
      label: 'Eliminar mensaje',
      visible: () => isSuperAdmin,
      onClick: (row) => setMessageToDelete(row),
    },
  ];

  return (
    <Stack spacing={2}>
      <PageHeader
        title="Mensajes de contacto"
        description="Seguimiento de consultas enviadas desde la tienda pública, programa mayorista y formularios comerciales."
      />

      <ErrorMessage message={rangoFechasInvalido ? 'La fecha inicio no puede ser mayor que la fecha fin.' : operationError || error} />
  

      <AdminResourceTable
        rows={messages}
        columns={columns}
        actions={actions}
        loading={loading || fetching || saving}
        pagination={pagination}
        searchValue={search}
        searchLabel="Buscar por nombre, email, WhatsApp o mensaje"
        filterValues={{ estado, motivo, fechaInicio, fechaFin }}
        filters={[
          { name: 'estado', label: 'Estado', type: 'select', options: statusOptions, width: 145 },
          { name: 'motivo', label: 'Motivo', type: 'select', options: reasonOptions, width: 210 },
          { name: 'fechaInicio', label: 'Desde', type: 'date', width: 155, maxDate: fechaFin || undefined },
          { name: 'fechaFin', label: 'Hasta', type: 'date', width: 155, minDate: fechaInicio || undefined },
        ]}
        onSearchChange={(value) => {
          setSearch(value);
          setPageNumber(1);
        }}
        onFilterChange={(name, value) => {
          if (name === 'estado') setEstado(value);
          if (name === 'motivo') setMotivo(value);
          if (name === 'fechaInicio') setFechaInicio(value || '');
          if (name === 'fechaFin') setFechaFin(value || '');
          setPageNumber(1);
        }}
        onResetFilters={() => {
          setSearch('');
          setEstado('');
          setMotivo('');
          setFechaInicio(initialDateRange.fechaInicio);
          setFechaFin(initialDateRange.fechaFin);
          setPageNumber(1);
        }}
        onPageChange={setPageNumber}
        onPageSizeChange={setPageSize}
        emptyTitle="Sin mensajes"
        emptyDescription="Aún no llegaron consultas desde el formulario público."
      />

      <AdminDialog
        open={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title="Detalle del mensaje"
        icon={<MarkEmailReadOutlinedIcon />}
        maxWidth="sm"
        actions={
          <Button variant="outlined" onClick={() => setSelectedMessage(null)}>
            Cerrar
          </Button>
        }
      >
        {selectedMessage && (
          <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Cliente</Typography>
                <Typography variant="subtitle1" fontWeight={900}>{selectedMessage.nombre}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedMessage.email}</Typography>
                {selectedMessage.whatsapp && <Typography variant="body2" color="text.secondary">{selectedMessage.whatsapp}</Typography>}
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Motivo</Typography>
                <Typography variant="body1" fontWeight={800}>{selectedMessage.motivo}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Mensaje</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>{selectedMessage.mensaje}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Fecha de recepción</Typography>
                <Typography variant="body2">{formatDateTime(selectedMessage.created_at)}</Typography>
              </Box>
          </Stack>
        )}
      </AdminDialog>

      <ConfirmDialog
        open={Boolean(messageToDelete)}
        action="delete"
        title="Eliminar mensaje de contacto"
        message={messageToDelete ? `Se eliminará el mensaje de ${messageToDelete.nombre}.` : ''}
        loading={saving}
        onCancel={() => setMessageToDelete(null)}
        onConfirm={handleDeleteMessage}
      />
    </Stack>
  );
};
