// Página administrativa: Pedidos.

import {useState} from 'react';
import {
    Alert,
    Box,
    Stack,
} from '@mui/material'
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useOrders } from '../../../hooks/sales/useOrders';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';

export const OrdersPage = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        estadoPedido: null,
        estadoPago: null,
        fechaInicio: null,
        fechaFin:null,
    }); 
    const [confirm, setConfirm] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [pageNotice, setPageNotice] = useState('');
    // const [formData, setFormData] = useState(initialProductFormData);
    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const {
        orders,
        pagination,
        loading,
        error,
    } = useOrders({
        pageNumber,
        pageSize,
        search,
        estadoPedido:filters.estadoPedido || null,
        estadoPago: filters.estadoPago || null,
        fechaInicio: filters.fechaInicio,
        fechaFin: filters.fechaFin,
        
    });

    const handleSearchChange = (value) => {
        setSearch(value);
        setPageNotice('');
        setPageNumber(1);
    };

    const handleFilterChange = (name, value) => {
        setFilters((current) => ({ ...current, [name]: value }));
        setPageNotice('');
        setPageNumber(1);
    };

    const handleResetFilters = () => {
        setSearch('');
        setFilters({
        categoriaId: '',
        esActivo: '',
        destacado: '',
        requiereCotizacion: '',
        });
        setPageNotice('');
        setPageNumber(1);
    };
    const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPageNumber(1);
    };

    const columns = [
        {
        field: 'imagen_principal_url',
        headerName: 'Imagen',
        type: 'image',
        altField: 'nombre',
        imageSize: 48,
        width: 88,
        },
        {
        field: 'numero_pedido',
        headerName: 'Numero pedido',
        width: 240,
        emptyText: 'Sin nombre',
        },
        {
        field: 'nombre_cliente',
        headerName: 'Cliente',
        width: 190,
        emptyText: 'Sin categoria',
        },
        {
        field: 'telefono_cliente',
        headerName: 'Teléfono',
        width: 280,
        emptyText: 'Sin descripcion',
        },
        {
        field: 'estado_pedido',
        headerName: 'Estado de Pedido',
        type: 'chip',
        width: 150,
        trueLabel: 'Si',
        falseLabel: 'No',
        falseColor: 'default',
        },
        {
        field: 'estado_pago',
        headerName: 'Estado de Pago',
        type: 'chip',
        width: 150,
        trueLabel: 'Si',
        falseLabel: 'No',
        falseColor: 'default',
        },
        {
        field: 'metodo_pago',
        headerName: 'Método de pago',

        width: 135,
        trueLabel: 'Requiere',
        falseLabel: 'No',
        falseColor: 'default',
        },
        {
        field: 'total_items',
        headerName: 'Total de items',

        width: 125,
        trueLabel: 'Activo',
        falseLabel: 'Inactivo',
        },
        {
        field: 'total',
        headerName: 'Monto Total',
        type: 'currency',
        width: 125,
        trueLabel: 'Activo',
        falseLabel: 'Inactivo',
        },
        {
        field: 'inventario_reservado',
        headerName: 'Reservado',
        
        width: 125,
       
        },
        {
        field: 'invetario_descontado',
        headerName: 'Descontado',
        
        width: 125,
        
        },
        {
        field: 'created_at',
        headerName: 'Creacion',
        renderCell: (row)=>row.created_at?.split('T')[0] ?? '-',
        width: 125,
        trueLabel: 'Activo',
        falseLabel: 'Inactivo',
        },
    ];
    const tableFilters = [
    
    {
      name: 'esActivo',
      label: 'Estado',
      type: 'select',
      width: 150,
      options: [
        { label: 'Activos', value: 'true' },
        { label: 'Inactivos', value: 'false' },
      ],
    },
    {
      name: 'destacado',
      label: 'Destacado',
      type: 'select',
      width: 155,
      options: [
        { label: 'Destacados', value: 'true' },
        { label: 'No destacados', value: 'false' },
      ],
    },
    {
      name: 'requiereCotizacion',
      label: 'Cotizacion',
      type: 'select',
      width: 175,
      options: [
        { label: 'Requiere', value: 'true' },
        { label: 'No requiere', value: 'false' },
      ],
    },
  ];
    const actions = [];
    return (
        <PlaceholderPage title="Pedidos" description="Lista pedidos y permite seguimiento administrativo." >  
            <Stack spacing={2}>
        <ErrorMessage message={error } />

        {pageNotice && (
          <Alert severity="info" onClose={() => setPageNotice('')}>
            {pageNotice}
          </Alert>
        )}
        
        <Box>
          <AdminResourceTable
            rows={orders}
            columns={columns}
            actions={actions}
            loading={loading }//|| fetching || detailLoading }
            pagination={pagination}
            searchValue={search}
            searchLabel="Buscar producto"
            filters={tableFilters}
            filterValues={filters}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onPageChange={setPageNumber}
            onPageSizeChange={handlePageSizeChange}
            primaryActionLabel="Nuevo producto"
            emptyTitle="No hay pedidos"
            emptyDescription="Intenta ajustar la busqueda, cambiar filtros o crear un nuevo producto."
            maxHeight={560}
          />
        </Box>
      </Stack>
        
        </PlaceholderPage>
    )
}
