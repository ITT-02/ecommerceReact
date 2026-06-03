import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createContactMessage,
  deleteContactMessage,
  getAdminContactMessages,
  markContactMessageRead,
} from '../../services/store/storeContactService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useCreateContactMessage = () => {
  const createMutation = useMutation({
    mutationFn: createContactMessage,
  });

  return {
    sending: createMutation.isPending,
    error: getErrorMessage(createMutation.error),
    createMessage: (payload) => createMutation.mutateAsync(payload),
  };
};

export const useAdminContactMessages = ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estado = null,
  motivo = null,
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ['admin-contact-messages', pageNumber, pageSize, search, estado, motivo, fechaInicio, fechaFin],
    queryFn: () => getAdminContactMessages({ pageNumber, pageSize, search, estado, motivo, fechaInicio, fechaFin }),
  });

  const invalidateMessages = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] });
    queryClient.invalidateQueries({ queryKey: ['admin-attention-counters'] });
  };

  const readMutation = useMutation({
    mutationFn: markContactMessageRead,
    onSuccess: invalidateMessages,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: invalidateMessages,
  });

  return {
    messages: messagesQuery.data?.items ?? [],
    pagination: {
      totalCount: messagesQuery.data?.totalCount ?? 0,
      pageNumber: messagesQuery.data?.pageNumber ?? pageNumber,
      pageSize: messagesQuery.data?.pageSize ?? pageSize,
      totalPages: messagesQuery.data?.totalPages ?? 0,
      hasPreviousPage: messagesQuery.data?.hasPreviousPage ?? false,
      hasNextPage: messagesQuery.data?.hasNextPage ?? false,
    },
    loading: messagesQuery.isLoading,
    fetching: messagesQuery.isFetching,
    saving: readMutation.isPending || deleteMutation.isPending,
    error: getErrorMessage(messagesQuery.error) || getErrorMessage(readMutation.error) || getErrorMessage(deleteMutation.error),
    markAsRead: (id) => readMutation.mutateAsync(id),
    deleteMessage: (id) => deleteMutation.mutateAsync(id),
  };
};
