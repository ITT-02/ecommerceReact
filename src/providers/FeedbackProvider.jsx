// Provider global para mensajes del sistema.
// Permite mostrar confirmaciones, errores y avisos desde cualquier módulo sin duplicar Alert/Snackbar.

import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { createContext, useCallback, useMemo, useState } from 'react';

export const FeedbackContext = createContext(null);

const normalizeFeedback = (payload) => {
  if (typeof payload === 'string') {
    return { severity: 'info', message: payload };
  }

  return {
    severity: payload?.severity || payload?.type || 'info',
    title: payload?.title || '',
    message: payload?.message || '',
    autoHideDuration: payload?.autoHideDuration ?? 5200,
  };
};

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState(null);

  const notify = useCallback((payload) => {
    const nextFeedback = normalizeFeedback(payload);
    setFeedback({ ...nextFeedback, id: `${Date.now()}-${Math.random()}` });
  }, []);

  const closeFeedback = useCallback((_, reason) => {
    if (reason === 'clickaway') return;
    setFeedback(null);
  }, []);

  const value = useMemo(
    () => ({
      notify,
      success: (message, options = {}) => notify({ ...options, severity: 'success', message }),
      error: (message, options = {}) => notify({ ...options, severity: 'error', message }),
      warning: (message, options = {}) => notify({ ...options, severity: 'warning', message }),
      info: (message, options = {}) => notify({ ...options, severity: 'info', message }),
    }),
    [notify],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <Snackbar
        key={feedback?.id}
        open={Boolean(feedback)}
        autoHideDuration={feedback?.autoHideDuration}
        onClose={closeFeedback}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={(theme) => ({
          position: 'fixed',
          top: { xs: '72px !important', md: '88px !important' },
          right: { xs: '16px !important', md: '24px !important' },
          maxWidth: { xs: 'calc(100vw - 32px)', sm: 460 },
          zIndex: theme.zIndex.tooltip + 2000,
        })}
      >
        <Alert
          severity={feedback?.severity || 'info'}
          variant="standard"
          onClose={closeFeedback}
          sx={(theme) => ({
            width: '100%',
            borderRadius: theme.palette.custom.radius.sm,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.palette.custom.shadows.lg,
            alignItems: 'flex-start',
          })}
        >
          {feedback?.title && <AlertTitle>{feedback.title}</AlertTitle>}
          {feedback?.message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
};
