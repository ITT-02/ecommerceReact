/**
 * Cliente Axios para autenticación de la API externa.
 *
 * Se usa para:
 * - iniciar sesión
 * - registrar usuarios normales
 * - refrescar token
 * - cerrar sesión
 */

import axios from 'axios';
import { ENV } from '../config/env';

export const authApi = axios.create({
  baseURL: ENV.AUTH_BASE_URL,
  headers: {
    apikey: ENV.API_KEY,
    'Content-Type': 'application/json',
  },
});