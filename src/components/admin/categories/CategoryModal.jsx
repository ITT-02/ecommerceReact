import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    ListSubheader,
    MenuItem,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';

import { alpha, useTheme } from '@mui/material/styles';

import CloseIcon from '@mui/icons-material/Close';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

import { FileUploadField } from '../../common/Field/FileUploadField';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { CATEGORY_ICON_OPTIONS } from '../../../utils/categoryIconOptions';

const DEFAULT_CATEGORY_ICON_VALUE = 'category';
const DEFAULT_CATEGORY_COLOR = '#C9A227';

const isValidHexColor = (value) => /^#([0-9A-F]{6})$/i.test(value);

const getIconOptionByValue = (iconValue) => {
    return (
        CATEGORY_ICON_OPTIONS.find((option) => option.value === iconValue) ??
        CATEGORY_ICON_OPTIONS.find((option) => option.value === DEFAULT_CATEGORY_ICON_VALUE) ??
        CATEGORY_ICON_OPTIONS[0]
    );
};
const getSafeIconValue = (iconValue) => {
    const exists = CATEGORY_ICON_OPTIONS.some((option) => option.value === iconValue);

    return exists ? iconValue : DEFAULT_CATEGORY_ICON_VALUE;
};
const groupIconOptions = () => {
    const groups = {};

    CATEGORY_ICON_OPTIONS.forEach((option) => {
        const groupName = option.group || 'General';

        if (!groups[groupName]) {
            groups[groupName] = [];
        }

        groups[groupName].push(option);
    });

    return Object.entries(groups).map(([group, options]) => ({
        group,
        options,
    }));
};

const Section = ({ title, children }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: `${theme.palette.custom?.radius?.lg ?? 16}px`,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
            }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                {title}
            </Typography>

            {children}
        </Paper>
    );
};

