import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  DEFAULT_STORE_SETTINGS,
  getPublicStoreSettings,
  normalizeStoreSettings,
  saveAdminStoreSettings,
} from '../../services/store/storeSettingsService';

const storeSettingsKey = ['store-settings'];

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useStoreSettings = () => {
  const settingsQuery = useQuery({
    queryKey: storeSettingsKey,
    queryFn: getPublicStoreSettings,
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });

  const settings = useMemo(
    () => normalizeStoreSettings(settingsQuery.data || DEFAULT_STORE_SETTINGS),
    [settingsQuery.data],
  );

  return {
    settings,
    loading: settingsQuery.isLoading,
    fetching: settingsQuery.isFetching,
    error: getErrorMessage(settingsQuery.error),
  };
};

export const useAdminStoreSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: storeSettingsKey,
    queryFn: getPublicStoreSettings,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const settings = useMemo(
    () => normalizeStoreSettings(settingsQuery.data || DEFAULT_STORE_SETTINGS),
    [settingsQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: saveAdminStoreSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(storeSettingsKey, normalizeStoreSettings(data));
      queryClient.invalidateQueries({ queryKey: storeSettingsKey });
    },
  });

  return {
    settings,
    loading: settingsQuery.isLoading,
    fetching: settingsQuery.isFetching,
    saving: saveMutation.isPending,
    error: getErrorMessage(settingsQuery.error) || getErrorMessage(saveMutation.error),
    saveSettings: (settingsPayload) => saveMutation.mutateAsync(settingsPayload),
  };
};
