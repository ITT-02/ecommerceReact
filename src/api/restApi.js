/**
 * Cliente Axios para consumir tablas, vistas y funciones especiales
 * de la API externa.
 *
 * Siempre envía la API key pública en el header apikey.
 * Si el usuario inició sesión, también envía su access_token.
 */

import axios from 'axios';
import { ENV } from '../config/env';
import { getAccessToken } from '../utils/auth/authStorage';

export const restApi = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    apikey: ENV.API_KEY,
    'Content-Type': 'application/json',
  },
});

restApi.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});