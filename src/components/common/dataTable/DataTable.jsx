import {
  Avatar,
  Box,
  ButtonBase,
  Chip,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

/**
 * Obtiene el valor de una celda usando el nombre del campo.
 */
const getCellValue = (row, field) => {
  return field ? row?.[field] : undefined;
};

/**
 * Genera los números visibles de la paginación.
 *
 * Ejemplos:
 * < 1 2 3 ... 10 >
 * < 1 ... 5 6 7 ... 10 >
 * < 1 ... 8 9 10 >
 */
const getPaginationItems = (pageNumber, totalPages) => {
  if (totalPages <= 1) return [1];

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];

  let start = Math.max(2, pageNumber - 1);
  let end = Math.min(totalPages - 1, pageNumber + 1);

  if (pageNumber <= 3) {
    start = 2;
    end = 3;
  }

  if (pageNumber >= totalPages - 2) {
    start = totalPages - 2;
    end = totalPages - 1;
  }

  if (start > 2) {
    items.push('start-ellipsis');
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push('end-ellipsis');
  }

  items.push(totalPages);

  return items;
};

/**
 * Botón de acción reutilizable para cada fila.
 */
const TableActionButton = ({ action, row }) => {
  const theme = useTheme();

  const iconMap = {
    view: <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />,
    edit: <EditOutlinedIcon sx={{ fontSize: 17 }} />,
    deactivate: <HighlightOffOutlinedIcon sx={{ fontSize: 17 }} />,
    delete: <DeleteOutlinedIcon sx={{ fontSize: 17 }} />,
  };

  const colorMap = {
    view: theme.palette.info.main,
    edit: theme.palette.success.main,
    deactivate: theme.palette.warning.main,
    delete: theme.palette.error.main,
  };

  const actionColor =
    action.color ?? colorMap[action.type] ?? theme.palette.text.secondary;

  return (
    <Tooltip title={action.label}>
      <span>
        <IconButton
          size="small"
          disabled={action.disabled?.(row)}
          onClick={() => action.onClick?.(row)}
          aria-label={action.label}
          sx={{
            width: 30,
            height: 30,
            p: 0,
            borderRadius: 1,
            border: `1px solid ${alpha(actionColor, 0.25)}`,
            color: actionColor,
            backgroundColor: alpha(actionColor, 0.06),
            '&:hover': {
              backgroundColor: alpha(actionColor, 0.12),
              borderColor: alpha(actionColor, 0.45),
            },
            '&.Mui-disabled': {
              opacity: 0.45,
            },
          }}
        >
          {action.icon ?? iconMap[action.type]}
        </IconButton>
      </span>
    </Tooltip>
  );
};

/**
 * Renderiza el contenido de una celda según el tipo de columna.
 */
const renderCellContent = ({ row, column }) => {
  const value = getCellValue(row, column.field);

  if (column.renderCell) {
    return column.renderCell(row);
  }

  if (column.type === 'image') {
    return (
      <Avatar
        src={value || column.fallback}
        alt={column.altField ? row?.[column.altField] : column.headerName}
        variant="rounded"
        sx={{
          width: column.imageSize ?? 44,
          height: column.imageSize ?? 44,
          borderRadius: 1,
        }}
      />
    );
  }

  if (column.type === 'boolean') {
    const isTrue = Boolean(value);

    return (
      <Chip
        size="small"
        label={
          isTrue
            ? column.trueLabel ?? 'Activo'
            : column.falseLabel ?? 'Inactivo'
        }
        color={
          isTrue
            ? column.trueColor ?? 'success'
            : column.falseColor ?? 'error'
        }
        variant="outlined"
      />
    );
  }

  if (column.type === 'chip') {
    return (
      <Chip
        size="small"
        label={value ?? column.emptyText ?? '-'}
        color={column.color ?? 'default'}
        variant={column.variant ?? 'outlined'}
      />
    );
  }

  if (column.type === 'currency') {
    return (
      <Typography variant="body2" fontWeight={700}>
        S/ {Number(value ?? 0).toFixed(2)}
      </Typography>
    );
  }

  return (
    <Typography
      variant="body2"
      sx={{
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        lineHeight: 1.45,
      }}
    >
      {value ?? column.emptyText ?? '-'}
    </Typography>
  );
};

/**
 * Barra inferior de paginación.
 */
