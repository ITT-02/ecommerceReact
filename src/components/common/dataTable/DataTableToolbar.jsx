import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

/**
 * Barra de búsqueda, filtros y boton agregar.
 *
 * Diseño:
 * - Izquierda: Buscar + filtros + limpiar en una sola fila.
 * - Derecha: botón principal.
 * - En móvil puede bajar; en escritorio se mantiene en una sola línea.
 */
export const DataTableToolbar = ({
  searchValue = '',
  searchLabel = 'Buscar',
  filters = [],
  filterValues = {},
  onSearchChange,
  onFilterChange,
  onResetFilters,
  primaryActionLabel,
  onPrimaryAction,
}) => {
  const hasActiveFilters =
    Boolean(searchValue) || Object.values(filterValues).some(Boolean);

  const compactFieldSx = {
    '& .MuiInputBase-root': {
      height: 40,
      fontSize: '0.88rem',
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.86rem',
    },
  };

  return (
    <Box
      sx={{
        mb: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: {
          xs: 'wrap',
          md: 'nowrap',
        },
      }}
    >
      {/* Grupo izquierdo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: {
            xs: 'wrap',
            md: 'nowrap',
          },
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Buscar */}
        <TextField
          size="small"
          label={searchLabel}
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          sx={{
            ...compactFieldSx,
            width: {
              xs: '100%',
              sm: 220,
              md: 240,
            },
            flexShrink: 0,
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} color="action" />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Filtros */}
        {filters.map((filter) => {
          const value = filterValues[filter.name] ?? '';

          if (filter.type === 'select') {
            return (
              <TextField
                key={filter.name}
                select
                size="small"
                label={filter.label}
                value={value}
                onChange={(event) =>
                  onFilterChange?.(filter.name, event.target.value)
                }
                sx={{
                  ...compactFieldSx,
                  width: {
                    xs: '100%',
                    sm: filter.width ?? 150,
                    md: filter.width ?? 150,
                  },
                  flexShrink: 0,
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterAltOutlinedIcon
                          sx={{ fontSize: 18 }}
                          color="action"
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>

                {filter.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            );
          }

          return (
            <TextField
              key={filter.name}
              size="small"
              type={filter.type ?? 'text'}
              label={filter.label}
              value={value}
              onChange={(event) =>
                onFilterChange?.(filter.name, event.target.value)
              }
              sx={{
                ...compactFieldSx,
                width: {
                  xs: '100%',
                  sm: filter.width ?? 150,
                  md: filter.width ?? 150,
                },
                flexShrink: 0,
              }}
            />
          );
        })}

        {/* Limpiar */}
        {hasActiveFilters && (
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={onResetFilters}
            sx={{
              height: 40,
              minWidth: 105,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              fontSize: '0.84rem',
            }}
          >
            Limpiar
          </Button>
        )}
      </Box>

      {/* Grupo derecho */}
      {primaryActionLabel && onPrimaryAction && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: {
              xs: 'stretch',
              md: 'flex-end',
            },
            width: {
              xs: '100%',
              md: 'auto',
            },
            flexShrink: 0,
            pl: {
              xs: 0,
              md: 2,
            },
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onPrimaryAction}
            sx={{
              height: 40,
              minWidth: {
                xs: '100%',
                md: 165,
              },
              whiteSpace: 'nowrap',
              fontSize: '0.80rem',
            }}
          >
            {primaryActionLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
};