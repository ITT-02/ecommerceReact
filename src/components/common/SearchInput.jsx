// Input de búsqueda reutilizable.

import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField } from '@mui/material';

export const SearchInput = ({ value, onChange, placeholder = 'Buscar...' }) => {
  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start"><SearchIcon /></InputAdornment>
          ),
        },
      }}
    />
  );
};
