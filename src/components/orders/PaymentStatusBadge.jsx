// Badge del estado de pago.

import { StatusChip } from '../common/StatusChip';
import { PAYMENT_STATUS } from '../../utils/paymentStatus';

export const PaymentStatusBadge = ({ status }) => <StatusChip label={PAYMENT_STATUS[status] || status} color="warning" />;
