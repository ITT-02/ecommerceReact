/**
 * Protección global para inputs numéricos.
 * Regla por defecto:
 * - Todo input type="number" se trata como no negativo.
 * - Si algún caso futuro realmente necesitara negativos, agregar data-allow-negative="true" al input.
 */
const INVALID_NON_NEGATIVE_KEYS = new Set(['-', '+', 'e', 'E']);

const isNumberInput = (target) => {
  return target instanceof HTMLInputElement && target.type === 'number';
};

const allowsNegative = (input) => {
  if (input.dataset.allowNegative === 'true') return true;

  const min = input.getAttribute('min');
  return min != null && min !== '' && Number(min) < 0;
};

const shouldGuard = (target) => {
  return isNumberInput(target) && !allowsNegative(target);
};

const sanitizeNumberValue = (input) => {
  if (!shouldGuard(input)) return;

  const rawValue = input.value;
  if (rawValue === '') return;

  const minValue = Number(input.getAttribute('min') ?? 0);
  const safeMin = Number.isFinite(minValue) ? Math.max(minValue, 0) : 0;

  // Evita notación científica, signos negativos/positivos y valores no numéricos.
  if (/[-+eE]/.test(rawValue)) {
    const numericValue = Number(rawValue.replace(/[+]/g, ''));
    input.value = Number.isFinite(numericValue)
      ? String(Math.max(numericValue, safeMin))
      : '';
    return;
  }

  const numericValue = Number(rawValue);
  if (Number.isFinite(numericValue) && numericValue < safeMin) {
    input.value = String(safeMin);
  }
};

let isRegistered = false;

export const registerNumberInputGuards = () => {
  if (typeof window === 'undefined' || isRegistered) return;

  isRegistered = true;

  document.addEventListener(
    'keydown',
    (event) => {
      if (!shouldGuard(event.target)) return;

      if (INVALID_NON_NEGATIVE_KEYS.has(event.key)) {
        event.preventDefault();
      }
    },
    true
  );

  document.addEventListener(
    'paste',
    (event) => {
      if (!shouldGuard(event.target)) return;

      const text = event.clipboardData?.getData('text') ?? '';
      if (/[-+eE]/.test(text)) {
        event.preventDefault();
      }
    },
    true
  );

  document.addEventListener(
    'input',
    (event) => {
      sanitizeNumberValue(event.target);
    },
    true
  );

  document.addEventListener(
    'wheel',
    (event) => {
      if (!isNumberInput(event.target)) return;
      event.target.blur();
    },
    { passive: true, capture: true }
  );
};
