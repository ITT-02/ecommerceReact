import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { TrackingCard } from '../../../../components/orders/TrackingCard';
import { getOrderStatusLabel } from '../../../../adapters/orderAdapter';
import { formatCurrency, formatDate } from '../utils/ordersPageUtils';
import { preventButtonFocus } from '../utils/dialogFocusUtils';
import { OrderDialogShell } from './OrderDialogShell';
import { OrderInfoLine } from './OrderInfoLine';
import { OrderSection } from './OrderSection';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderSummaryPanel } from './OrderSummaryPanel';

const tableBoxSx = {
  width: '100%',
  overflowX: 'auto',
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
};


const compactJoin = (values = [], separator = ', ') => values.filter(Boolean).join(separator);

const getDeliveryAddressLine = (deliveryData = {}) => {
  return (
    deliveryData.direccion_completa ||
    deliveryData.direccion ||
    deliveryData.direccion_linea ||
    deliveryData.direccion_linea_1 ||
    ''
  );
};

const getDeliveryLocationLine = (deliveryData = {}) => {
  if ((deliveryData.pais_codigo || 'PE') === 'PE') {
    return compactJoin([
      deliveryData.distrito,
      deliveryData.provincia,
      deliveryData.departamento,
      deliveryData.pais || deliveryData.pais_nombre || 'Perú',
    ]);
  }

  return compactJoin([
    deliveryData.ciudad || deliveryData.ciudad_texto || deliveryData.distrito,
    deliveryData.region || deliveryData.region_texto || deliveryData.departamento,
    deliveryData.codigo_postal,
    deliveryData.pais || deliveryData.pais_nombre || deliveryData.pais_codigo,
  ]);
};

const hasDeliveryData = (deliveryData = {}) => {
  return Boolean(
    getDeliveryAddressLine(deliveryData) ||
      deliveryData.destinatario ||
      deliveryData.nombre_receptor ||
      deliveryData.telefono ||
      deliveryData.telefono_receptor
  );
};

