import React, { useState } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
  Popover,
  Badge,
  Stack,
  Typography,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  let visibleFilters = [];
  let hiddenFilters = [];

  if (filters.length <= 2) {
    visibleFilters = filters;
    hiddenFilters = [];
  } else {
    visibleFilters = filters.slice(0, 1);
    hiddenFilters = filters.slice(1);
  }

  const activeInPopupCount = hiddenFilters.reduce((acc, filter) => {
    return filterValues[filter.name] ? acc + 1 : acc;
  }, 0);

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

  const renderFilterField = (filter, extraSx = {}) => {
    const value = filterValues[filter.name] ?? '';
    const isSelect = filter.type === 'select';

    return (
      <TextField
        key={filter.name}
        select={isSelect}
        type={!isSelect ? filter.type ?? 'text' : undefined}
        size="small"
        label={filter.label}
        value={value}
        onChange={(event) => onFilterChange?.(filter.name, event.target.value)}
        sx={{
          ...compactFieldSx,
          width: {
            xs: '100%',
            sm: filter.width ?? 150,
          },
          flexShrink: 0,
          ...extraSx,
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FilterAltOutlinedIcon sx={{ fontSize: 18 }} color="action" />
              </InputAdornment>
            ),
          },
          inputLabel:
            filter.type === 'date' || filter.type === 'color'
              ? { shrink: true }
              : undefined,
        }}
      >
        {isSelect && [
          <MenuItem key="all" value="">
            Todos
          </MenuItem>,
          ...(filter.options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          )) || []),
        ]}
      </TextField>
    );
  };

  return (
    <Box
      sx={{
        mb: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
      }}
    >
      {/* Grupo izquierdo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
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
            width: { xs: '100%', sm: 220, md: 240 },
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

        {visibleFilters.map((filter) => renderFilterField(filter))}

        {hiddenFilters.length > 0 && (
          <Badge badgeContent={activeInPopupCount} color="primary">
            <Button
              variant="outlined"
              onClick={handleClick}
              startIcon={<FilterAltOutlinedIcon />}
              endIcon={
                <KeyboardArrowDownIcon sx={{ fontSize: 16, opacity: 0.5 }} />
              }
              sx={{
                height: 40,
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                whiteSpace: 'nowrap',
                backgroundColor: open
                  ? alpha(theme.palette.primary.main, 0.05)
                  : 'transparent',
              }}
            >
              Más filtros
            </Button>
          </Badge>
        )}

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
            flexShrink: 0,
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onPrimaryAction}
            sx={{
              height: 40,
              minWidth: { xs: '100%', md: 165 },
              fontSize: '0.80rem',
              whiteSpace: 'nowrap',
            }}
          >
            {primaryActionLabel}
          </Button>
        </Box>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2.5,
              borderRadius: '12px',
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[4],
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: theme.palette.primary.dark,
              }}
            >
              FILTROS ADICIONALES
            </Typography>

            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {hiddenFilters.map((filter) =>
              renderFilterField(filter, {
                width: {
                  xs: '100%',
                  md: filter.width ?? 180,
                },
              })
            )}
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};