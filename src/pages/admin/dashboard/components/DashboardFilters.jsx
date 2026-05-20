import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';

import { toYYYYMMDD } from './dateUtils';

const FECHA_MAYOR_ERROR = 'La fecha inicio no puede ser mayor que la fecha fin.';

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

  const onDayCellRender = (day) => {
    const isInRange = (() => {
      if (!fechaInicioValue || !fechaFinValue) return false;
      const start = fechaInicioValue.startOf('day');
      const end = fechaFinValue.startOf('day');
      const d = day.startOf('day');
      return (d.isSame(start, 'day') || d.isAfter(start, 'day')) && (d.isSame(end, 'day') || d.isBefore(end, 'day'));
    })();

    const isSelected =
      (fechaInicioValue && day.isSame(fechaInicioValue, 'day')) ||
      (fechaFinValue && day.isSame(fechaFinValue, 'day'));

    // Resaltado visual moderno tipo Material para desktop y mobile.
    if (isSelected) {
      return (
        <Box
          component="span"
          sx={{
            width: '100%',
            height: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
          }}
        />
      );
    }

    if (isInRange) {
      return (
        <Box
          component="span"
          sx={{
            width: '100%',
            height: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: 'primary.light',
            opacity: 0.45,
          }}
        />
      );
    }

    return null;
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.25}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Filtros
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Fecha inicio"
                  value={fechaInicioValue}
                  onChange={(newValue) => {
                    const v = toYYYYMMDD(newValue);
                    onChange?.({ fechaInicio: v, fechaFin });
                  }}
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: false,
                      helperText: null,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Fecha fin"
                  value={fechaFinValue}
                  onChange={(newValue) => {
                    const v = toYYYYMMDD(newValue);
                    onChange?.({ fechaInicio, fechaFin: v });
                  }}
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: Boolean(rangoInvalido),
                      helperText: rangoInvalido ? FECHA_MAYOR_ERROR : null,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  }}
                >
                  <Button variant="outlined" onClick={onMesActual} disabled={isLoading}>
                    Mes actual
                  </Button>

                  <Button
                    variant="contained"
                    onClick={onActualizar}
                    disabled={isLoading || rangoInvalido}
                  >
                    Actualizar
                  </Button>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  Actualización automática al cambiar filtros.
                </Typography>

                {rangoInvalido ? (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
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

