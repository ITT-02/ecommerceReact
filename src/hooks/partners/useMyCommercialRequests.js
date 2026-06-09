import { useQuery } from '@tanstack/react-query';

import { getMyCommercialRequestsStatus } from '../../services/partners/myCommercialRequestsService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useMyCommercialRequests = () => {
  const statusQuery = useQuery({
    queryKey: ['my-commercial-requests-status'],
    queryFn: getMyCommercialRequestsStatus,
  });

  return {
    data: statusQuery.data ?? {
      perfil: {},
      mayorista: null,
      socioComercial: null,
      esMayoristaAprobado: false,
      esSocioComercialAprobado: false,
    },
    loading: statusQuery.isLoading,
    fetching: statusQuery.isFetching,
    error: getErrorMessage(statusQuery.error),
    refetch: statusQuery.refetch,
  };
};
