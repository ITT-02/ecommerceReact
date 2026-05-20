// Página administrativa: Promociones.
import { useState } from 'react';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { usePromotions } from '../../../hooks/marketing/usePromotions';

export const PromotionsPage = () => {

    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
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
    } = usePromotions({
        pageNumber,
        pageSize,
        search,
        esActivo: null,
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
            onClick: (id) => {
                // Lógica para ver detalles de promoción
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

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPageNumber(1);
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
        </PlaceholderPage>
    );
};
