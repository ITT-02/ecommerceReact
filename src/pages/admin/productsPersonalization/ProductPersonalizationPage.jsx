// Página administrativa: Opciones de personalización.
// Administra opciones globales que luego se asignan a productos personalizables.

import { useEffect, useMemo, useState } from 'react';

import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';

import {
  Alert,
  Stack,
  Typography,
} from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PageHeader } from '../../../components/common/PageHeader';
import { useCustomizationOptions } from '../../../hooks/catalog/useCustomizationOptions';
import { CUSTOMIZATION_FIELD_TYPES } from '../../../services/catalog/customizationService';

import { CustomizationOptionDialog } from '../productsPersonalization/components/CustomizationOptionDialog';

import {
  formToPayload,
  initialCustomizationOptionForm,
  normalizeCode,
  normalizeText,
  optionToForm,
} from '../../../adapters/catalog/customizationOptionMappers';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const ProductPersonalizationPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialCustomizationOptionForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const [searchValue, setSearchValue] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const {
    options,
    loading,
    fetching,
    saving,
    error,
    saveOption,
    deactivateOption,
  } = useCustomizationOptions();

  const safeOptions = useMemo(
    () => (Array.isArray(options) ? options : []),
    [options],
  );

  const filteredOptions = useMemo(() => {
    const search = normalizeText(searchValue);

    if (!search) return safeOptions;

    return safeOptions.filter((option) => {
      const nombre = normalizeText(option.nombre);
      const codigo = normalizeText(option.codigo);
      const descripcion = normalizeText(option.descripcion);
      const tipoCampo = normalizeText(option.tipo_campo);

      return (
        nombre.includes(search) ||
        codigo.includes(search) ||
        descripcion.includes(search) ||
        tipoCampo.includes(search)
      );
    });
  }, [safeOptions, searchValue]);

  const totalCount = filteredOptions.length;

  const totalPages = Math.max(
    Math.ceil(totalCount / pageSize),
    1,
  );

  const paginatedOptions = useMemo(() => {
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filteredOptions.slice(startIndex, endIndex);
  }, [filteredOptions, pageNumber, pageSize]);

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [pageNumber, totalPages]);

  const handleCreate = () => {
    document.activeElement?.blur?.();
    setFormData(initialCustomizationOptionForm);
    setFormError('');
    setNotice('');
    setFormOpen(true);
  };

  const handleEdit = (option) => {
    document.activeElement?.blur?.();
    setFormData(optionToForm(option));
    setFormError('');
    setNotice('');
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    document.activeElement?.blur?.();
    if (saving) return;

    setFormOpen(false);
    setFormError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'nombre' && !current.id
        ? { codigo: normalizeCode(value) }
        : {}),
    }));
  };

  const handleBooleanChange = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: Boolean(value),
    }));
  };

  const handleSearchChange = (valueOrEvent) => {
    const value = valueOrEvent?.target
      ? valueOrEvent.target.value
      : valueOrEvent;

    setSearchValue(value || '');
    setPageNumber(1);
  };

  const handlePageChange = (...args) => {
    const rawValue = args.length > 1 ? args[1] : args[0];
    const nextPage = Number(rawValue);

    if (!Number.isNaN(nextPage)) {
      setPageNumber(nextPage);
    }
  };

  const handlePageSizeChange = (valueOrEvent) => {
    const rawValue = valueOrEvent?.target
      ? valueOrEvent.target.value
      : valueOrEvent;

    const nextPageSize = Number(rawValue);

    setPageSize(
      PAGE_SIZE_OPTIONS.includes(nextPageSize)
        ? nextPageSize
        : PAGE_SIZE_OPTIONS[0],
    );

    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setPageNumber(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedCode = normalizeCode(formData.codigo || formData.nombre);

    if (!formData.nombre.trim()) {
      setFormError('El nombre de la opción es obligatorio.');
      return;
    }

    if (!normalizedCode) {
      setFormError('El código no es válido. Usa letras, números o guion bajo.');
      return;
    }

    try {
      await saveOption(formToPayload(formData));

      setNotice(
        formData.id
          ? 'Opción actualizada correctamente.'
          : 'Opción creada correctamente.',
      );

      setFormOpen(false);
      setFormData(initialCustomizationOptionForm);
      setFormError('');
      setPageNumber(1);
    } catch (saveError) {
      setFormError(
        saveError?.message ||
          'No se pudo guardar la opción de personalización.',
      );
    }
  };



  const columns = useMemo(
    () => [
      {
        field: 'nombre',
        headerName: 'Opción',
        width: 220,
        renderCell: (row) => (
          <Typography variant="body2" fontWeight={900}>
            {row.nombre}
          </Typography>
        ),
      },
      {
        field: 'codigo',
        headerName: 'Código',
        width: 170,
      },
      {
        field: 'tipo_campo',
        headerName: 'Tipo de campo',
        width: 160,
      },
      {
        field: 'descripcion',
        headerName: 'Descripción',
        width: 320,
        emptyText: '-',
      },
      {
        field: 'acepta_archivo',
        headerName: 'Archivo',
        width: 120,
        type: 'boolean',
        trueLabel: 'Sí',
        falseLabel: 'No',
        falseColor: 'default',
      },
      {
        field: 'es_activo',
        headerName: 'Estado',
        width: 120,
        type: 'boolean',
        trueLabel: 'Activa',
        falseLabel: 'Inactiva',
        falseColor: 'default',
      },
    ],
    [],
  );

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Opciones de personalización"
        description="Define opciones globales como logo, texto, archivo de diseño, color, medidas o acabados. Luego se asignan por producto desde Productos y multimedia."
        icon={<SettingsSuggestOutlinedIcon />}
      />

      <ErrorMessage message={error} />

      {formError && !formOpen && (
        <Alert severity="error" onClose={() => setFormError('')}>
          {formError}
        </Alert>
      )}

      {notice && (
        <Alert severity="success" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}

      <AdminResourceTable
        rows={paginatedOptions}
        columns={columns}
        actions={[
          {
            type: 'edit',
            label: 'Editar',
            onClick: handleEdit,
          },
        ]}
        loading={loading || fetching || saving}
        pagination={{
          totalCount,
          pageNumber,
          pageSize,
          totalPages,
        }}
        searchValue={searchValue}
        searchLabel="Buscar opción"
        filters={[]}
        filterValues={{}}
        onSearchChange={handleSearchChange}
        onFilterChange={() => {}}
        onResetFilters={handleResetFilters}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        primaryActionLabel="Nueva opción"
        onPrimaryAction={handleCreate}
        emptyTitle="No hay opciones de personalización"
        emptyDescription="Crea opciones como Logo, Texto personalizado o Archivo de diseño."
        maxHeight={560}
      />

      <CustomizationOptionDialog
        open={formOpen}
        formData={formData}
        formError={formError}
        saving={saving}
        fieldTypes={CUSTOMIZATION_FIELD_TYPES}
        onClose={handleCloseForm}
        onChange={handleChange}
        onBooleanChange={handleBooleanChange}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
};