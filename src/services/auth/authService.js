// Servicio de autenticación.
// Realiza peticiones HTTP y leer el token.

import { authApi } from '../../api/authApi';
import { restApi } from '../../api/restApi';
import { registerFormToAuthPayload } from '../../adapters/auth/authAdapter';
import { getAccessToken } from '../../utils/auth/authStorage';

/**
 * Construye el header Authorization para endpoints protegidos.
 */
const getBearerHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

/**
 * Inicia sesión con email y password.
 *
 * Devuelve la respuesta cruda de la API.
 * Luego el adapter la transforma a una sesión usable por el frontend.
 */
export const loginWithEmailPassword = async ({ email, password }) => {
  const response = await authApi.post('/token?grant_type=password', {
    email,
    password,
  });

  return response.data;
};

/**
 * Registra un nuevo usuario.
 *
 * Primero adapta el formulario del frontend al formato que espera la API.
 */
export const registerWithEmailPassword = async (formData) => {
  const payload = registerFormToAuthPayload(formData);

  const response = await authApi.post('/signup', payload);

  return response.data;
};

/**
 * Solicita un nuevo accessToken usando el refreshToken.
 *
 * Se usa cuando el accessToken guardado ya expiró.
 */
export const refreshAccessToken = async (refreshToken) => {
  const response = await authApi.post('/token?grant_type=refresh_token', {
    refresh_token: refreshToken,
  });

  return response.data;
};

/**
 * Cierra sesión en la API externa.
 *
 * Si la API rechaza el token con 401 o 403,
 * no detenemos el logout local del frontend.
 */
export const logoutSession = async (accessToken) => {
  if (!accessToken) return null;

  try {
    const response = await authApi.post(
      '/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    // El token ya no es válido o la API rechazó el cierre.
    // Igual permitimos que el frontend limpie su sesión local.
    if (status === 401 || status === 403) {
      return null;
    }

    throw error;
  }
};

/**
 * Obtiene el contexto completo del usuario autenticado.
 *
 * Este endpoint devuelve:
 * - perfil
 * - roles
 * - permisos
 *
 * Se usa después del login y al restaurar sesión.
 */
export const getMyUserContext = async () => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('No existe una sesión activa');
  }

  const response = await restApi.post(
    '/rpc/obtener_mi_contexto_usuario',
    {},
    {
      headers: getBearerHeaders(accessToken),
    },
  );

  return response.data;
};