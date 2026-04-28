// Badge del estado de pedido.

import { StatusChip } from '../common/StatusChip';
import { ORDER_STATUS } from '../../utils/orderStatus';

export const OrderStatusBadge = ({ status }) => <StatusChip label={ORDER_STATUS[status] || status} color="info" />;
