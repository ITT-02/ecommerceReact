// Página administrativa: Pedidos.

import { Alert, Stack } from '@mui/material';

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { OrderAdvanceDialog } from '../../../components/admin/orders/OrderAdvanceDialog';

import { useOrdersPageController } from './hooks/useOrdersPageController';
import { OrdersTableSection } from './components/OrdersTableSection';
import { OrderDetailDialog } from './components/OrderDetailDialog';
import { OrderPaymentsDialog } from './components/OrderPaymentsDialog';
import { CancelOrderDialog } from './components/CancelOrderDialog';
import { ReopenOrderDialog } from './components/ReopenOrderDialog';
import { RefundOrderDialog } from './components/RefundOrderDialog';

export const OrdersPage = () => {
  const {
    errorMessage,
    pageNotice,
    onClearNotice,
    tableSectionProps,
    detailDialogProps,
    paymentsDialogProps,
    advanceDialogProps,
    cancelDialogProps,
    reopenDialogProps,
    refundDialogProps,
  } = useOrdersPageController();

  return (
    <PlaceholderPage
      title="Pedidos"
      description="Atiende pedidos por prioridad, actualiza preparación, despacho y seguimiento desde un solo flujo."
    >
      <Stack spacing={2}>
        <ErrorMessage message={errorMessage} />

        {pageNotice && (
          <Alert severity="success" onClose={onClearNotice}>
            {pageNotice}
          </Alert>
        )}

        <OrdersTableSection {...tableSectionProps} />
      </Stack>

      <OrderDetailDialog {...detailDialogProps} />
      <OrderPaymentsDialog {...paymentsDialogProps} />
      <OrderAdvanceDialog {...advanceDialogProps} />
      <CancelOrderDialog {...cancelDialogProps} />
      <ReopenOrderDialog {...reopenDialogProps} />
      <RefundOrderDialog {...refundDialogProps} />
    </PlaceholderPage>
  );
};

