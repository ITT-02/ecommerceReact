// Configuración central del rango de fechas inicial para módulos administrativos.
// Todos los módulos que usen getDefaultAdminDateRange() tomarán este rango inicial.

export const ADMIN_DATE_RANGE_MODES = {
  MONTH_TO_DATE: 'month_to_date',
  MONTH_DAY_TO_DATE: 'month_day_to_date',
  CURRENT_FORTNIGHT_TO_DATE: 'current_fortnight_to_date',
  CURRENT_FORTNIGHT_FULL: 'current_fortnight_full',
};

// Filtro desde un día fijo del mes hasta la fecha actual.
export const DEFAULT_ADMIN_DATE_RANGE_MODE =
  ADMIN_DATE_RANGE_MODES.MONTH_DAY_TO_DATE;

// DIA FIJO DE FCHA DE INICIO PARA TODOS OS MODULOS.
export const DEFAULT_ADMIN_MONTH_START_DAY = 15;

export const toDateInputValue = (date = new Date()) => {
  const value = new Date(date);

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getLastDayOfMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const getSafeMonthStartDay = (date, dayOfMonth) => {
  const lastDay = getLastDayOfMonth(date).getDate();
  const safeDay = Number(dayOfMonth) || 1;

  return Math.min(Math.max(safeDay, 1), lastDay);
};

const getMonthDayToDateRange = (date = new Date(), startDay = 1) => {
  const current = new Date(date);
  const safeStartDay = getSafeMonthStartDay(current, startDay);

  let start = new Date(
    current.getFullYear(),
    current.getMonth(),
    safeStartDay
  );

  // Si hoy todavía no llegó al día configurado, toma el periodo desde el mes anterior.
  if (current.getDate() < safeStartDay) {
    const previousMonth = new Date(
      current.getFullYear(),
      current.getMonth() - 1,
      1
    );

    const previousSafeStartDay = getSafeMonthStartDay(
      previousMonth,
      startDay
    );

    start = new Date(
      previousMonth.getFullYear(),
      previousMonth.getMonth(),
      previousSafeStartDay
    );
  }

  return {
    start,
    end: current,
  };
};

const getCurrentFortnightRange = (date = new Date(), fullFortnight = false) => {
  const current = new Date(date);
  const day = current.getDate();

  const start =
    day <= 15
      ? new Date(current.getFullYear(), current.getMonth(), 1)
      : new Date(current.getFullYear(), current.getMonth(), 16);

  const end =
    day <= 15
      ? new Date(current.getFullYear(), current.getMonth(), 15)
      : getLastDayOfMonth(current);

  return {
    start,
    end: fullFortnight ? end : current,
  };
};

export const getDefaultAdminDateRange = ({
  startKey = 'fechaInicio',
  endKey = 'fechaFin',
  mode = DEFAULT_ADMIN_DATE_RANGE_MODE,
  referenceDate = new Date(),
} = {}) => {
  const current = new Date(referenceDate);

  if (mode === ADMIN_DATE_RANGE_MODES.MONTH_DAY_TO_DATE) {
    const { start, end } = getMonthDayToDateRange(
      current,
      DEFAULT_ADMIN_MONTH_START_DAY
    );

    return {
      [startKey]: toDateInputValue(start),
      [endKey]: toDateInputValue(end),
    };
  }

  if (mode === ADMIN_DATE_RANGE_MODES.CURRENT_FORTNIGHT_TO_DATE) {
    const { start, end } = getCurrentFortnightRange(current, false);

    return {
      [startKey]: toDateInputValue(start),
      [endKey]: toDateInputValue(end),
    };
  }

  if (mode === ADMIN_DATE_RANGE_MODES.CURRENT_FORTNIGHT_FULL) {
    const { start, end } = getCurrentFortnightRange(current, true);

    return {
      [startKey]: toDateInputValue(start),
      [endKey]: toDateInputValue(end),
    };
  }

  // MONTH_TO_DATE
  const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);

  return {
    [startKey]: toDateInputValue(startOfMonth),
    [endKey]: toDateInputValue(current),
  };
};

export const getDefaultAdminDateFilters = ({
  startKey = 'fechaInicio',
  endKey = 'fechaFin',
  extraFilters = {},
} = {}) => {
  return {
    ...extraFilters,
    ...getDefaultAdminDateRange({
      startKey,
      endKey,
    }),
  };
};

export const isDateRangeInvalid = ({
  fechaInicio,
  fechaFin,
  startKey = 'fechaInicio',
  endKey = 'fechaFin',
  values = null,
} = {}) => {
  const startValue = values ? values[startKey] : fechaInicio;
  const endValue = values ? values[endKey] : fechaFin;

  if (!startValue || !endValue) return false;

  return new Date(startValue) > new Date(endValue);
};

export const emptyPagination = ({ pageNumber = 1, pageSize = 10 } = {}) => ({
  totalCount: 0,
  pageNumber,
  pageSize,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
});
