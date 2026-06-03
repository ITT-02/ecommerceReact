import { restApi } from '../../api/restApi';

const normalizeText = (value) => String(value ?? '').trim();

const normalizeCountry = (country = {}) => ({
  ...country,
  codigo_iso2: normalizeText(country.codigo_iso2),
  codigo_iso3: normalizeText(country.codigo_iso3),
  nombre: normalizeText(country.nombre),
});

const normalizeDepartment = (department = {}) => ({
  ...department,
  codigo: normalizeText(department.codigo),
  nombre: normalizeText(department.nombre),
});

const normalizeProvince = (province = {}) => ({
  ...province,
  codigo: normalizeText(province.codigo),
  departamento_codigo: normalizeText(province.departamento_codigo),
  nombre: normalizeText(province.nombre),
});

const normalizeDistrict = (district = {}) => ({
  ...district,
  ubigeo: normalizeText(district.ubigeo),
  departamento_codigo: normalizeText(district.departamento_codigo),
  provincia_codigo: normalizeText(district.provincia_codigo),
  nombre: normalizeText(district.nombre),
});

export const getCountries = async () => {
  const response = await restApi.get('/paises', {
    params: {
      select: 'codigo_iso2,nombre,codigo_iso3,permite_envio,orden',
      es_activo: 'eq.true',
      order: 'orden.asc,nombre.asc',
    },
  });

  return (response.data ?? []).map(normalizeCountry).filter((country) => country.codigo_iso2);
};

export const getPeruDepartments = async () => {
  const response = await restApi.get('/pe_departamentos', {
    params: {
      select: 'codigo,nombre',
      es_activo: 'eq.true',
      order: 'nombre.asc',
    },
  });

  return (response.data ?? []).map(normalizeDepartment).filter((department) => department.codigo);
};

export const getPeruProvincesByDepartment = async (departamentoCodigo) => {
  const code = normalizeText(departamentoCodigo);

  if (!code) return [];

  const response = await restApi.get('/pe_provincias', {
    params: {
      select: 'codigo,departamento_codigo,nombre',
      departamento_codigo: `eq.${code}`,
      es_activo: 'eq.true',
      order: 'nombre.asc',
    },
  });

  return (response.data ?? []).map(normalizeProvince).filter((province) => province.codigo);
};

export const getPeruDistrictsByProvince = async (provinciaCodigo) => {
  const code = normalizeText(provinciaCodigo);

  if (!code) return [];

  const response = await restApi.get('/pe_distritos', {
    params: {
      select:
        'ubigeo,departamento_codigo,provincia_codigo,nombre,permite_envio,costo_envio_base,dias_entrega_min,dias_entrega_max',
      provincia_codigo: `eq.${code}`,
      es_activo: 'eq.true',
      order: 'nombre.asc',
    },
  });

  return (response.data ?? []).map(normalizeDistrict).filter((district) => district.ubigeo);
};
