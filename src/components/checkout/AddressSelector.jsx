// Selector de dirección de entrega.

import { MenuItem, TextField } from '@mui/material';

export const AddressSelector = ({ addresses = [], value, onChange }) => <TextField select label="Dirección" value={value} onChange={onChange}>{addresses.map((address) => <MenuItem key={address.id} value={address.id}>{address.etiqueta || address.direccion_linea_1}</MenuItem>)}</TextField>;