export const OrderDetailDialog = ({ open, order = {}, deliveryData = {}, onClose }) => {
  return (
    <OrderDialogShell
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={`Detalle del pedido ${order.numero_pedido || ''}`}
      subtitle="Vista completa del pedido, cliente, entrega, items, pagos y seguimiento."
      actions={
        <Button variant="contained" onMouseDown={preventButtonFocus} onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <Stack spacing={2.25}>
        {order.estado_pago === 'vencido' && (
          <Alert severity="error" variant="outlined">
            El pedido venció por falta de pago. El cliente ya no puede subir comprobante.
          </Alert>
        )}

        {order.estado_pago === 'reembolso_pendiente' && (
          <Alert severity="warning" variant="outlined">
            Pedido cancelado con pago aprobado. Registra el reembolso para cerrar el flujo.
          </Alert>
        )}

        <OrderSummaryPanel
          items={[
            { label: 'N° pedido', value: order.numero_pedido },
            { label: 'Estado pedido', value: <OrderStatusBadge value={order.estado_pedido} /> },
            { label: 'Estado pago', value: <OrderStatusBadge type="payment" value={order.estado_pago} /> },
            { label: 'Total', value: formatCurrency(order.total) },
          ]}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <OrderSection title="Pedido">
              <Stack spacing={1.25}>
                <OrderInfoLine label="Método pago" value={order.metodo_pago} />
                <OrderInfoLine label="Fecha límite pago" value={formatDate(order.fecha_limite_pago)} />
                <OrderInfoLine label="Origen" value={order.canal_venta === 'manual' ? 'Venta manual' : 'Tienda'} />
                {order.canal_venta === 'manual' && (
                  <OrderInfoLine
                    label="Vendedor"
                    value={order.vendedor_nombre || (order.vendedor_responsable_id ? 'Usuario interno' : '-')}
                  />
                )}
                <OrderInfoLine label="Fecha" value={formatDate(order.created_at)} />
              </Stack>
            </OrderSection>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <OrderSection title="Cliente">
              <Stack spacing={1.25}>
                <OrderInfoLine label="Nombre" value={order.nombre_cliente} />
                <OrderInfoLine label="Teléfono" value={order.telefono_cliente} />
                <OrderInfoLine label="Correo" value={order.correo_cliente} />
              </Stack>
            </OrderSection>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <OrderSection title="Entrega">
              {hasDeliveryData(deliveryData) ? (
                <Stack spacing={1.25}>
                  <OrderInfoLine label="Tipo" value={order.tipo_entrega || deliveryData.tipo_entrega || 'envío a domicilio'} />
                  <OrderInfoLine label="Receptor" value={deliveryData.nombre_receptor || deliveryData.destinatario} />
                  <OrderInfoLine label="Teléfono" value={deliveryData.telefono_receptor || deliveryData.telefono} />
                  <OrderInfoLine label="Dirección" value={getDeliveryAddressLine(deliveryData)} />
                  <OrderInfoLine label="Ubicación" value={getDeliveryLocationLine(deliveryData)} />
                  <OrderInfoLine label="UBIGEO" value={deliveryData.ubigeo} />
                  <OrderInfoLine label="Referencia" value={deliveryData.referencia} />
                </Stack>
              ) : (
                <Alert severity="warning" variant="outlined">
                  Este pedido no tiene dirección de entrega registrada. No debería enviarse por
                  transportista hasta completar los datos de despacho.
                </Alert>
              )}
            </OrderSection>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <OrderSection title="Totales">
              <Stack spacing={1.25}>
                <OrderInfoLine label="Subtotal" value={formatCurrency(order.subtotal)} />
                <OrderInfoLine label="Descuento" value={formatCurrency(order.descuento_total)} />
                <OrderInfoLine label="Envío" value={formatCurrency(order.costo_envio)} />
                <OrderInfoLine label="Total" value={formatCurrency(order.total)} />
                <OrderInfoLine label="Reembolsado" value={formatCurrency(order.total_reembolsado)} />
              </Stack>
            </OrderSection>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <OrderSection title="Seguimiento logístico" description="Estado del despacho y datos de rastreo." sx={{ p: 0 }}>
              <Box sx={{ p: { xs: 1.5, sm: 2 }, pt: 0 }}>
                <TrackingCard order={order} title="Seguimiento logístico" />
              </Box>
            </OrderSection>
          </Grid>
        </Grid>

        {order.cancelacion_motivo && (
          <Alert severity="warning" variant="outlined">
            Motivo de cancelación: {order.cancelacion_motivo}
          </Alert>
        )}

        <OrderSection title="Items del pedido" description="Productos, variantes y personalizaciones solicitadas.">
          <Box sx={tableBoxSx}>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Variante</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(order.items || []).map((item) => (
                  <TableRow key={item.id || `${item.nombre_producto}-${item.nombre_variante}`}>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={900}>
                          {item.nombre_producto || '-'}
                        </Typography>

                        {Array.isArray(item.personalizaciones) && item.personalizaciones.length > 0 && (
                          <Alert severity="warning" variant="outlined" sx={{ py: 0.5 }}>
                            <Typography variant="caption" fontWeight={900}>
                              Personalización solicitada
                            </Typography>

                            {item.personalizaciones.map((custom) => (
                              <Typography
                                key={custom.id || custom.opcion_codigo}
                                variant="caption"
                                sx={{ display: 'block', wordBreak: 'break-word' }}
                              >
                                {custom.opcion_nombre || custom.opcion_codigo}:{' '}
                                {custom.valor_texto || custom.observacion || 'Archivo adjunto'}
                                {custom.archivo_url && (
                                  <>
                                    {' '}·{' '}
                                    <Link href={custom.archivo_url} target="_blank" rel="noreferrer">
                                      Ver archivo
                                    </Link>
                                  </>
                                )}
                              </Typography>
                            ))}
                          </Alert>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>{item.nombre_variante || '-'}</TableCell>
                    <TableCell align="right">{item.cantidad ?? 0}</TableCell>
                    <TableCell align="right">{formatCurrency(item.precio_unitario)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.total_linea)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </OrderSection>

        <Divider />

        <OrderSection title="Historial de estados" description="Registro de cambios realizados sobre el pedido.">
          <Box sx={tableBoxSx}>
            <Table size="small" sx={{ minWidth: 680 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Anterior</TableCell>
                  <TableCell>Nuevo</TableCell>
                  <TableCell>Comentario</TableCell>
                  <TableCell>Fecha</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(order.historial_estados || []).map((history) => (
                  <TableRow key={history.id || `${history.estado_nuevo}-${history.created_at}`}>
                    <TableCell>{getOrderStatusLabel(history.estado_anterior)}</TableCell>
                    <TableCell>{getOrderStatusLabel(history.estado_nuevo)}</TableCell>
                    <TableCell>{history.comentario || '-'}</TableCell>
                    <TableCell>{formatDate(history.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </OrderSection>
      </Stack>
    </OrderDialogShell>
  );
};
