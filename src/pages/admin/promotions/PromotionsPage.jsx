// Página administrativa: Promociones.
import { useState } from 'react';

import { PromotionDetailDialog } from '../../../components/admin/promotions/PromotionDetailDialog';
import { PromotionFormDialog } from '../../../components/admin/promotions/PromotionFormDialog';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { usePromotions } from '../../../hooks/marketing/usePromotions';

const toBooleanFilter = (value) => {
  if (value === '') return null;
  return value === 'true';
};

export const PromotionsPage = () => {

    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [pendingSave, setPendingSave] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        action: null,
        title: '',
        message: '',
    });
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ 
        esActivo: '', 
        tipo_promocion: '',
        tipo_descuento: '',
        fecha_inicio: '',
        fecha_fin: '',
    });


    const {
        promotions,
        pagination,
        loading,
        fetching,
        error,
        saving,
        deleting,
        getPromotionById,
        savePromotion,
        removePromotion,
    } = usePromotions({
        pageNumber,
        pageSize,
        search,
        esActivo: toBooleanFilter(filters.esActivo),
        tipo_promocion: filters.tipo_promocion || null,
        tipo_descuento: filters.tipo_descuento || null,
        fecha_inicio: filters.fecha_inicio || null,
        fecha_fin: filters.fecha_fin || null,
    })

    const columns = [
        { field: 'nombre', headerName: 'Nombre', width: 200 },
        { field: 'tipo_promocion', headerName: 'Tipo de Promoción', width: 150 },
        { field: 'tipo_descuento', headerName: 'Tipo de Descuento', width: 150 },
        { field: 'valor_descuento', headerName: 'Valor de Descuento', width: 150 },
        { field: 'codigo', headerName: 'Código de Cupón', width: 150, emptyText: 'Sin código' },
        { field: 'aplica_a', headerName: 'Aplicable en', width: 150 },
        { field: 'estado_calculado', headerName: 'Estado Promoción', width: 150},
        { field: 'es_activa', headerName: 'Activo', width: 100, renderCell: (value) => value ? 'Sí' : 'No' },
        { field: 'total_aplicaciones', headerName: 'Total Aplicaciones', width: 150 },
        { field: 'updated_at', headerName: 'Última Actualización', width: 200 },
    ];
    const actions = [
        {
            type: 'view',
            label: 'Ver Detalles',
            onClick: async (row) => {
                const id = row?.id;
                try {
                    const promocionCompleta = await getPromotionById(id);
                    if (promocionCompleta) {
                        setSelectedPromotion(promocionCompleta);
                        setDetailOpen(true);
                    }
                } catch (err) {
                    console.error('Error al obtener los detalles completos de la promoción:', err);
                }
            },
        },
        {
            type: 'edit',
            label: 'Editar',
            onClick: async (row) => {
                const id = row?.id;
                try {
                    const promocionCompleta = await getPromotionById(id);
                    if (promocionCompleta) {
                        setSelectedPromotion(promocionCompleta);
                        setFormMode('edit');
                        setFormOpen(true);
                    }
                } catch (err) {
                    console.error('Error al intentar editar la promoción:', err);
                }
            },
        },
        {
            type: 'delete',
            label: 'Eliminar',
            onClick: (promotion) => {
                setConfirmDialog({
                    open: true,
                    action: 'delete',
                    title: `Eliminar promoción: ${promotion.nombre}`,
                    message: '¿Estás seguro de que deseas eliminar esta promoción? Esta acción no se puede deshacer.',
                    onConfirm: () => handleConfirmDelete(promotion.id),
                });
            },
        }
    ];

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
    {
        name: 'tipo_promocion',
        label: 'Tipo de Promoción',
        type: 'select',
        width: 200,
        options: [
            { label: 'Descuento directo', value: 'descuento_directo' },
            { label: 'Cupón', value: 'cupon' },
            { label: 'Envío gratis', value: 'envio_gratis' },
        ],
    },
    {
        name: 'tipo_descuento',
        label: 'Tipo de Descuento',
        type: 'select',
        width: 200,
        options: [
            { label: 'Porcentaje', value: 'porcentaje' },
            { label: 'Monto fijo', value: 'monto_fijo' },
            { label: 'Envío gratis', value: 'envio_gratis' },
        ],
    },
    {
        name: 'fecha_inicio',
        label: 'Creado desde',
        type: 'date',
        width: 170,
    },
    {
        name: 'fecha_fin',
        label: 'Creado hasta',
        type: 'date',
        width: 170,
    }
  ];

    const handleCreatePromotion = () => {
        setSelectedPromotion(null);
        setFormMode('create');
        setFormOpen(true);
    };

    {/* Cambio de tamaño de página*/}
    const handlePageSizeChange = (value) => {
        setPageSize(value);
        setPageNumber(1);
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        setPageNumber(1);
    };

    const handleFilterChange = (name, value) => {
        setFilters((current) => ({ ...current, [name]: value }));
        setPageNumber(1);
    };

    const handleResetFilters = () => {
        setSearch('');
        setFilters({
            esActivo: '',
            tipo_promocion: '',
            tipo_descuento: '',
            fecha_inicio: '',
            fecha_fin: '',
        });
        setPageNumber(1);
    };

    {/* Función para guardar/editar una promoción */}
    const handleSave = async (payload, id) => {
        if (formMode === 'edit') {
            // Para edición, mostrar confirmación
            setPendingSave({ payload, id });
            setConfirmDialog({
                open: true,
                action: 'warning',
                title: 'Guardar cambios',
                message: '¿Deseas guardar los cambios en esta promoción?',
                onConfirm: () => performSave(payload, id),
            });
        } else {
            // Para creación, guardar directamente
            performSave(payload, id);
        }
    };

    {/* Función para ejecutar la guardada real */}
    const performSave = async (payload, id) => {
        try {
            await savePromotion(payload, id);
            setFormOpen(false);
            setSelectedPromotion(null);
            setConfirmDialog(prev => ({ ...prev, open: false }));
            setPendingSave(null);
        } catch (err) {
            console.error("Error al procesar la promoción:", err);
        }
    };

    {/* Función para confirmar y ejecutar la eliminación */}
    const handleConfirmDelete = async (promotionId) => {
        try {
            await removePromotion(promotionId);
            setConfirmDialog(prev => ({ ...prev, open: false }));
            setSelectedPromotion(null);
        } catch (err) {
            console.error("Error al eliminar la promoción:", err);
        }
    };

    return (
        <PlaceholderPage title="Promociones" description="Gestiona descuentos y promociones." >
            <AdminResourceTable
                rows={promotions}
                columns={columns}
                actions={actions}
                pagination={pagination}
                loading={loading || fetching}
                searchValue={search}
                searchLabel="Buscar promoción"
                filters={tableFilters}
                filterValues={filters}
                onSearchChange={handleSearchChange}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                onPageChange={setPageNumber}
                onPageSizeChange={handlePageSizeChange}
                primaryActionLabel="Crear promoción"
                onPrimaryAction={handleCreatePromotion}
                emptyTitle="No hay promociones"
                emptyDescription="Intenta ajustar la búsqueda, cambiar los filtros o crear una nueva promoción."
            />

            <PromotionFormDialog 
                key={`${formMode}-${selectedPromotion?.id ?? 'new'}`}
                open={formOpen}
                onClose={() => { setFormOpen(false); setSelectedPromotion(null); }}
                onSave={handleSave}
                promotion={selectedPromotion}
                mode={formMode}
                loading={saving}
            />

            <PromotionDetailDialog
                open={detailOpen}
                onClose={() => { setDetailOpen(false); setSelectedPromotion(null); }}
                promotion={selectedPromotion}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                action={confirmDialog.action}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                onConfirm={confirmDialog.onConfirm}
                loading={deleting}
            />
        </PlaceholderPage>  
    );
};
