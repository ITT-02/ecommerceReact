// Tabla para mostrar almacenes.

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
import { TableActions } from '../tables/TableActions';
import { EmptyState } from '../common/EmptyState';
import { StatusChip } from '../common/StatusChip';
import { colors } from '../../styles/theme';

export const WarehouseTable = ({ warehouses, onEdit, onDeactivate }) => {
  if (!warehouses || warehouses.length === 0) {
    return <EmptyState title="No hay almacenes" description="Aún no se han registrado almacenes." />;
  }

  return (
    <TableContainer component={Paper} sx={{ backgroundColor: colors.neutral[50] }}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: colors.primary[100] }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: colors.primary[800] }}>Código</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: colors.primary[800] }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: colors.primary[800] }}>Descripción</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: colors.primary[800] }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: colors.primary[800] }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {warehouses.map((warehouse) => (
            <TableRow key={warehouse.id} hover sx={{ '&:hover': { backgroundColor: colors.neutral[100] } }}>
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
                  onDelete={() => onDeactivate(warehouse)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};