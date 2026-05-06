// Página administrativa: Categorías.

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';

export const CategoriesPage = () => {
    return (
        <>
            <PlaceholderPage title="Categorías" description="Gestiona categorías principales." />;
            <AdminResourceTable
                rows={[]}
                columns={[]}   
                actions={[]}
                loading={false}
                pagination={{ page: 1, pageSize: 10, total: 0 }}
                searchValue=""
                searchLabel="Buscar categorías..."
                filterValues={{}}
                filters={[]}
                onSearchChange={() => {}}
                onFilterChange={() => {}}
                onResetFilters={() => {}}
                onPageChange={() => {}}
                onPageSizeChange={() => {}}
                primaryActionLabel="Crear categoría"
                onPrimaryAction={() => {}}
                emptyTitle="No hay categorías"
                emptyDescription="Crea tu primera categoría para organizar tus productos."
            />  
        </>
    );
};