const DataTablePaginationBar = ({
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const theme = useTheme();

  const totalCount = pagination?.totalCount ?? 0;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const pageNumber = Math.min(
    Math.max(pagination?.pageNumber ?? 1, 1),
    totalPages
  );
  const pageSize = pagination?.pageSize ?? 10;

  const pageItems = getPaginationItems(pageNumber, totalPages);

  const paginationButtonSx = {
    p: 0,
    minWidth: 28,
    width: 28,
    height: 28,
    borderRadius: 1,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.65)}`,
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    fontSize: '0.76rem',
    fontWeight: 700,
    lineHeight: 1,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '&.Mui-disabled': {
      opacity: 0.45,
      borderColor: alpha(theme.palette.primary.main, 0.25),
    },
  };

  const selectedButtonSx = {
    ...paginationButtonSx,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  };

  const goToPreviousPage = () => {
    onPageChange?.(Math.max(1, pageNumber - 1));
  };

  const goToNextPage = () => {
    onPageChange?.(Math.min(totalPages, pageNumber + 1));
  };

  return (
    <Box
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        px: 1.25,
        py: 0.8,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        {/* Paginación compacta */}
        <Stack
          direction="row"
          spacing={0.5}
          useFlexGap
          sx={{
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <IconButton
            size="small"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            sx={paginationButtonSx}
          >
            <NavigateBeforeIcon sx={{ fontSize: 16 }} />
          </IconButton>

          {pageItems.map((item, index) => {
            if (typeof item === 'string') {
              return (
                <Box
                  key={`${item}-${index}`}
                  sx={{
                    width: 20,
                    textAlign: 'center',
                    color: 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  ...
                </Box>
              );
            }

            const isSelected = item === pageNumber;

            return (
              <ButtonBase
                key={item}
                onClick={() => onPageChange?.(item)}
                sx={isSelected ? selectedButtonSx : paginationButtonSx}
              >
                {item}
              </ButtonBase>
            );
          })}

          <IconButton
            size="small"
            onClick={goToNextPage}
            disabled={pageNumber >= totalPages}
            sx={paginationButtonSx}
          >
            <NavigateNextIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        {/* Selector compacto al extremo derecho */}
        <Box
        sx={{
            ml: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexWrap: 'wrap',
        }}
        >
        <Typography
            variant="caption"
            sx={{
            color: 'text.secondary',
            fontWeight: 600,
            }}
        >
            Mostrar
        </Typography>

        <FormControl size="small">
            <Select
            value={pageSize}
            onChange={(event) => {
                onPageSizeChange?.(Number(event.target.value));
                onPageChange?.(1);
            }}
            sx={{
                height: 28,
                minWidth: 62,
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: 1,
                '& .MuiSelect-select': {
                py: 0.35,
                px: 1,
                },
            }}
            >
            {[5, 10, 20, 50].map((size) => (
                <MenuItem key={size} value={size}>
                {size}
                </MenuItem>
            ))}
            </Select>
        </FormControl>

        <Typography
            variant="caption"
            sx={{
            color: 'text.secondary',
            fontWeight: 600,
            }}
        >
            registros
        </Typography>

        <Typography
            variant="caption"
            sx={{
            mx: 0.5,
            color: 'divider',
            fontWeight: 700,
            }}
        >
            |
        </Typography>

        <Typography
            variant="caption"
            sx={{
            color: 'text.secondary',
            fontWeight: 600,
            }}
        >
            Total:
        </Typography>

        <Typography
        variant="caption"
        sx={{
            fontWeight: 800,
            color: 'primary.main',
        }}
        >
        {totalCount}
        </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

/**
 * Tabla reutilizable para módulos administrativos.
 */
export const DataTable = ({
  columns = [],
  rows = [],
  actions = [],
  loading = false,
  emptyTitle = 'No hay registros',
  emptyDescription = 'Aún no se registraron datos.',
  pagination,
  onPageChange,
  onPageSizeChange,
  maxHeight = 540,
}) => {
  const theme = useTheme();
  const hasActions = actions.length > 0;

  const headerBackground =
    theme.palette.mode === 'dark'
      ? theme.palette.primary.dark
      : theme.palette.primary.light;

  const actionColumnWidth = 96;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      <TableContainer
        sx={{
          maxHeight,
          overflow: 'auto',
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            minWidth: 980,
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field ?? column.id}
                  align={column.align ?? 'left'}
                  sx={{
                    width: column.width ?? 180,
                    minWidth: column.minWidth ?? column.width ?? 160,
                    maxWidth: column.maxWidth ?? column.width ?? 260,
                    position: 'sticky',
                    top: 0,
                    zIndex: 5,
                    py: 1.35,
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                    backgroundColor: headerBackground,
                    backgroundImage: 'none',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backgroundClip: 'padding-box',
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}

              {hasActions && (
                <TableCell
                  align="center"
                  sx={{
                    width: actionColumnWidth,
                    minWidth: actionColumnWidth,
                    maxWidth: actionColumnWidth,
                    position: 'sticky',
                    top: 0,
                    right: 0,
                    zIndex: 20,
                    py: 1.35,
                    fontWeight: 800,
                    textAlign: 'center',
                    color: theme.palette.text.primary,
                    backgroundColor: headerBackground,
                    backgroundImage: 'none',
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    boxShadow: '-8px 0 12px -10px rgba(0,0,0,0.35)',
                    backgroundClip: 'padding-box',
                  }}
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)}>
                  <Box
                    sx={{
                      py: 5,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle1">
                      {emptyTitle}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {emptyDescription}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {rows.map((row) => (
              <TableRow key={row.id} hover>
                {columns.map((column) => (
                  <TableCell
                    key={column.field ?? column.id}
                    align={column.align ?? 'left'}
                    sx={{
                      width: column.width ?? 180,
                      minWidth: column.minWidth ?? column.width ?? 160,
                      maxWidth: column.maxWidth ?? column.width ?? 260,
                      verticalAlign: 'top',
                      py: 1.2,
                    }}
                  >
                    {renderCellContent({ row, column })}
                  </TableCell>
                ))}

                {hasActions && (
                  <TableCell
                    align="center"
                    sx={{
                      width: actionColumnWidth,
                      minWidth: actionColumnWidth,
                      maxWidth: actionColumnWidth,
                      position: 'sticky',
                      right: 0,
                      zIndex: 3,
                      p: 0.75,
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      backgroundColor: theme.palette.background.paper,
                      backgroundImage: 'none',
                      borderLeft: `1px solid ${theme.palette.divider}`,
                      boxShadow: '-8px 0 12px -10px rgba(0,0,0,0.22)',
                      backgroundClip: 'padding-box',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        width: '100%',
                        mx: 'auto',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {actions.map((action) => (
                        <TableActionButton
                          key={action.type ?? action.label}
                          action={action}
                          row={row}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <DataTablePaginationBar
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </Paper>
  );
};
