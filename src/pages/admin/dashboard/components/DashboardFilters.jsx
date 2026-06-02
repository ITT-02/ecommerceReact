import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

const FECHA_MAYOR_ERROR = 'La fecha inicio no puede ser mayor que la fecha fin.';

const toYYYYMMDD = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    const date = dayjs(value, 'YYYY-MM-DD', true);
    return date.isValid() ? date.format('YYYY-MM-DD') : null;
  }

  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD') : null;
};

const textFieldProps = ({ error = false, helperText = null } = {}) => ({
  size: 'small',
  fullWidth: true,
  error,
  helperText,
});

/**
 * Filtros superiores del dashboard.
 * Mantiene el valor interno como YYYY-MM-DD para el backend y lo muestra como DD/MM/YYYY.
 */
export const DashboardFilters = ({
  fechaInicio,
  fechaFin,
  onChange,
  onMesActual,
  onActualizar,
  isLoading,
  rangoInvalido = false,
}) => {
  const fechaInicioValue = fechaInicio ? dayjs(fechaInicio, 'YYYY-MM-DD', true) : null;
  const fechaFinValue = fechaFin ? dayjs(fechaFin, 'YYYY-MM-DD', true) : null;

  return (
    <Card
      sx={(theme) => ({
        width: '100%',
        borderRadius: theme.palette.custom.radius.xs,
        borderColor: theme.palette.custom.semantic.form.border,
        backgroundColor: theme.palette.custom.semantic.form.surface,
      })}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={{ xs: 1.5, md: 2 }}>
          <Box>
            <Typography
              variant="h6"
              sx={(theme) => ({
                color: theme.palette.custom.semantic.form.titleColor,
                fontWeight: 700,
              })}
            >
              Filtros del dashboard
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Filtra el resumen por el rango de fechas centralizado del sistema.
            </Typography>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ alignItems: 'flex-start' }}>
              <Grid size={{ xs: 12, sm: 6, lg: 3, xl: 2 }}>
                <DatePicker
                  label="Fecha inicio"
                  value={fechaInicioValue}
                  format="DD/MM/YYYY"
                  onChange={(newValue) => {
                    onChange?.({ fechaInicio: toYYYYMMDD(newValue), fechaFin });
                  }}
                  slotProps={{ textField: textFieldProps() }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 3, xl: 2 }}>
                <DatePicker
                  label="Fecha fin"
                  value={fechaFinValue}
                  format="DD/MM/YYYY"
                  onChange={(newValue) => {
                    onChange?.({ fechaInicio, fechaFin: toYYYYMMDD(newValue) });
                  }}
                  slotProps={{
                    textField: textFieldProps({
                      error: Boolean(rangoInvalido),
                      helperText: rangoInvalido ? FECHA_MAYOR_ERROR : null,
                    }),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, lg: 6, xl: 8 }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'stretch', sm: 'flex-start', lg: 'flex-end' },
                    '& > .MuiButton-root': {
                      width: { xs: '100%', sm: 'auto' },
                    },
                  }}
                >
                  <Button variant="outlined" onClick={onMesActual} disabled={isLoading}>
                    Rango inicial
                  </Button>

                  <Button
                    variant="contained"
                    onClick={onActualizar}
                    disabled={isLoading || rangoInvalido}
                  >
                    Actualizar
                  </Button>
                </Box>

                {rangoInvalido ? (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: 'block', mt: 0.75, textAlign: { lg: 'right' } }}
                  >
                    {FECHA_MAYOR_ERROR}
                  </Typography>
                ) : null}
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Stack>
      </CardContent>
    </Card>
  );
};
