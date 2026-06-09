import { AdminDialog } from '../../../../components/common/adminDialog/AdminDialog';

export const OrderDialogShell = ({
  open,
  title,
  subtitle,
  children,
  actions,
  onClose,
  onSubmit,
  loading = false,
  maxWidth = 'md',
  contentSx,
}) => {
  return (
    <AdminDialog
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      subtitle={subtitle}
      actions={actions}
      onSubmit={onSubmit}
      loading={loading}
      maxWidth={maxWidth}
      contentSx={contentSx}
      stickyActionsOnMobile={true}
    >
      {children}
    </AdminDialog>
  );
};


