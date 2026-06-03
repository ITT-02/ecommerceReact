// Hook para mostrar mensajes globales del sistema.

import { useContext } from 'react';
import { FeedbackContext } from '../../providers/FeedbackProvider';

export const useFeedback = () => {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  }

  return context;
};
