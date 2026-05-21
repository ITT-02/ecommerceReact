import React from 'react';
import {
  Dialog, DialogContent, Button, Typography, Grid,
  Box, useTheme, alpha, Chip, CircularProgress, Paper, IconButton, Avatar
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HistoryIcon from '@mui/icons-material/History';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'; // <-- CORREGIDO
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';

import { useAdminPaymentDetail } from '../../../../hooks/sales/useAdminPayments';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const formatFecha = (fechaStr, time = false) => {
  if (!fechaStr) return '-';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    ...(time && { hour: '2-digit', minute: '2-digit' }),
  }).format(new Date(fechaStr));
};

const getStatusConfig = (status) => {
  if (status === 'aprobado')  return { color: 'success', paletteKey: 'success', Icon: CheckCircleOutlinedIcon };
  if (status === 'rechazado') return { color: 'error',   paletteKey: 'error',   Icon: CancelOutlinedIcon };
  return                              { color: 'warning', paletteKey: 'warning', Icon: HourglassEmptyIcon };
};

const getInitials = (str) => {
  if (!str) return 'S';
  if (str.includes('-') && str.length > 20) return '?';
  const parts = str.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return str.slice(0, 2).toUpperCase();
};

const getDisplayName = (str) => {
  if (!str) return 'Sistema';
  if (str.includes('-') && str.length > 20) return str.split('-')[0].toUpperCase();
  return str;
};

// ─────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────

/** Tarjeta de sección flexible para ocupar todo el espacio */
const SectionCard = ({ title, icon, children }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.default, 0.5),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1.5, borderBottom: `1px dashed ${theme.palette.divider}` }}>
        {icon}
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Paper>
  );
};

/**
 * Fila de datos apilables (stack) si el contenido es largo
 */
const DataRow = ({ label, value, main, stack = false, mono = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: stack ? 'column' : 'row',
        justifyContent: stack ? 'flex-start' : 'space-between',
        alignItems: stack ? 'flex-start' : 'center',
        gap: stack ? 0.5 : 2,
        mb: 2, 
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <Box
        sx={{
          textAlign: stack ? 'left' : 'right',
          typography: 'body2',
          color: main ? 'primary.main' : 'text.primary',
          fontWeight: main ? 700 : 500,
          fontFamily: mono ? '"Roboto Mono", monospace' : 'inherit',
          fontSize: mono ? '0.85rem' : '0.9rem',
          wordBreak: 'break-word',
          maxWidth: '100%',
        }}
      >
        {value ?? '-'}
      </Box>
    </Box>
  );
};

