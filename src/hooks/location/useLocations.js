import { useQuery } from '@tanstack/react-query';

import {
  getCountries,
  getPeruDepartments,
  getPeruDistrictsByProvince,
  getPeruProvincesByDepartment,
} from '../../services/location/locationService';

const ONE_HOUR = 1000 * 60 * 60;

export const useCountries = () => {
  return useQuery({
    queryKey: ['locations', 'countries'],
    queryFn: getCountries,
    staleTime: ONE_HOUR,
  });
};

export const usePeruDepartments = () => {
  return useQuery({
    queryKey: ['locations', 'PE', 'departments'],
    queryFn: getPeruDepartments,
    staleTime: ONE_HOUR,
  });
};

export const usePeruProvinces = (departamentoCodigo) => {
  return useQuery({
    queryKey: ['locations', 'PE', 'provinces', departamentoCodigo],
    queryFn: () => getPeruProvincesByDepartment(departamentoCodigo),
    enabled: Boolean(departamentoCodigo),
    staleTime: ONE_HOUR,
  });
};

export const usePeruDistricts = (provinciaCodigo) => {
  return useQuery({
    queryKey: ['locations', 'PE', 'districts', provinciaCodigo],
    queryFn: () => getPeruDistrictsByProvince(provinciaCodigo),
    enabled: Boolean(provinciaCodigo),
    staleTime: ONE_HOUR,
  });
};
