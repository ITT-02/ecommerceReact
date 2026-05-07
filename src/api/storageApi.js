/**
 * Cliente Axios para archivos de la API externa.
 *
 * Para:
 * - subir imágenes de productos, banners, comprobantes de pago
 * - leer archivos públicos o protegidos
 */

import axios from 'axios';
import { ENV } from '../config/env';
import { getAccessToken} from '../utils/auth/authStorage';

export const storageApi = axios.create({
  baseURL: ENV.STORAGE_BASE_URL,
  headers: {
    apikey: ENV.API_KEY,
  },
});

storageApi.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});