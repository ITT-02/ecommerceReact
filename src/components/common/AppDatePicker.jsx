import dayjs from 'dayjs';
import { useMediaQuery } from '@mui/material';

import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

/**
 * Selector reutilizable de fecha y fecha + hora.
 *
 * Por defecto:
 * - Fecha simple: YYYY-MM-DD
 *
 * Con withTime:
 * - Fecha + hora: YYYY-MM-DDTHH:mm
 *
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

  withTime = false,
  displayFormat = null,
  outputFormat = null,
  minutesStep = 5,

  /**
   * En mobile muestra Cancel / OK.
   * En desktop normalmente no hace falta action bar.
   */
  actionBarActions = undefined,
}) => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const PickerComponent = withTime
    ? isMobile
      ? MobileDateTimePicker
      : DesktopDateTimePicker
    : isMobile
      ? MobileDatePicker
      : DesktopDatePicker;

  const safeValue = value && dayjs(value).isValid() ? dayjs(value) : null;

  const finalDisplayFormat = displayFormat || (withTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY');
  const finalOutputFormat = outputFormat || (withTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD');

  const blurActiveElement = () => {
    if (typeof document === 'undefined') return;

    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  };

  const emitChange = (formattedValue) => {
    if (name) {
      onChange(name, formattedValue);
      return;
    }

    onChange(formattedValue);
  };

  const handlePickerChange = (newValue) => {
    const formattedValue =
      newValue && dayjs(newValue).isValid()
        ? dayjs(newValue).format(finalOutputFormat)
        : '';

    emitChange(formattedValue);
  };

  const commonTextFieldSx = {
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
  };

  const mobileLayoutSx = isMobile
    ? {
        '& .MuiPickersLayout-root': {
          maxWidth: 'calc(100vw - 32px)',
        },

        '& .MuiDialog-paper': {
          m: 1.5,
          width: 'calc(100vw - 24px)',
          maxWidth: 420,
          borderRadius: 3,
        },

        '& .MuiDateCalendar-root': {
          width: '100%',
          maxWidth: '100%',
        },

        '& .MuiPickersActionBar-root': {
          px: 2,
          py: 1.25,
        },

        '& .MuiPickersActionBar-root .MuiButton-root': {
          fontWeight: 800,
          textTransform: 'none',
        },
      }
    : {};

  const resolvedActionBarActions =
    actionBarActions !== undefined
      ? actionBarActions
      : isMobile
        ? ['cancel', 'accept']
        : [];

  const commonPickerProps = {
    label,
    value: safeValue,
    format: finalDisplayFormat,
    disabled,
    disableFuture,
    disablePast,
    onOpen: blurActiveElement,
    onClose: blurActiveElement,
    onAccept: blurActiveElement,
    onChange: handlePickerChange,
    closeOnSelect: !isMobile,

    slotProps: {
      textField: {
        size,
        required,
        error,
        helperText,
        sx: commonTextFieldSx,
      },

      openPickerButton: {
        onMouseDown: blurActiveElement,
        onTouchStart: blurActiveElement,
      },

      actionBar: {
        actions: resolvedActionBarActions,
      },

      mobilePaper: {
        sx: mobileLayoutSx,
      },

      dialog: {
        slotProps: {
          paper: {
            sx: mobileLayoutSx,
          },
        },
      },

      popper: {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              boundary: 'viewport',
              padding: 8,
            },
          },
        ],
        sx: {
          zIndex: (theme) => theme.zIndex.modal + 2,

          '& .MuiPaper-root': {
            maxWidth: 'calc(100vw - 24px)',
            overflow: 'hidden',
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
    },
  };

  if (withTime) {
    return (
      <PickerComponent
        {...commonPickerProps}
        ampm={false}
        orientation={isMobile ? 'portrait' : undefined}
        timeSteps={{
          minutes: minutesStep,
        }}
        minDateTime={minDate ? dayjs(minDate) : undefined}
        maxDateTime={maxDate ? dayjs(maxDate) : undefined}
      />
    );
  }

  return (
    <PickerComponent
      {...commonPickerProps}
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
    />
  );
};