// Barra de paginación básica.

import { Pagination, Stack } from '@mui/material';

export const PaginationBar = ({ page, count, onChange }) => {
  return (
    <Stack sx={{ alignItems: 'center', mt: 3 }}>
      <Pagination page={page} count={count} onChange={onChange} color="primary" />
    </Stack>
  );
};
