import { Box, Button, Stack, Typography } from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

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
  icon = <AssignmentTurnedInOutlinedIcon />,
}) => {
  const normalizedActions = actions || (
    <Button variant="outlined" onClick={onClose} disabled={loading}>
      Cerrar
    </Button>
  );

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
      title={title}
      icon={icon}
      maxWidth={maxWidth}
      actions={normalizedActions}
    >
      <Stack spacing={2}>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}

        <Box sx={contentSx}>{children}</Box>
      </Stack>
    </AdminDialog>
  );
};
