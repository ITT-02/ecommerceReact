import { useQuery, useQueryClient,useMutation } from '@tanstack/react-query';

import {getRoles,
        getRoleDetail,
        getPermissionOptions,
        updateRole,
        assignRolePermissions
} from '../../services/users/roleService'; 

const roleQueryKey = ['roles-admin'];

export const useRoles = ({
    search = null,
}={})=>{
    const queryClient = useQueryClient();
    const rolesQuery = useQuery({
        queryKey:[...roleQueryKey, search],
        queryFn:()=>getRoles(search),
    });
    const permissionsQuery = useQuery({
        queryKey: ['role-permission-options'],
        queryFn: getPermissionOptions,
    });
    const updateMutation = useMutation({
        mutationFn: updateRole,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: roleQueryKey }),
    });

    const assignPermissionsMutation = useMutation({
        mutationFn: assignRolePermissions,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: roleQueryKey }),
    });
    return {
        roles: rolesQuery.data ?? [],
        permissionOptions: permissionsQuery.data ?? [],

        loading: rolesQuery.isLoading,
        fetching: rolesQuery.isFetching,
        permissionsLoading: permissionsQuery.isLoading,

        error:
        rolesQuery.error?.message ||
        permissionsQuery.error?.message ||
        updateMutation.error?.message ||
        assignPermissionsMutation.error?.message ||
        null,

        saving:
        updateMutation.isPending ||
        assignPermissionsMutation.isPending,

        getRoleDetail,

        updateRole: async (form) => {
        await updateMutation.mutateAsync(form);
        return true;
        },

        assignRolePermissions: async (form) => {
        await assignPermissionsMutation.mutateAsync(form);
        return true;
        },
    };
}