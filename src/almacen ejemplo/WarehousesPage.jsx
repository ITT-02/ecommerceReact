import { useState } from 'react';
import { Container } from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useWarehouses } from '../../../hooks/inventory/useWarehouses';

export const WarehousesPage = () => {
  // Datos que se enviarán al endpoint paginado.
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState('');

  // Filtros propios de almacenes.
  // esActivo: '' = todos, 'true' = activos, 'false' = inactivos.
  const [filters, setFilters] = useState({
    esActivo: '',
  });

  const {
    warehouses,
    pagination,
    loading,
    error,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
  } = useWarehouses({
    pageNumber,
    pageSize,
    search,
    esActivo:
      filters.esActivo === ''
        ? null
        : filters.esActivo === 'true',
  });

  const handleSearchChange = (value) => {
    setSearch(value);
    setPageNumber(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPageNumber(1);
  };

  const handleResetFilters = () => { 
    setSearchValue(''); 
    setFilterValues({ seUsaEnFiltro: "", seUsaEnVariantes: "", esObligatorio: "" }); 
    setPageNumber(1); 
  };

  // Editar usa el id de la fila y consulta el detalle.
  const handleEdit = async (warehouse) => {
    try {
      console.log('Fila seleccionada:', warehouse);
      console.log('ID enviado al endpoint:', warehouse.id);

      const warehouseDetail = await getWarehouseById(warehouse.id);

      console.log('Detalle recibido:', warehouseDetail);

      // Luego aquí se cargará el formulario de edición.
    } catch (error) {
      console.error('Error cargando almacén:', error);
    }
  };

  // Columnas que se mostrarán en la tabla.
  // field debe coincidir con el nombre que devuelve el backend.
  const columns = [
    { field: 'nombre', headerName: 'Nombre', width: 170, renderCell: (row) => <Typography fontWeight={600}>{row.nombre}</Typography> },
    { field: 'valores', headerName: 'Valores', width: 230, renderCell: (row) => <ValoresSummary atributoId={row.id} refreshKey={refreshKey} /> },
    { field: 'tipo_dato', headerName: 'Tipo', width: 100, renderCell: (row) => <Typography variant="body2" sx={{textTransform: 'capitalize'}}>{row.tipo_dato}</Typography> },
    { 
      field: 'se_usa_en_filtro', headerName: 'Filtrable', align: 'center', width: 120, type: 'boolean' 
    },
    { 
      field: 'se_usa_en_variantes', headerName: 'Variante', align: 'center', width: 120, type: 'boolean'
    },
    { 
      field: 'es_obligatorio', headerName: 'Obligatorio', align: 'center', width: 120, type: 'boolean'
    },
    { field: 'updated_at', headerName: 'Actualizado', width: 140, renderCell: (row) => <Typography variant="caption">{formatFecha(row.updated_at || row.created_at)}</Typography> },
  ];

  // Filtros que aparecerán arriba de la tabla.
  // name debe coincidir con la propiedad en el estado filters.
  const tableFilters = [
    {
      name: 'esActivo',
      label: 'Estado',
      type: 'select',
      width: 170,
      options: [
        { label: 'Activos', value: 'true' },
        { label: 'Inactivos', value: 'false' },
      ],
    },
  ];

  // Botones que aparecerán en la columna Acciones.
  const actions = [
    {
      type: 'edit',
      label: 'Editar',
      onClick: handleEdit,
    },
    {
      type: 'delete',
      label: 'Eliminar',
      onClick: (warehouse) => {
        console.log('Eliminar almacén:', warehouse);
      },
    },
  ];

  return (
    <PlaceholderPage title="Almacenes" description="Gestiona almacenes.">
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          width: '100%',
          px: {
            xs: 1,
            sm: 2,
            md: 3,
          },
          py: {
            xs: 1.5,
            md: 2.5,
          },
        }}
      >
        <ErrorMessage message={error} />

        <AdminResourceTable
        // Registros que se mostrarán en la tabla.
        // En este caso viene del hook useWarehouses().
        rows={warehouses}

        // Configuración de columnas.
        // Define qué campos se muestran: código, nombre, descripción, estado, etc.
        columns={columns}

        // Configuración de botones por fila.
        // Ejemplo: editar, eliminar, ver detalle, desactivar.
        actions={actions}

        // Indica si la tabla está cargando datos.
        // Sirve para mostrar estado de carga.
        loading={loading}

        // Información de paginación.
        // Incluye totalCount, pageNumber, pageSize, totalPages, etc.
        pagination={pagination}

        // Valor actual del input de búsqueda.
        // Se conecta con el estado search.
        searchValue={search}

        // Texto que aparece como label del input de búsqueda.
        searchLabel="Buscar"

        // Configuración de filtros visibles.
        // Ejemplo: filtro Estado con Activos/Inactivos.
        filters={tableFilters}

        // Valores actuales de los filtros.
        // Ejemplo: { esActivo: 'true' }
        filterValues={filters}

        // Función que se ejecuta cuando cambia el texto de búsqueda.
        // Actualiza search y reinicia la página a 1.
        onSearchChange={handleSearchChange}

        // Función que se ejecuta cuando cambia un filtro.
        // Recibe name y value.
        // Ejemplo: handleFilterChange('esActivo', 'true')
        onFilterChange={handleFilterChange}

        // Función para limpiar búsqueda y filtros.
        // Regresa search a '' y los filtros a su valor inicial.
        onResetFilters={handleResetFilters}

        // Función que cambia la página actual.
        // La usa la paginación.
        onPageChange={setPageNumber}

        // Función que cambia cuántos registros se muestran por página.
        // Ejemplo: 5, 10, 20, 50.
        onPageSizeChange={setPageSize}

        // Texto del botón principal.
        // En este caso aparece como "Agregar almacén".
        primaryActionLabel="Agregar almacén"

        // Función que se ejecuta al presionar el botón principal.
        // Más adelante aquí se abrirá el formulario de creación.
        onPrimaryAction={() => {
            console.log('Abrir formulario');
        }}

        // Título cuando no hay registros para mostrar.
        emptyTitle="No hay almacenes"

        // Mensaje cuando la tabla está vacía.
        emptyDescription="Intenta ajustar los filtros o agregar un nuevo registro."

        // Alto máximo del área de la tabla.
        // Si hay muchas filas, se activa scroll interno.
        maxHeight={420}
        />
      </Container>
    </PlaceholderPage>
  );
};