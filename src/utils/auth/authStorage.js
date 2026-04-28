// Maneja la persistencia de la sesión en el navegador.
// Aquí se guarda el accessToken, refreshToken, usuario y fecha de expiración.

const SESSION_KEY = 'aliqora_session';

/**
 * Guarda la sesión completa en localStorage.
 *
 * Se llama después de iniciar sesión o refrescar el token.
 */
export const saveSession = (session) => {
  if (!session) return;

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

/**
 * Lee la sesión guardada en localStorage.
 *
 * Si no existe sesión, devuelve null.
 * Si el JSON está dañado, limpia la sesión.
 */
export const getStoredSession = () => {
  const rawSession = localStorage.getItem(SESSION_KEY);

  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession);
  } catch {
    clearSession();
    return null;
  }
};

/**
 * Obtiene solo el accessToken de la sesión guardada.
 *
 * Se usa para enviar el token en peticiones protegidas.
 */
export const getAccessToken = () => {
  return getStoredSession()?.accessToken || null;
};

/**
 * Verifica si la sesión ya expiró o está por expirar.
 *
 * Usa un margen de seguridad de 60 segundos para refrescar antes
 * de que el token expire completamente.
 */
export const isSessionExpired = (session) => {
  if (!session?.expiresAt) return true;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const safetyMarginInSeconds = 60;

  return session.expiresAt <= nowInSeconds + safetyMarginInSeconds;
};

/**
 * Elimina la sesión guardada.
 *
 * Se usa al cerrar sesión o cuando el token ya no es válido.
 */
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};