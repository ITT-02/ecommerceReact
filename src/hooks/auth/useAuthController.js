// Controlador principal de autenticación.
// Aquí vive la lógica React + TanStack Query.
// El Provider solo usará este hook y expondrá su resultado globalmente.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authResponseToSession } from '../../adapters/auth/authAdapter';

import {
  getMyUserContext,
  loginWithEmailPassword,
  logoutSession,
  refreshAccessToken,
  registerWithEmailPassword,
} from '../../services/auth/authService';

import {
  clearSession,
  getStoredSession,
  isSessionExpired,
  saveSession,
} from '../../utils/auth/authStorage.js';

/**
 * Query keys centralizadas.
 * Evita escribir strings repetidos y facilita limpiar/invalidatear queries.
 */
const AUTH_KEYS = {
  all: ['auth'],
  session: ['auth', 'session'],
  context: ['auth', 'context'],
};

/**
 * Convierte la respuesta del contexto del usuario a una estructura segura.
 * Así evitamos trabajar con undefined en profile, roles o permissions.
 */
const normalizeUserContext = (data) => ({
  profile: data?.perfil || null,
  roles: Array.isArray(data?.roles) ? data.roles : [],
  permissions: Array.isArray(data?.permisos) ? data.permisos : [],
});

/**
 * Obtiene un mensaje de error legible desde Axios o errores comunes.
 */
const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
};

