// Página: Mis pedidos.
import { Box, Typography, Card, CardContent, Divider, Chip } from '@mui/material';
import { OrderProgressMini } from '../../components/orders/OrderProgressMini';

const PEDIDOS_MOCK = [
  {
    id: 'PED-001',
    producto: 'Zapatillas Running Pro',
    total: 'S/. 189.90',
    estadoEnvio: 'en_transito',
    historialEventos: [
      { estado: 'pedido_creado',         fecha_hora: '2026-05-20T10:30:00', mensaje: 'Tu pedido fue registrado exitosamente.' },
      { estado: 'en_preparacion',        fecha_hora: '2026-05-20T11:15:00', mensaje: 'El vendedor está preparando tu paquete.' },
      { estado: 'entregado_repartidora', fecha_hora: '2026-05-21T09:00:00', mensaje: 'Paquete entregado a la repartidora asignada.' },
      { estado: 'en_transito',           fecha_hora: '2026-05-21T10:30:00', mensaje: 'Tu pedido está en camino a tu dirección.' },
    ],
  },
  {
    id: 'PED-002',
    producto: 'Mochila Táctica 40L',
    total: 'S/. 95.00',
    estadoEnvio: 'entregado',
    historialEventos: [
      { estado: 'pedido_creado',         fecha_hora: '2026-05-15T08:00:00', mensaje: 'Pedido recibido.' },
      { estado: 'en_preparacion',        fecha_hora: '2026-05-15T09:30:00', mensaje: 'En preparación.' },
      { estado: 'entregado_repartidora', fecha_hora: '2026-05-16T07:45:00', mensaje: 'Recogido por la repartidora.' },
      { estado: 'en_transito',           fecha_hora: '2026-05-16T09:00:00', mensaje: 'En camino.' },
      { estado: 'en_destino',            fecha_hora: '2026-05-16T13:20:00', mensaje: 'El paquete llegó a tu zona.' },
      { estado: 'entregado',             fecha_hora: '2026-05-16T14:05:00', mensaje: 'Entregado en puerta. ¡Gracias por tu compra!' },
    ],
  },
  {
    id: 'PED-003',
    producto: 'Audífonos Bluetooth',
    total: 'S/. 55.50',
    estadoEnvio: 'pedido_creado',
    historialEventos: [
      { estado: 'pedido_creado', fecha_hora: '2026-05-26T08:10:00', mensaje: 'Pedido creado. Esperando confirmación del vendedor.' },
    ],
  },
];

function PedidoCard({ pedido }) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {pedido.id}
          </Typography>
          <Chip label={pedido.total} size="small" color="primary" variant="outlined" />
        </Box>

        <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
          {pedido.producto}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <OrderProgressMini
          estadoEnvio={pedido.estadoEnvio}
          historialEventos={pedido.historialEventos}
        />
      </CardContent>
    </Card>
  );
}

export const MyOrdersPage = () => (
  <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
    <Typography variant="h5" fontWeight={700} mb={3}>
      Mis pedidos
    </Typography>

    {PEDIDOS_MOCK.map((pedido) => (
      <PedidoCard key={pedido.id} pedido={pedido} />
    ))}
  </Box>
);