/** Banner de estado principal, textos escalados */
const StatusHeroBanner = ({ estado, monto }) => {
  const theme = useTheme();
  const { color, paletteKey, Icon } = getStatusConfig(estado);
  const palette = theme.palette[paletteKey];

  return (
    <Box
      sx={{
        px: 4, py: 1.5, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 2,
        bgcolor: alpha(palette.main, 0.08),
        borderBottom: `2px solid ${alpha(palette.main, 0.2)}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Icon sx={{ fontSize: 28 }} color={color} /> 
        <Typography variant="h6" fontWeight={700} color={`${color}.main`} sx={{ textTransform: 'capitalize' }}>
          Pago {estado}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          Monto:
        </Typography>
        <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}> 
          {formatCurrency(monto)}
        </Typography>
      </Box>
    </Box>
  );
};

const HistorialItem = ({ hist, getStatusConfig, theme, formatFecha }) => {
  const { paletteKey } = getStatusConfig(hist.estado_nuevo);
  const palette = theme.palette[paletteKey];
  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
      <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(palette.main, 0.12), color: palette.main, fontSize: '0.7rem', fontWeight: 700 }}>
        {getInitials(hist.cambiado_por)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
          <Box component="span" fontWeight={700}>{getDisplayName(hist.cambiado_por)}</Box> cambió a <Box component="span" fontWeight={700} sx={{ textTransform: 'uppercase', color: palette.main }}>{hist.estado_nuevo}</Box>
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
          {formatFecha(hist.created_at, true)}
        </Typography>
        {hist.comentario && (
          <Typography variant="caption" sx={{ display: 'block', mt: 0.75, px: 1.25, py: 0.75, bgcolor: alpha(palette.main, 0.05), borderLeft: `3px solid ${alpha(palette.main, 0.5)}`, borderRadius: '0 6px 6px 0', fontStyle: 'italic', color: 'text.secondary' }}>
            "{hist.comentario}"
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
export const PaymentDetailDialog = ({ open, pagoId, onClose }) => {
  const theme = useTheme();
  const { data: detail, isLoading } = useAdminPaymentDetail(open ? pagoId : null);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, maxWidth: '1000px !important', overflow: 'hidden' } }}>
      
      {/* Header */}
      <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.03), borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 40, height: 40 }}>
            <ReceiptLongIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>Detalle del Pago</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontFamily: '"Roboto Mono", monospace' }}>
              ID: {pagoId?.split('-')[0].toUpperCase()}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ bgcolor: theme.palette.background.paper, boxShadow: 1 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Banner */}
      {!isLoading && detail && <StatusHeroBanner estado={detail.estado} monto={detail.monto} />}

      {/* Contenido en Grilla 2x2 Estirada */}
      <DialogContent sx={{ p: 4, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
        {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        ) : !detail ? (
            <Typography color="error" align="center" sx={{ py: 4 }}>Error cargando información.</Typography>
        ) : (
            <Box
          sx={{
            display: 'grid',
            // En móviles 1 columna, en escritorio 2 columnas iguales
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            // En móviles la altura de fila es automática, en escritorio 2 filas iguales
            gridTemplateRows: { xs: 'auto', md: '1fr 1fr' },
            gap: 3,
            // En móviles la altura se adapta al contenido, en escritorio se fija en 700px
            height: { xs: 'auto', md: 700 },          
          }}
        >
            {/* Tarjeta 1: Transacción */}
            <SectionCard title="Transacción" icon={<AccountBalanceWalletIcon color="primary" />}>
                <DataRow label="Método de Pago" value={<Chip size="small" variant="outlined" label={detail.metodo_pago} sx={{ textTransform: 'capitalize', fontWeight: 600 }} />} />
                <DataRow label="Estado" value={<Chip label={detail.estado} size="small" color={getStatusConfig(detail.estado).color} sx={{ textTransform: 'uppercase', fontWeight: 700 }} />} />
                <DataRow label="N° Referencia" value={detail.referencia_transaccion} />
                <DataRow label="Registro" value={formatFecha(detail.created_at, true)} />
                {detail.pagado_at && <DataRow label="Aprobación" value={formatFecha(detail.pagado_at, true)} />}
            </SectionCard>

            {/* Tarjeta 2: Evidencia */}
            <SectionCard title="Evidencia del Depósito" icon={<VerifiedUserIcon color="primary" />}>
                <Box
                sx={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 2, border: `1px ${detail.url_comprobante ? 'solid' : 'dashed'} ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.text.primary, 0.02),
                    p: 2,
                }}
                >
                {detail.url_comprobante ? (
                    detail.url_comprobante.match(/\.(jpeg|jpg|gif|png|webp)$/i) || detail.url_comprobante.includes('via.placeholder') ? (
                    <img src={detail.url_comprobante} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                    <Button variant="contained" startIcon={<FileOpenIcon />} href={detail.url_comprobante} target="_blank" rel="noopener noreferrer" disableElevation>
                        Descargar
                    </Button>
                    )
                ) : (
                    <>
                    <BrokenImageOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5, mb: 1 }} />
                    <Typography color="text.disabled" variant="body2" fontWeight={600}>Sin comprobante adjunto</Typography>
                    </>
                )}
                </Box>
            </SectionCard>

            {/* Tarjeta 3: Cliente */}
            <SectionCard title="Información del Cliente" icon={<PersonOutlineOutlinedIcon color="primary" />}>
                <DataRow label="N° de Pedido" value={<Typography variant="body2" color="primary.main" fontWeight={600} sx={{ textDecoration: 'underline' }}>{detail.numero_pedido}</Typography>} />
                <DataRow label="Cliente" value={detail.nombre_cliente} />
                <DataRow label="Teléfono" value={detail.telefono_cliente} />
                <DataRow label="Correo Electrónico" value={detail.correo_cliente} />
            </SectionCard>

            {/* Tarjeta 4: Historial */}
            <SectionCard title="Registros de Operación" icon={<HistoryIcon color="primary" />}>
                {detail.historial_estados?.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                    {detail.historial_estados.slice(0, 3).map((hist) => (
                    <HistorialItem key={hist.id} hist={hist} getStatusConfig={getStatusConfig} theme={theme} formatFecha={formatFecha} />
                    ))}
                </Box>
                ) : (
                <Typography variant="body2" color="text.disabled" align="center" sx={{ py: 3, flex: 1 }}>Sin eventos registrados.</Typography>
                )}
            </SectionCard>
            </Box>
        )}
        </DialogContent>
    </Dialog>
  );
};