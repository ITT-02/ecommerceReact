// Tabla para mostrar almacenes

import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TableActions } from '../tables/TableActions';
import { EmptyState } from '../common/EmptyState';
import { StatusChip } from '../common/StatusChip';


export const WarehouseTable = ({ warehouses, onEdit, onDeactivate, onDelete }) => {
  const theme = useTheme();

  if (!warehouses || warehouses.length === 0) {
    return <EmptyState title="No hay almacenes" description="Aún no se han registrado almacenes." />;
  }

  return (
    <TableContainer component={Paper}>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Código</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Descripción</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {warehouses.map((warehouse) => (
            <TableRow key={warehouse.id} hover>

              <TableCell>{warehouse.codigo}</TableCell>
              <TableCell>{warehouse.nombre}</TableCell>
              <TableCell>{warehouse.descripcion || '-'}</TableCell>
              <TableCell>
                <StatusChip
                  label={warehouse.es_activo ? 'Activo' : 'Inactivo'}
                  color={warehouse.es_activo ? 'success' : 'error'}
                />
              </TableCell>
              <TableCell>
                <TableActions
                  onEdit={() => onEdit(warehouse)}
                  onDelete={onDelete ? () => onDelete(warehouse) : undefined}
                  onDeactivate={onDeactivate ? () => onDeactivate(warehouse) : undefined}
                />

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};