export const CategoryModal = ({
    open,
    onClose,
    onSave,
    category = null,
    parentCategory = null,
    isLoading = false,
}) => {
    const theme = useTheme();

    const groupedIconOptions = useMemo(() => groupIconOptions(), []);

    const initialFormData = useMemo(() => {
        if (category) {
            return {
                categoria_padre_id: category.categoria_padre_id ?? null,
                nombre: category.nombre || '',
                descripcion: category.descripcion || '',
                orden_visual: category.orden_visual ?? 1,
                icono: getSafeIconValue(category.icono),
                es_visible: category.es_visible ?? true,
                es_activa: category.es_activa ?? true,
                imagen_url: category.imagen_url || '',
                imagen_path: category.imagen_path || '',
                color_hex: category.color_hex || DEFAULT_CATEGORY_COLOR,
                _file: null,
            };
        }

        return {
            categoria_padre_id: parentCategory?.id ?? null,
            nombre: '',
            descripcion: '',
            orden_visual: 1,
            icono: getSafeIconValue(parentCategory?.icono),
            es_visible: true,
            es_activa: true,
            imagen_url: '',
            imagen_path: '',
            color_hex: parentCategory?.color_hex || DEFAULT_CATEGORY_COLOR,
            _file: null,
        };
    }, [category, parentCategory]);

    const [formData, setFormData] = useState(initialFormData);
    const [color, setColor] = useState(initialFormData.color_hex);
    const [errors, setErrors] = useState({});
    const [pendingSaveData, setPendingSaveData] = useState(null);
    const [openConfirmSave, setOpenConfirmSave] = useState(false);

    useEffect(() => {
        if (open) {
            setFormData(initialFormData);
            setColor(initialFormData.color_hex);
            setErrors({});
            setPendingSaveData(null);
            setOpenConfirmSave(false);
        }
    }, [open, initialFormData]);

    const selectedIconOption = getIconOptionByValue(formData.icono);
    const SelectedIcon = selectedIconOption?.Icon ?? CategoryOutlinedIcon;

    const previewColor = isValidHexColor(color)
        ? color
        : theme.palette.primary.main;

    const modalTitle = category?.id
        ? category.categoria_padre_id
            ? 'Editar subcategoría'
            : 'Editar categoría'
        : parentCategory?.id
            ? 'Crear subcategoría'
            : 'Crear categoría';

    const confirmTitle = category?.id
        ? 'Confirmar cambios'
        : parentCategory?.id
            ? 'Guardar subcategoría'
            : 'Guardar categoría';

    const confirmMessage = category?.id
        ? '¿Deseas guardar los cambios?'
        : '¿Deseas guardar este registro?';

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: '',
        }));
    };

    const handleColorChange = (value) => {
        setColor(value);

        setErrors((prev) => ({
            ...prev,
            color_hex: '',
        }));
    };

    const handleImageChange = (file) => {
        handleChange('_file', file);
    };

    const handleImageRemove = () => {
        handleChange('_file', null);
        handleChange('imagen_url', '');
        handleChange('imagen_path', '');
    };

    const validateForm = () => {
        const newErrors = {};
        const orderValue = Number(formData.orden_visual);

        if (!formData.nombre?.trim()) {
            newErrors.nombre = 'Obligatorio';
        }

        if (!Number.isFinite(orderValue) || orderValue < 1) {
            newErrors.orden_visual = 'Debe ser mayor a 0';
        }

        if (!isValidHexColor(color)) {
            newErrors.color_hex = 'Color inválido';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const dataToSave = {
            categoria_padre_id: category?.id
                ? formData.categoria_padre_id ?? null
                : parentCategory?.id ?? formData.categoria_padre_id ?? null,
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion?.trim() || null,
            imagen_url: formData.imagen_url ?? null,
            imagen_path: formData.imagen_path ?? null,
            _file: formData._file,
            icono: getSafeIconValue(formData.icono),
            color_hex: color,
            orden_visual: Number(formData.orden_visual),
            es_visible: Boolean(formData.es_visible),
            es_activa: Boolean(formData.es_activa),
            ...(category?.id && { id: category.id }),
        };

        setPendingSaveData(dataToSave);
        setOpenConfirmSave(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingSaveData) return;

        await onSave(pendingSaveData);

        setOpenConfirmSave(false);
        setPendingSaveData(null);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={isLoading ? undefined : onClose}
                fullWidth
                maxWidth="md"
                scroll="paper"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: `${theme.palette.custom?.radius?.xl ?? 20}px`,
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundImage: 'none',
                        },
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        px: 3,
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    }}
                >
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                {modalTitle}
                            </Typography>

                            <Chip
                                size="small"
                                label={parentCategory?.id || category?.categoria_padre_id ? 'Subcategoría' : 'Categoría'}
                                color={parentCategory?.id || category?.categoria_padre_id ? 'info' : 'primary'}
                                variant="outlined"
                            />
                        </Stack>

                        <IconButton onClick={onClose} disabled={isLoading}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent
                    sx={{
                        p: 3,
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    <Stack spacing={2}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: `${theme.palette.custom?.radius?.lg ?? 16}px`,
                                border: `1px solid ${alpha(previewColor, 0.35)}`,
                                backgroundColor: alpha(previewColor, 0.08),
                            }}
                        >
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: `${theme.palette.custom?.radius?.md ?? 12}px`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: previewColor,
                                        backgroundColor: alpha(previewColor, 0.14),
                                    }}
                                >
                                    <SelectedIcon />
                                </Box>

                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                        {formData.nombre || 'Nombre de categoría'}
                                    </Typography>

                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {selectedIconOption?.label}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        <Section title="Datos">
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        required
                                        label="Nombre"
                                        value={formData.nombre}
                                        onChange={(e) => handleChange('nombre', e.target.value)}
                                        error={Boolean(errors.nombre)}
                                        helperText={errors.nombre}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Orden Visual"
                                        type="number"
                                        value={formData.orden_visual}
                                        onChange={(e) => handleChange('orden_visual', e.target.value)}
                                        error={Boolean(errors.orden_visual)}
                                        helperText={errors.orden_visual}
                                        slotProps={{
                                            htmlInput: { min: 1 },
                                        }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Descripción"
                                        multiline
                                        rows={3}
                                        value={formData.descripcion}
                                        onChange={(e) => handleChange('descripcion', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Section>

                        <Section title="Entidad Visual">
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                    id="categoria-icono"
                                    name="icono"
                                    select
                                    label="Ícono"
                                    value={getSafeIconValue(formData.icono)}
                                    onChange={(e) => handleChange('icono', e.target.value)}
                                    >
                                        {groupedIconOptions.flatMap(({ group, options }) => [
                                            <ListSubheader key={`${group}-header`} disableSticky>
                                                {group}
                                            </ListSubheader>,
                                            ...options.map((option) => {
                                                const Icon = option.Icon;

                                                return (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                                                            <Icon fontSize="small" />
                                                            <Typography variant="body2">
                                                                {option.label}
                                                            </Typography>
                                                        </Stack>
                                                    </MenuItem>
                                                );
                                            }),
                                        ])}
                                    </TextField>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack direction="row" spacing={1.5}>
                                        <TextField
                                            id="categoria-color-picker"
                                            name="color_picker"
                                            type="color"
                                            value={previewColor}
                                            onChange={(e) => handleColorChange(e.target.value)}
                                            slotProps={{
                                                htmlInput: {
                                                    id: 'categoria-color-picker',
                                                    name: 'color_picker',
                                                    'aria-label': 'Selector de color',
                                                },
                                            }}
                                            sx={{
                                                    flexGrow: 2,   
                                                    width: '100%',
                                                    '& input': {
                                                        height: 44,
                                                        p: 0.75,
                                                        cursor: 'pointer',
                                                        width: '100%',
                                                    },
                                                }}
                                        />

                                        <TextField
                                            id="categoria-color-hex"
                                            name="color_hex"
                                            label="Color"
                                            value={color}
                                            onChange={(e) => handleColorChange(e.target.value)}
                                            error={Boolean(errors.color_hex)}
                                            helperText={errors.color_hex}
                                            sx={{
                                                flexGrow: 1,
                                                minWidth: '120px'
                                            }}
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Section>

                        <Section title="Imagen de categoría">
                            <FileUploadField
                                label="Seleccionar imagen"
                                accept="image/*"
                                value={formData._file}
                                previewUrl={formData.imagen_url}
                                onChange={handleImageChange}
                                onRemove={handleImageRemove}
                                helperText="PNG, JPG o JPEG."
                                height={180}
                            />
                        </Section>

                        <Section title="Estado">
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={Boolean(formData.es_visible)}
                                            onChange={(e) => handleChange('es_visible', e.target.checked)}
                                            slotProps={{
                                                input: {
                                                    id: 'categoria-es-visible',
                                                    name: 'es_visible',
                                                    'aria-label': 'Visible',
                                                },
                                            }}
                                        />
                                    }
                                    label={formData.es_visible ? "Visible" : "No visible"}
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={Boolean(formData.es_activa)}
                                            onChange={(e) => handleChange('es_activa', e.target.checked)}
                                            slotProps={{
                                                input: {
                                                    id: 'categoria-es-activa',
                                                    name: 'es_activa',
                                                    'aria-label': 'Activa',
                                                },
                                            }}
                                        />
                                    }
                                    label={formData.es_activa ? "Activo" : "Inactivo"}
                                />
                            </Stack>
                        </Section>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={openConfirmSave}
                action="warning"
                title={confirmTitle}
                message={confirmMessage}
                onCancel={() => setOpenConfirmSave(false)}
                onConfirm={handleConfirmSave}
                confirmText="Guardar"
                loading={isLoading}
            />
        </>
    );
};