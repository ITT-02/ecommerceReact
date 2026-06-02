import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';

import { formatCurrency, formatDate, isImageUrl } from '../utils/ordersPageUtils';
import { preventButtonFocus } from '../utils/dialogFocusUtils';
import { OrderDialogShell } from './OrderDialogShell';
import { OrderInfoLine } from './OrderInfoLine';
import { OrderSummaryPanel } from './OrderSummaryPanel';

export const OrderPaymentsDialog = ({ open, order = {}, onClose }) => {
  const payments = order.pagos || [];
  const refunds = order.reembolsos || [];

  return (
    <OrderDialogShell
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={`Pagos del pedido ${order.numero_pedido || ''}`}
      subtitle="Revisa comprobantes, montos aprobados y reembolsos registrados."
      actions={
        <Button variant="contained" onMouseDown={preventButtonFocus} onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <Stack spacing={2.25}>
        <OrderSummaryPanel
          defaultSize={{ xs: 12, sm: 4 }}
          items={[
            { label: 'Pedido', value: order.numero_pedido },
            { label: 'Total pedido', value: formatCurrency(order.total) },
            { label: 'Reembolsado', value: formatCurrency(order.total_reembolsado) },
          ]}
        />

        {payments.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Este pedido no tiene comprobantes registrados.
          </Typography>
        )}

        {payments.map((payment, index) => (
          <Card key={payment.id || payment.created_at || `payment-${index}`} variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Stack spacing={1.75}>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <OrderInfoLine label="Fecha" value={formatDate(payment.created_at)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <OrderInfoLine label="Método" value={payment.metodo_pago} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <OrderInfoLine label="Monto" value={formatCurrency(payment.monto)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <OrderInfoLine
                      label="Estado"
                      value={<Chip size="small" label={payment.estado} variant="outlined" sx={{ fontWeight: 800 }} />}
                    />
                  </Grid>
                </Grid>

                <Divider />

                {payment.url_comprobante ? (
                  isImageUrl(payment.url_comprobante) ? (
                    <Box
                      component="img"
                      src={payment.url_comprobante}
                      alt="Comprobante"
                      sx={{
                        width: '100%',
                        maxHeight: 360,
                        objectFit: 'contain',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                      }}
                    />
                  ) : (
                    <Link href={payment.url_comprobante} target="_blank" rel="noreferrer">
                      Abrir comprobante
                    </Link>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sin comprobante
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}

        {refunds.length > 0 && (
          <>
            <Divider />
            <Typography variant="subtitle1" fontWeight={900}>
              Reembolsos registrados
            </Typography>

            {refunds.map((refund, index) => (
              <Card key={refund.id || `refund-${index}`} variant="outlined" sx={{ borderRadius: 2.5 }}>
                <CardContent>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <OrderInfoLine label="Monto" value={formatCurrency(refund.monto)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <OrderInfoLine label="Método" value={refund.metodo_reembolso} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <OrderInfoLine label="Referencia" value={refund.referencia_reembolso} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <OrderInfoLine label="Fecha" value={formatDate(refund.created_at)} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <OrderInfoLine label="Motivo" value={refund.motivo} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </Stack>
    </OrderDialogShell>
  );
};