export const useAuthController = () => {
  const queryClient = useQueryClient();

  /**
   * Error general de autenticación.
   * Se usa para mostrar mensajes en login, register o restauración de sesión.
   */
  const [authError, setAuthError] = useState(null);

  /**
   * Query local de sesión.
   *
   * No llama a la API.
   * Lee la sesión guardada en localStorage usando getStoredSession().
   */
  const { data: session = null, isPending: isSessionPending } = useQuery({
    queryKey: AUTH_KEYS.session,
    queryFn: getStoredSession,
    initialData: getStoredSession,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  /**
   * Indica si existe una sesión con accessToken.
   */
  const isAuthenticated = Boolean(session?.accessToken);

  /**
   * Query del contexto del usuario.
   *
   * Aquí se obtiene perfil, roles y permisos.
   * Solo se ejecuta cuando ya existe una sesión activa.
   */
  const userContextQuery = useQuery({
    queryKey: AUTH_KEYS.context,
    queryFn: getMyUserContext,
    enabled: isAuthenticated && !isSessionPending,
    staleTime: 1000 * 60 * 15,
    retry: false,
    select: normalizeUserContext,
  });

  /**
   * Datos normalizados del contexto.
   */
  const {
    profile = null,
    roles = [],
    permissions = [],
  } = userContextQuery.data || {};

  /**
   * Limpia toda la información de autenticación.
   *
   * Se usa en logout, token inválido o error al restaurar sesión.
   */
  const resetAuthState = useCallback(() => {
    clearSession();

    queryClient.setQueryData(AUTH_KEYS.session, null);

    queryClient.removeQueries({
      queryKey: AUTH_KEYS.context,
    });

    setAuthError(null);
  }, [queryClient]);

  /**
   * Mutation para login.
   * Solo ejecuta la petición; el flujo completo está en login().
   */
  const loginMutation = useMutation({
    mutationFn: loginWithEmailPassword,
  });

  /**
   * Mutation para registro.
   */
  const registerMutation = useMutation({
    mutationFn: registerWithEmailPassword,
  });

  /**
   * Mutation para logout.
   */
  const logoutMutation = useMutation({
    mutationFn: logoutSession,
  });

  /**
   * Restaura o refresca la sesión al cargar la aplicación.
   *
   * Si la sesión existe y no expiró, se mantiene.
   * Si expiró y hay refreshToken, pide un nuevo accessToken.
   * Si no se puede refrescar, limpia la sesión.
   */
  useEffect(() => {
    if (isSessionPending || !session) return;

    if (!isSessionExpired(session)) return;

    const refreshStoredSession = async () => {
      try {
        if (!session.refreshToken) {
          resetAuthState();
          return;
        }

        const response = await refreshAccessToken(session.refreshToken);
        const nextSession = authResponseToSession(response);

        saveSession(nextSession);
        queryClient.setQueryData(AUTH_KEYS.session, nextSession);
      } catch (error) {
        resetAuthState();

        setAuthError(
          getErrorMessage(error, 'No se pudo restaurar la sesión'),
        );
      }
    };

    refreshStoredSession();
  }, [session, isSessionPending, queryClient, resetAuthState]);

  /**
   * Maneja errores al cargar perfil, roles y permisos.
   *
   * Si el backend responde 401, la sesión ya no es válida.
   */
  useEffect(() => {
    if (!userContextQuery.error) return;

    const status = userContextQuery.error?.response?.status;

    if (status === 401) {
      resetAuthState();
      return;
    }

    setAuthError(
      getErrorMessage(
        userContextQuery.error,
        'No se pudo cargar el contexto del usuario',
      ),
    );
  }, [userContextQuery.error, resetAuthState]);

  /**
   * Inicia sesión.
   *
   * Flujo:
   * 1. Envía credenciales.
   * 2. Convierte la respuesta a sesión del frontend.
   * 3. Guarda la sesión en localStorage.
   * 4. Guarda la sesión en TanStack.
   * 5. Carga perfil, roles y permisos.
   * 6. Devuelve roles inmediatamente para redirección.
   */
  const login = useCallback(
    async ({ email, password }) => {
      setAuthError(null);

      try {
        const response = await loginMutation.mutateAsync({
          email,
          password,
        });

        const nextSession = authResponseToSession(response);

        saveSession(nextSession);
        queryClient.setQueryData(AUTH_KEYS.session, nextSession);

        const rawContext = await queryClient.fetchQuery({
          queryKey: AUTH_KEYS.context,
          queryFn: getMyUserContext,
          staleTime: 1000 * 60 * 15,
        });

        const normalizedContext = normalizeUserContext(rawContext);

        queryClient.setQueryData(AUTH_KEYS.context, rawContext);

        return {
          session: nextSession,
          context: normalizedContext,
          roles: normalizedContext.roles,
          permissions: normalizedContext.permissions,
        };
      } catch (error) {
        const message = getErrorMessage(
          error,
          'No se pudo iniciar sesión',
        );

        setAuthError(message);
        throw new Error(message);
      }
    },
    [loginMutation, queryClient],
  );

  /**
   * Registra un usuario.
   *
   * No inicia sesión automáticamente.
   */
  const register = useCallback(
    async (formData) => {
      setAuthError(null);

      try {
        return await registerMutation.mutateAsync(formData);
      } catch (error) {
        const message = getErrorMessage(
          error,
          'No se pudo crear la cuenta',
        );

        setAuthError(message);
        throw new Error(message);
      }
    },
    [registerMutation],
  );

  /**
   * Cierra sesión.
   *
   * Intenta cerrar sesión en la API.
   * Luego limpia la sesión local siempre.
   */
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync(session?.accessToken);
    } finally {
      resetAuthState();
    }
  }, [logoutMutation, session?.accessToken, resetAuthState]);

  /**
   * Recarga manualmente perfil, roles y permisos.
   *
   * Útil después de editar perfil o actualizar permisos.
   */
  const reloadUserContext = useCallback(async () => {
    const context = await queryClient.fetchQuery({
      queryKey: AUTH_KEYS.context,
      queryFn: getMyUserContext,
      staleTime: 1000 * 60 * 15,
    });

    return normalizeUserContext(context);
  }, [queryClient]);

  /**
   * Helpers para validar roles y permisos.
   * Se usan en rutas protegidas, menús y botones condicionados.
   */
  const accessHelpers = useMemo(
    () => ({
      hasRole: (role) => roles.includes(role),

      hasAnyRole: (allowedRoles = []) =>
        allowedRoles.length === 0 ||
        allowedRoles.some((role) => roles.includes(role)),

      hasPermission: (permission) =>
        permissions.includes('*') || permissions.includes(permission),

      hasAnyPermission: (allowedPermissions = []) =>
        allowedPermissions.length === 0 ||
        permissions.includes('*') ||
        allowedPermissions.some((permission) =>
          permissions.includes(permission),
        ),
    }),
    [roles, permissions],
  );

  /**
   * Loading general de autenticación.
   */
  const loading =
    isSessionPending ||
    loginMutation.isPending ||
    registerMutation.isPending ||
    logoutMutation.isPending ||
    userContextQuery.isFetching;

  /**
   * Objeto final expuesto por AuthProvider.
   */
  return useMemo(
    () => ({
      session,
      user: session?.user || null,
      profile,
      roles,
      permissions,

      loading,
      initializing: isSessionPending,
      authError,
      isAuthenticated,

      login,
      register,
      logout,
      reloadUserContext,

      ...accessHelpers,
    }),
    [
      session,
      profile,
      roles,
      permissions,
      loading,
      isSessionPending,
      authError,
      isAuthenticated,
      login,
      register,
      logout,
      reloadUserContext,
      accessHelpers,
    ],
  );
};