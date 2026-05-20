// src/components/common/forms/AppDatePicker.jsx

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

/**
 * Selector de fecha reutilizable para formularios, filtros, dashboards y reportes.
 * Trabaja con valores string en formato YYYY-MM-DD para mantener compatibilidad
 */
export const AppDatePicker = ({
  label,
  value,
  onChange,
  name,
  width = 160,
  size = 'small',
  disabled = false,
  required = false,
  minDate = null,
  maxDate = null,
  disableFuture = false,
  disablePast = false,
  helperText = '',
  error = false,
}) => {
  return (
    <DatePicker
      label={label}
      value={value ? dayjs(value) : null}
      format="DD/MM/YYYY"
      disabled={disabled}
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      disableFuture={disableFuture}
      disablePast={disablePast}
      onChange={(newValue) => {
        const formattedValue = newValue ? newValue.format('YYYY-MM-DD') : '';

        if (name) {
          onChange(name, formattedValue);
          return;
        }

        onChange(formattedValue);
      }}
      slotProps={{
        textField: {
          size,
          required,
          error,
          helperText,
          sx: {
            width,

            '& .MuiOutlinedInput-root': {
              height: size === 'small' ? 40 : 48,
              borderRadius: 2,
              backgroundColor: 'background.paper',
            },

            '& .MuiInputBase-input': {
              fontSize: '0.875rem',
            },

            '& .MuiInputLabel-root': {
              fontSize: '0.82rem',
            },
          },
        },
        popper: {
          sx: {
            '& .MuiPaper-root': {
              borderRadius: 3,
              boxShadow: 6,
            },

            '& .MuiPickersCalendarHeader-label': {
              fontWeight: 800,
              textTransform: 'capitalize',
            },

            '& .MuiDayCalendar-weekDayLabel': {
              fontWeight: 700,
              color: 'text.secondary',
            },

            '& .MuiPickersDay-root': {
              fontSize: '0.82rem',
              borderRadius: 2,
            },

            '& .MuiPickersDay-root.Mui-selected': {
              fontWeight: 800,
            },
          },
        },
      }}
    />
  );
};