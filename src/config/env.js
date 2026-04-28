/**
 * Centraliza las variables de entorno del proyecto.
 * - /rest/v1     para datos
 * - /auth/v1     para autenticación
 * - /storage/v1  para archivos
 */

const readEnv = (key) => import.meta.env[key] || '';

const API_PROJECT_URL = readEnv('VITE_API_PROJECT_URL');
const API_KEY = readEnv('VITE_API_KEY');

export const ENV = {
  API_PROJECT_URL,
  API_KEY,

  API_BASE_URL: `${API_PROJECT_URL}/rest/v1`,
  AUTH_BASE_URL: `${API_PROJECT_URL}/auth/v1`,
  STORAGE_BASE_URL: `${API_PROJECT_URL}/storage/v1`,
};

/**
 * Valida que existan las variables obligatorias.
 *
 * No valida API_BASE_URL, AUTH_BASE_URL ni STORAGE_BASE_URL
 * porque esas se construyen automáticamente desde API_PROJECT_URL.
 */
export const validateEnv = () => {
  const missing = Object.entries({
    VITE_API_PROJECT_URL: ENV.API_PROJECT_URL,
    VITE_API_KEY: ENV.API_KEY,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
};