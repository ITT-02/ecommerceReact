export const blurActiveElement = () => {
  if (typeof document === 'undefined') return;

  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
};

export const preventButtonFocus = (event) => {
  event.preventDefault();
};

export const runAfterBlur = (callback) => {
  blurActiveElement();

  window.requestAnimationFrame(() => {
    callback?.();
  });
};
