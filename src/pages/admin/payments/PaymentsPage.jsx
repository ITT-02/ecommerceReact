import React, { useState, useMemo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

// Componentes comunes
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { ChangePaymentStatusDialog } from './components/ChangePaymentStatusDialog';
import { PaymentDetailDialog } from './components/PaymentDetailDialog';
import { RelatedOrderDialog } from './components/RelatedOrderDialog';
// El hook que acabamos de crear
import { useAdminPayments, usePaymentMethodOptions } from '../../../hooks/sales/useAdminPayments';
import {getTodayDateInputValue} from '../../../utils/formatters';

export const PaymentsPage = () => {
    // 1. Estados para los parámetros de la API
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState({
    fecha_fin: getTodayDateInputValue(),
    });

    // 2. Extraer valores limpios de filtros
    const estadoPago = filterValues?.estado === 'todos' ? null : filterValues?.estado;
    const metodoPago = filterValues?.metodo_pago === 'todos' ? null : filterValues?.metodo_pago;
    const fechaInicio = filterValues?.fecha_inicio || null;
    const fechaFin = filterValues?.fecha_fin || null;

    // 3. Ejecutar el hook
    const { 
        pagos, 
        pagination, 
        isLoading, 
        updateStatus,      
        isUpdating        
    } = useAdminPayments({
        pageNumber,
        pageSize,
        search,
        estado: estadoPago || null,
        metodoPago: metodoPago || null,
        fechaInicio,
        fechaFin,
    });

    // 4. Estados para controlar apertura de modales (crearemos los modales después)
    const [pagoDetalle, setPagoDetalle] = useState(null);
    const [pagoCambiarEstado, setPagoCambiarEstado] = useState(null);
    const [pedidoRelacionado, setPedidoRelacionado] = useState(null);

    // --- Helpers visuales ---
    const getStatusColor = (estado) => {
        const colors = { 
            pendiente: 'warning', 
            aprobado: 'success', 
            rechazado: 'error' 
        };
        return colors[estado] || 'default';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
    };

    const formatFecha = (fechaStr) => {
        if (!fechaStr) return '-';
        return new Intl.DateTimeFormat('es-ES', { 
            day: '2-digit', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        }).format(new Date(fechaStr));
    };
    //Filtro metodos de pago
    const {
        data: paymentMethodOptions = [],
        isLoading: isLoadingPaymentMethods,
        } = usePaymentMethodOptions();

    // --- Configuración de DataTable ---
    const columns = [
        { field: 'numero_pedido', headerName: 'N° Pedido', width: 130, renderCell: (row) => 
        <Typography variant="caption" sx={{
        fontWeight: 700,
        fontSize: '0.78rem',
        color: 'text.primary',
       }}>{row.numero_pedido}</Typography> },

        { field: 'nombre_cliente', headerName: 'Cliente', width: 220 },
        { field: 'metodo_pago', headerName: 'Método', width: 120, renderCell: (row) => <Typography sx={{ textTransform: 'capitalize' }}>{row.metodo_pago}</Typography> },
        { field: 'monto', headerName: 'Monto', width: 110, renderCell: (row) => <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>{formatCurrency(row.monto)}</Typography> },
        { 
            field: 'estado', headerName: 'Estado', width: 130, 
            renderCell: (row) => (
                <Chip 
                    label={row.estado} 
                    size="small" 
                    color={getStatusColor(row.estado)} 
                    variant="filled"
                    sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }} 
                />
            ) 
        },
        { field: 'referencia_transaccion', headerName: 'Referencia', width: 150 },
        { field: 'created_at', headerName: 'Fecha', width: 160, renderCell: (row) => <Typography variant="caption">{formatFecha(row.created_at)}</Typography> },
    ];

    const rowActions = [
        { 
            type: 'view',
            label: 'Ver Detalle del Pago', 
            onClick: (row) => setPagoDetalle(row)
        },
        { 
            type: 'edit',
            label: 'Cambiar Estado', 
            onClick: (row) => setPagoCambiarEstado(row)
        },
        { 
            icon: <ShoppingBagOutlinedIcon color="secondary" />,
            label: 'Ver Pedido Relacionado', 
            onClick: (row) => setPedidoRelacionado(row)
        }
    ];

    // Opciones sacadas del backend (apoyo.md)
   const filtersConfig = useMemo(() => [
        {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
            { label: 'Pendientes', value: 'pendiente' },
            { label: 'Aprobados', value: 'aprobado' },
            { label: 'Rechazados', value: 'rechazado' },
            ],
        },
        {
            name: 'metodo_pago',
            label: 'Método',
            type: 'select',
            options: paymentMethodOptions,
        },
        {
            name: 'fecha_inicio',
            label: 'Desde',
            type: 'date',
            width: 155,
            maxDate: filterValues.fecha_fin || undefined,
            disableFuture: true,
        },
        {
            name: 'fecha_fin',
            label: 'Hasta',
            type: 'date',
            width: 155,
            minDate: filterValues.fecha_inicio || undefined,
            disableFuture: true,
        },
        ], [ paymentMethodOptions,
            filterValues.fecha_inicio,
            filterValues.fecha_fin,]);

    return (
        <PlaceholderPage
            title="Gestión de Pagos"
            description="Revisa comprobantes y administra los estados de pago de los pedidos."
        >
            <AdminResourceTable
                rows={pagos}
                columns={columns}
                actions={rowActions}
                loading={isLoading || isLoadingPaymentMethods}
                
                pagination={pagination}
                
                searchValue={search}
                searchLabel="Buscar por N° pedido, cliente o referencia..."
                onSearchChange={(val) => { setSearch(val); setPageNumber(1); }}
                
                filterValues={filterValues}
                filters={filtersConfig}
                onFilterChange={(name, val) => { setFilterValues(prev => ({...prev, [name]: val})); setPageNumber(1); }}
                onResetFilters={() => {
                                setFilterValues({
                                    fecha_fin: getTodayDateInputValue(),
                                });
                                setPageNumber(1);
                                }}
                
                onPageChange={(page) => setPageNumber(page)} 
                onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }}
                
                // Estos pagos no se "crean" aquí, nacen del pedido del cliente frontend. Ocultamos botón primario.
                primaryActionLabel={null} 
                
                emptyTitle="No se encontraron pagos"
                emptyDescription="No hay registros de pago que coincidan con la búsqueda actual."
            />
            
            {/* AQUÍ IRÁN LOS 3 MODALES QUE CONSTRUIREMOS */}
            <ChangePaymentStatusDialog
             open={Boolean(pagoCambiarEstado)}
             pago={pagoCambiarEstado}
             isUpdating={isUpdating} // Proviene del useAdminPayments
             onClose={() => setPagoCambiarEstado(null)} // Cerrar
             onConfirm={updateStatus} // La mutación del useAdminPayments
            />
            
            <PaymentDetailDialog
               open={Boolean(pagoDetalle)}
               pagoId={pagoDetalle?.id}
               onClose={() => setPagoDetalle(null)}
            />

            <RelatedOrderDialog
               open={Boolean(pedidoRelacionado)}
               pedidoId={pedidoRelacionado?.pedido_id}
               onClose={() => setPedidoRelacionado(null)}
            />

        </PlaceholderPage>
    );
};