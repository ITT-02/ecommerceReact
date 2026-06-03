import { useMemo } from 'react';
import { Alert, CircularProgress, Grid, MenuItem, TextField } from '@mui/material';

import {
  useCountries,
  usePeruDepartments,
  usePeruDistricts,
  usePeruProvinces,
} from '../../../hooks/location/useLocations';

const DEFAULT_COUNTRY = 'PE';

const DEFAULT_COUNTRIES = [
  {
    codigo_iso2: 'PE',
    nombre: 'Perú',
    codigo_iso3: 'PER',
    permite_envio: true,
    orden: 1,
  },
];

const normalizeCode = (value) => String(value ?? '').trim();
const getDepartmentCodeFromUbigeo = (ubigeo = '') => normalizeCode(ubigeo).slice(0, 2);
const getProvinceCodeFromUbigeo = (ubigeo = '') => normalizeCode(ubigeo).slice(0, 4);

const normalizeCountry = (country = {}) => ({
  ...country,
  codigo_iso2: normalizeCode(country.codigo_iso2),
  nombre: String(country.nombre ?? '').trim(),
});

const buildCountryOptions = ({ countries, selectedCountry }) => {
  const normalizedCountries = (countries || [])
    .map(normalizeCountry)
    .filter((country) => country.codigo_iso2);

  const baseCountries = normalizedCountries.length > 0 ? normalizedCountries : DEFAULT_COUNTRIES;
  const hasSelectedCountry = baseCountries.some(
    (country) => country.codigo_iso2 === selectedCountry,
  );

  if (hasSelectedCountry) return baseCountries;

  return [
    ...baseCountries,
    {
      codigo_iso2: selectedCountry,
      nombre: selectedCountry === DEFAULT_COUNTRY ? 'Perú' : `País ${selectedCountry}`,
    },
  ];
};

const getSelectValue = ({ value, options, optionKey, isLoading }) => {
  const normalizedValue = normalizeCode(value);

  if (!normalizedValue) return '';
  if (isLoading) return '';

  return options.some((option) => normalizeCode(option?.[optionKey]) === normalizedValue)
    ? normalizedValue
    : '';
};

