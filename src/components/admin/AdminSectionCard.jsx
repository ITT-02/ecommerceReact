// Card reutilizable para secciones de formulario administrativo.
// Mantiene un único modelo visual para formularios en todo el panel.

import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';

export const AdminSectionCard = ({ title, description, action, children, sx }) => {
  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        borderRadius: theme.palette.custom.radius.xs,
        backgroundColor: theme.palette.custom.semantic.form.surface,
        ...sx,
      })}
    >
      <CardContent>
        <Stack spacing={2.25}>
          {(title || description || action) && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
            >
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                {title && (
                  <Typography
                    variant="h5"
                    sx={(theme) => ({
                      color: theme.palette.custom.semantic.form.sectionTitleColor,
                      fontWeight: 500,
                    })}
                  >
                    {title}
                  </Typography>
                )}

                {description && (
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                )}
              </Stack>

              {action}
            </Stack>
          )}

          {(title || description || action) && <Divider />}

          {children}
        </Stack>
      </CardContent>
    </Card>
  );
};
