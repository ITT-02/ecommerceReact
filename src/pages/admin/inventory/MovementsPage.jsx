import React, { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { MovementForm } from './components/MovementForm';
import { CancelMovementDialog } from './components/CancelMovementDialog';
import { MovementDetailDialog } from './components/MovementDetailDialog';
// Ajusta las rutas de los imports según tu estructura
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { useInventoryMovements } from '../../../hooks/inventory/useInventoryMovements';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';

export const MovementsPage = () => {
    // 1. Estados para los parámetros de la tabla (Paginación, Filtros y Búsqueda)
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState({});

    // 2. Extraer el valor del filtro de "Tipo" si el usuario lo selecciona
    const tipoMovimiento = filterValues?.tipoMovimiento === 'todos' ? null : filterValues?.tipoMovimiento;

    // 3. Ejecutar el hook con los parámetros actuales
    const { 
        movements, 
        pagination, 
        isLoading, 
        cancelMovement, 
        isCanceling,
        registerMovement, 
        isRegistering
    } = useInventoryMovements({
        pageNumber,
        pageSize,
        search,
        tipoMovimiento: tipoMovimiento || null
    });

    // 4. Estados temporales para los modales
    const [movimientoAnular, setMovimientoAnular] = useState(null);
    const [openRegistrarModal, setOpenRegistrarModal] = useState(false);
    const [movimientoDetalle, setMovimientoDetalle] = useState(null);
    // TODO: En los próximos pasos agregaremos los siguientes modales:
    // const [openDetalleModal, setOpenDetalleModal] = useState(null);
    // const [openRegistrarModal, setOpenRegistrarModal] = useState(false);

    // ---> Funciones auxiliares de UX/UI
    const getTipoColor = (tipo) => {
        const colors = { entrada: 'info', salida: 'warning', ajuste: 'secondary', reserva: 'primary', liberacion: 'success' };
        return colors[tipo] || 'default';
    };

    const formatFecha = (fechaStr) => {
        if (!fechaStr) return '-';
        return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(fechaStr));
    };

    // ---> Definición de las columnas según tu README
    const columns = [
        { field: 'created_at', headerName: 'Fecha', width: 150, renderCell: (row) => <Typography variant="caption">{formatFecha(row.created_at)}</Typography> },
        { 
            field: 'tipo_movimiento', headerName: 'Tipo', width: 120, 
            renderCell: (row) => (
                <Chip label={row.tipo_movimiento} size="small" color={getTipoColor(row.tipo_movimiento)} sx={{ textTransform: 'capitalize' }} variant="filled" />
            ) 
        },
        { field: 'producto_nombre', headerName: 'Producto', width: 190, renderCell: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.producto_nombre}</Typography> },
        { field: 'nombre_variante', headerName: 'Variante', width: 140 },
        { field: 'almacen_nombre', headerName: 'Almacén', width: 130 },
        { field: 'cantidad', headerName: 'Cant.', align: 'center', width: 80, renderCell: (row) => <Typography sx={{ fontWeight: 'bold' }}>{row.cantidad}</Typography> },
        { field: 'referencia_tipo', headerName: 'Motivo', width: 140, renderCell: (row) => <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{row.referencia_tipo?.replace('_', ' ')}</Typography> },
        { 
            field: 'anulado', headerName: 'Anulado', align: 'center', width: 90, 
            renderCell: (row) => (
                <Chip 
                  label={row.anulado ? "Sí" : "No"} 
                  size="small" 
                  color={row.anulado ? "success" : "error"} 
                  variant="outlined"                        
                  sx={{ fontWeight: 'bold' }}               
                />
            ) 
        }
    ];

    // ---> Acciones de la tabla y Filtros disponibles
    const rowActions = [
        { 
            icon: <VisibilityOutlinedIcon color="info" />,  // "info" te dará un azul claro muy visible e intuitivo para leer / ver
            label: 'Ver detalle', 
            onClick: (row) => setMovimientoDetalle(row)
        },
        { 
            icon: <BlockOutlinedIcon color="error" />, // "error" te dará el color rojo de alerta
            label: 'Anular', 
            disabled: (row) => row.anulado || row.referencia_tipo === 'anulacion',
            onClick: (row) => setMovimientoAnular(row) 
        }
    ];

    const filtersConfig = [
        { 
            name: 'tipoMovimiento', 
            label: 'Tipo Movimiento', 
            type: 'select', 
            options: [ 
                { label: 'Entradas', value: 'entrada' }, 
                { label: 'Salidas', value: 'salida' },
                { label: 'Ajustes', value: 'ajuste' },
                { label: 'Reservas', value: 'reserva' },
                { label: 'Liberaciones', value: 'liberacion' }
            ] 
        }
    ];

    return (
        <PlaceholderPage
            title="Movimientos de Inventario"
            description="Registra entradas, salidas, ajustes, reservas y liberaciones de stock."
        >

            <AdminResourceTable
                rows={movements}
                columns={columns}
                actions={rowActions}
                loading={isLoading}
                
                // Paginación enviada tal cual la devuelve el hook
                pagination={pagination}
                
                // Handlers para que funcione desde AdminResourceTable
                searchValue={search}
                searchLabel="Buscar por producto, variante o notas..."
                onSearchChange={(val) => { setSearch(val); setPageNumber(1); }}
                
                filterValues={filterValues}
                filters={filtersConfig}
                onFilterChange={(name, val) => { setFilterValues(prev => ({...prev, [name]: val})); setPageNumber(1); }}
                onResetFilters={() => { setFilterValues({}); setPageNumber(1); }}
                
                // onPageChange recibe directamente "1, 2, 3", así que actualizamos el state sin sumar nada
                onPageChange={(nuevaPagina) => setPageNumber(nuevaPagina)} 
                onPageSizeChange={(nuevoZise) => { setPageSize(nuevoZise); setPageNumber(1); }}
                
                primaryActionLabel="Nuevo Movimiento"
                onPrimaryAction={() => setOpenRegistrarModal(true)} 
                
                emptyTitle="No hay movimientos"
                emptyDescription="Aún no se ha realizado ninguna entrada, salida o ajuste en el sistema."
            />

            {/* 1. Modal para Crear Movimiento */}
            {openRegistrarModal && (
                <MovementForm
                    open={openRegistrarModal}
                    onClose={() => setOpenRegistrarModal(false)}
                    onSubmit={registerMovement}
                    isSubmitting={isRegistering} /* Pasamos el estado de carga desde el hook Tanstack */
                />
            )}

            {/* 2. Modal de Anulación Personalizado (Que pide un motivo) */}
            <CancelMovementDialog
                open={Boolean(movimientoAnular)}
                movimiento={movimientoAnular}
                isCanceling={isCanceling}
                onClose={() => setMovimientoAnular(null)}   
                onConfirm={cancelMovement} /* Dispara el mutation y nosotros manejamos la Invalidación Query  */
            />

            {/* 3. Modal para Ver los Detalles Estáticos en Pantalla */}
            <MovementDetailDialog
                open={Boolean(movimientoDetalle)}
                movimiento={movimientoDetalle}
                onClose={() => setMovimientoDetalle(null)}
            />

        </PlaceholderPage>
    );
};