export const AddressLocationFields = ({ value = {}, onChange, errors = {}, disabled = false }) => {
  const paisCodigo = normalizeCode(value.pais_codigo) || DEFAULT_COUNTRY;
  const isPeru = paisCodigo === DEFAULT_COUNTRY;

  const departamentoCodigo =
    normalizeCode(value.departamento_codigo) ||
    (isPeru ? getDepartmentCodeFromUbigeo(value.ubigeo) : '');

  const provinciaCodigo =
    normalizeCode(value.provincia_codigo) ||
    (isPeru ? getProvinceCodeFromUbigeo(value.ubigeo) : '');

  const distritoUbigeo = isPeru ? normalizeCode(value.ubigeo) : '';

  const { data: countriesData = [], isLoading: loadingCountries } = useCountries();
  const { data: departmentsData = [], isLoading: loadingDepartments } = usePeruDepartments();
  const { data: provincesData = [], isLoading: loadingProvinces } =
    usePeruProvinces(departamentoCodigo);
  const { data: districtsData = [], isLoading: loadingDistricts } =
    usePeruDistricts(provinciaCodigo);

  const countries = useMemo(
    () => buildCountryOptions({ countries: countriesData, selectedCountry: paisCodigo }),
    [countriesData, paisCodigo],
  );

  const departments = useMemo(
    () =>
      (departmentsData || []).map((department) => ({
        ...department,
        codigo: normalizeCode(department.codigo),
      })),
    [departmentsData],
  );

  const provinces = useMemo(
    () =>
      (provincesData || []).map((province) => ({
        ...province,
        codigo: normalizeCode(province.codigo),
      })),
    [provincesData],
  );

  const districts = useMemo(
    () =>
      (districtsData || []).map((district) => ({
        ...district,
        ubigeo: normalizeCode(district.ubigeo),
      })),
    [districtsData],
  );

  const departmentSelectValue = getSelectValue({
    value: departamentoCodigo,
    options: departments,
    optionKey: 'codigo',
    isLoading: loadingDepartments,
  });

  const provinceSelectValue = getSelectValue({
    value: provinciaCodigo,
    options: provinces,
    optionKey: 'codigo',
    isLoading: loadingProvinces,
  });

  const districtSelectValue = getSelectValue({
    value: distritoUbigeo,
    options: districts,
    optionKey: 'ubigeo',
    isLoading: loadingDistricts,
  });

  const updateLocation = (patch) => {
    onChange?.({
      ...value,
      ...patch,
    });
  };

  const handleCountryChange = (event) => {
    const nextCountry = normalizeCode(event.target.value) || DEFAULT_COUNTRY;

    updateLocation({
      pais_codigo: nextCountry,
      departamento_codigo: '',
      provincia_codigo: '',
      ubigeo: '',
      departamento: '',
      provincia: '',
      distrito: '',
      region_texto: '',
      ciudad_texto: '',
    });
  };

  const handleDepartmentChange = (event) => {
    const nextCode = normalizeCode(event.target.value);
    const department = departments.find((item) => item.codigo === nextCode);

    updateLocation({
      departamento_codigo: nextCode,
      provincia_codigo: '',
      ubigeo: '',
      departamento: department?.nombre || '',
      provincia: '',
      distrito: '',
    });
  };

  const handleProvinceChange = (event) => {
    const nextCode = normalizeCode(event.target.value);
    const province = provinces.find((item) => item.codigo === nextCode);

    updateLocation({
      provincia_codigo: nextCode,
      ubigeo: '',
      provincia: province?.nombre || '',
      distrito: '',
    });
  };

  const handleDistrictChange = (event) => {
    const nextUbigeo = normalizeCode(event.target.value);
    const district = districts.find((item) => item.ubigeo === nextUbigeo);
    const department = departments.find((item) => item.codigo === departamentoCodigo);
    const province = provinces.find((item) => item.codigo === provinciaCodigo);

    updateLocation({
      ubigeo: nextUbigeo,
      departamento_codigo: departamentoCodigo,
      provincia_codigo: provinciaCodigo,
      departamento: department?.nombre || value.departamento || '',
      provincia: province?.nombre || value.provincia || '',
      distrito: district?.nombre || '',
    });
  };

  const handleTextChange = (event) => {
    const { name, value: nextValue } = event.target;
    updateLocation({ [name]: nextValue });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          required
          fullWidth
          size="small"
          label="País"
          value={paisCodigo}
          disabled={disabled || loadingCountries}
          onChange={handleCountryChange}
          error={Boolean(errors.pais_codigo)}
          helperText={errors.pais_codigo || 'Selecciona el país de entrega.'}
        >
          {countries.map((country) => (
            <MenuItem key={country.codigo_iso2} value={country.codigo_iso2}>
              {country.nombre}
            </MenuItem>
          ))}

          {loadingCountries && (
            <MenuItem disabled value="__loading_countries">
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Cargando países...
            </MenuItem>
          )}
        </TextField>
      </Grid>

      {isPeru ? (
        <>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              required
              fullWidth
              size="small"
              label="Departamento"
              value={departmentSelectValue}
              disabled={disabled || loadingDepartments}
              onChange={handleDepartmentChange}
              error={Boolean(errors.ubigeo)}
            >
              <MenuItem value="">Seleccionar departamento</MenuItem>
              {departments.map((department) => (
                <MenuItem key={department.codigo} value={department.codigo}>
                  {department.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              required
              fullWidth
              size="small"
              label="Provincia"
              value={provinceSelectValue}
              disabled={disabled || !departamentoCodigo || loadingProvinces}
              onChange={handleProvinceChange}
              error={Boolean(errors.ubigeo)}
            >
              <MenuItem value="">Seleccionar provincia</MenuItem>
              {provinces.map((province) => (
                <MenuItem key={province.codigo} value={province.codigo}>
                  {province.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              required
              fullWidth
              size="small"
              label="Distrito"
              value={districtSelectValue}
              disabled={disabled || !provinciaCodigo || loadingDistricts}
              onChange={handleDistrictChange}
              error={Boolean(errors.ubigeo)}
              helperText={errors.ubigeo || 'Selecciona el distrito de entrega.'}
            >
              <MenuItem value="">Seleccionar distrito</MenuItem>
              {districts.map((district) => (
                <MenuItem key={district.ubigeo} value={district.ubigeo}>
                  {district.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </>
      ) : (
        <>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" variant="outlined">
              Ingresa la región y ciudad para coordinar la entrega.
            </Alert>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              fullWidth
              size="small"
              name="region_texto"
              label="Región / Estado / Provincia"
              value={value.region_texto || ''}
              disabled={disabled}
              onChange={handleTextChange}
              error={Boolean(errors.region_texto)}
              helperText={errors.region_texto}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              fullWidth
              size="small"
              name="ciudad_texto"
              label="Ciudad"
              value={value.ciudad_texto || ''}
              disabled={disabled}
              onChange={handleTextChange}
              error={Boolean(errors.ciudad_texto)}
              helperText={errors.ciudad_texto}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};
