import { Box, IconButton, Tooltip } from '@mui/material';
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';

import { OrdersAttentionSidebar } from '../../../../components/admin/orders/OrdersAttentionSidebar';
import { AdminResourceTable } from '../../../../components/common/dataTable/AdminResourceTable';
import { preventButtonFocus } from '../utils/dialogFocusUtils';

export const OrdersTableSection = ({
  showAttentionPanel,
  setShowAttentionPanel,
  activeAttentionKey,
  attentionSummaryTotals,
  attentionLoading,
  onApplyAttentionFilter,
  onClearAttentionFilter,

  rows,
  columns,
  actions,
  loading,
  pagination,
  search,
  filters,
  tableFilters,
  onSearchChange,
  onFilterChange,
  onResetFilters,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Tooltip title={showAttentionPanel ? 'Ocultar atención rápida' : 'Abrir atención rápida'}>
          <IconButton
            color={showAttentionPanel ? 'primary' : 'default'}
            onMouseDown={preventButtonFocus}
            onClick={() => setShowAttentionPanel((current) => !current)}
            aria-label={showAttentionPanel ? 'Ocultar atención rápida' : 'Abrir atención rápida'}
            sx={{
              border: 1,
              borderColor: showAttentionPanel ? 'primary.main' : 'divider',
              bgcolor: showAttentionPanel ? 'action.selected' : 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {showAttentionPanel ? (
              <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
            ) : (
              <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: showAttentionPanel ? 'minmax(260px, 320px) minmax(0, 1fr)' : '1fr',
          },
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        {showAttentionPanel && (
          <OrdersAttentionSidebar
            activeKey={activeAttentionKey}
            summaryTotals={attentionSummaryTotals}
            loading={attentionLoading}
            onApplyFilter={onApplyAttentionFilter}
            onClearFilter={onClearAttentionFilter}
          />
        )}

        <Box sx={{ minWidth: 0 }}>
          <AdminResourceTable
            rows={rows}
            columns={columns}
            actions={actions}
            loading={loading}
            pagination={pagination}
            searchValue={search}
            searchLabel="Buscar pedido"
            filters={tableFilters}
            filterValues={filters}
            onSearchChange={onSearchChange}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            emptyTitle="No hay pedidos"
            emptyDescription="Intenta ajustar la búsqueda o cambiar los filtros."
            maxHeight={620}
          />
        </Box>
      </Box>
    </Box>
  );
};
