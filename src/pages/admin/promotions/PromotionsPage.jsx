// Página administrativa: Promociones.
import { useState } from 'react';

import { PromotionDetailDialog } from '../../../components/admin/promotions/PromotionDetailDialog';
import { PromotionFormDialog } from '../../../components/admin/promotions/PromotionFormDialog';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { usePromotions } from '../../../hooks/marketing/usePromotions';

export const PromotionsPage = () => {

    const [openDetail, setOpenDetail] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ esActivo: '' });
    const [detailLoading, setDetailLoading] = useState(false);
    const [formError, setFormError] = useState(null);


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
        esActivo: filters.esActivo === '' ? null : filters.esActivo === 'true',
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
            onClick: async (idOrRow) => {
                // Extraemos el id dinámicamente sin importar si la tabla manda el ID o la fila entera
                const id = typeof idOrRow === 'object' ? idOrRow.id : idOrRow;
                
                try {
                    // 1. Vamos al backend a traer la data completa (incluyendo la tabla de aplicaciones)
                    const promocionCompleta = await getPromotionById(id);
                    
                    if (promocionCompleta) {
                        // 2. Guardamos el objeto rico en datos en el estado y abrimos el modal
                        setSelectedPromotion(promocionCompleta);
                        setOpenDetail(true);
                    }
                } catch (err) {
                    console.error("Error al obtener los detalles completos de la promoción:", err);
                    // Opcional: Aquí puedes gatillar un toast o alerta visual de error
                }
            },
        },
        {
            type: 'edit',
            label: 'Editar',
            onClick: (id) => {
                // Lógica para editar promoción
            },
        },
        {
            type: 'deactivate',
            label: 'Activar/Desactivar',
            onClick: (id) => {
                // Lógica para activar/desactivar promoción
            },
        },
        {
            type: 'delete',
            label: 'Eliminar',
            onClick: (id) => {
                // Lógica para eliminar promoción
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
    }
  ];

    const handleOpenDetail = (row) => {
        setSelectedPromotion(row); // <--- Aquí guardas el registro específico del renglón
        setOpenDetail(true);
    };

    {/* Cambio de tamaño de página*/}
    const handlePageSizeChange = (value) => {
        setPageSize(value);
        setPageNumber(1);
    };

    {/* Función para guardar/editar una promoción */}
    const handleSave = async (payload, id) => {
        try {
            // Si pasamos el id, la mutation llamará a updatePromotion; si es null, usará createPromotion
            await savePromotion(payload, id); 
            setFormOpen(false);
            setSelectedPromotion(null);
        } catch (err) {
            console.error("Error al procesar la promoción:", err);
        }
    };

    return (
        <PlaceholderPage title="Promociones" description="Gestiona descuentos y promociones." >
            <AdminResourceTable
                rows={promotions}
                columns={columns}
                actions={actions}
                pagination={pagination}
                loading={loading}
                pagination={pagination}
                searchValue={search}
                filters={tableFilters}
                onPageSizeChange = {handlePageSizeChange}
            />

            <PromotionDetailDialog 
                open={openDetail} 
                onClose={() => setOpenDetail(false)} 
                promotion={selectedPromotion} // Pasamos la promoción elegida
            />

            <PromotionFormDialog 
                open={formOpen}
                onClose={() => { setFormOpen(false); setSelectedPromotion(null); }}
                onSave={handleSave}
                promotion={selectedPromotion} // Se pasa el objeto de la fila al editar o null al crear
                loading={saving}
            />
        </PlaceholderPage>  
    );
};
