import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  getAdminPermissionDetail,
  getAdminPermissions,
} from '../../services/users/permissionService';

const ADMIN_PERMISSION_KEYS = {
  list: (params) => ['admin-permissions', 'list', params],
  detail: (id) => ['admin-permissions', 'detail', id],
};

const groupPermissionsByModule = (permissions = []) => {
  const map = new Map();

  permissions.forEach((permission) => {
    const moduleName = permission.modulo || 'general';

    if (!map.has(moduleName)) {
      map.set(moduleName, {
        modulo: moduleName,
        total_permisos: 0,
        permisos: [],
      });
    }

    const group = map.get(moduleName);
    group.permisos.push(permission);
    group.total_permisos += 1;
  });

  return Array.from(map.values()).sort((a, b) =>
    a.modulo.localeCompare(b.modulo),
  );
};

export const useAdminPermissions = ({ search = '', modulo = null } = {}) => {
  const query = useQuery({
    queryKey: ADMIN_PERMISSION_KEYS.list({ search, modulo }),
    queryFn: () => getAdminPermissions({ search, modulo }),
    staleTime: 1000 * 60 * 5,
  });

  const permissions = query.data || [];

  const modules = useMemo(
    () => groupPermissionsByModule(permissions),
    [permissions],
  );

  const moduleOptions = useMemo(() => {
    const uniqueModules = Array.from(
      new Set(permissions.map((permission) => permission.modulo).filter(Boolean)),
    );

    return uniqueModules
      .sort((a, b) => a.localeCompare(b))
      .map((moduleName) => ({
        value: moduleName,
        label: moduleName,
      }));
  }, [permissions]);

  return {
    permissions,
    modules,
    moduleOptions,
    loading: query.isLoading,
    fetching: query.isFetching,
    error:
      query.error?.response?.data?.message ||
      query.error?.message ||
      '',
    refetch: query.refetch,
  };
};

export const useAdminPermissionDetail = (permissionId, enabled = false) => {
  const query = useQuery({
    queryKey: ADMIN_PERMISSION_KEYS.detail(permissionId),
    queryFn: () => getAdminPermissionDetail(permissionId),
    enabled: Boolean(permissionId) && enabled,
    staleTime: 1000 * 60 * 5,
  });

  return {
    detail: query.data || null,
    loading: query.isLoading,
    error:
      query.error?.response?.data?.message ||
      query.error?.message ||
      '',
  };
};
