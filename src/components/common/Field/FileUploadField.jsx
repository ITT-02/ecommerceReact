import { useEffect, useMemo, useState } from 'react';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  MovieOutlined,
  InsertDriveFileOutlined,
} from '@mui/icons-material';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import {
  alpha,
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  Stack,
} from '@mui/material';

export const FileUploadField = ({
  label = 'Archivo',
  accept = 'image/*',
  value = null,
  previewUrl = '',
  multiple = false,
  maxFiles = 1,
  height = 200,
  helperText = 'Selecciona archivo',
  onChange,
  onRemove,
}) => {
  const [previews, setPreviews] = useState([]);

  // Normaliza el value para trabajar igual con 1 archivo o varios.
  const files = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Crea previews temporales para archivos locales y limpia la memoria.
  useEffect(() => {
    const objectUrls = [];

    const filePreviews = files.map((file) => {
      if (file instanceof File) {
        const url = URL.createObjectURL(file);
        objectUrls.push(url);

        return {
          src: url,
          type: file.type,
          name: file.name,
        };
      }

      return file;
    });

    // Preview de un archivo ya guardado en BD/storage.
    if (!filePreviews.length && previewUrl) {
      filePreviews.push({
        src: previewUrl,
        type: accept.includes('video') ? 'video/*' : 'image/*',
        name: 'Archivo actual',
      });
    }

    setPreviews(filePreviews);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files, previewUrl, accept]);

  // Agrega archivos. Si multiple=false, solo guarda uno.
  const handleAddFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    document.activeElement?.blur();

    if (multiple) {
      const nextFiles = [...files, ...selectedFiles].slice(0, maxFiles);
      onChange(nextFiles);
    } else {
      onChange(selectedFiles[0]);
    }

    event.target.value = '';
  };

  // Reemplaza un archivo específico.
  const handleReplaceFile = (event, index) => {
    const selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) return;

    document.activeElement?.blur();

    const replacedFile = files[index];

    if (multiple) {
      const nextFiles = [...files];
      nextFiles[index] = selectedFile;
      onChange(nextFiles);
      onRemove?.(index, replacedFile);
    } else {
      onChange(selectedFile);
      onRemove?.(index, replacedFile);
    }

    event.target.value = '';
  };

  // Quita un archivo sin abrir el selector.
  const handleRemove = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    document.activeElement?.blur();

    const removedFile = files[index];

    if (multiple) {
      const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
      onChange(nextFiles);
      onRemove?.(index, removedFile);
      return;
    }

    onChange(null);
    onRemove?.(index, removedFile);
  };

  // Ícono inicial según el tipo permitido.
  const renderEmptyIcon = () => {
    const iconStyles = {
      fontSize: 72,
      color: 'text.disabled',
      opacity: 0.55,
    };

    if (accept.includes('video')) {
      return <MovieOutlined sx={iconStyles} />;
    }

    if (accept.includes('image')) {
      return <PhotoSizeSelectActualOutlinedIcon sx={iconStyles} />;
    }

    return <InsertDriveFileOutlined sx={iconStyles} />;
  };

  // Preview de imagen o video.
  const renderPreview = (item, index) => {
    const isVideo = item.type?.startsWith('video/');

    return (
      <Box
        key={`${item.src || item.name}-${index}`}
        sx={{
          position: 'relative',
          height,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {isVideo ? (
          <Box
            component="video"
            src={item.src}
            controls
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <Box
            component="img"
            src={item.src}
            alt={item.name || 'Vista previa'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}

        {/* Quitar archivo */}
        <IconButton
          size="small"
          onClick={(event) => handleRemove(event, index)}
          sx={(theme) => ({
            position: 'absolute',
            top: 8,
            right: 8,
            width: 34,
            height: 34,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.background.paper, 0.92),
            color: 'error.main',
            boxShadow: 2,
            zIndex: 4,

            '&:hover': {
              bgcolor: 'error.main',
              color: 'error.contrastText',
            },
          })}
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>

        {/* Reemplazar archivo */}
        <Box
          component="label"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 4,
            cursor: 'pointer',
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<CloudUploadOutlined />}
            component="span"
            sx={(theme) => ({
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 700,
              px: 2,
              bgcolor: isVideo
                ? alpha(theme.palette.common.black, 0.55)
                : 'primary.main',
              color: isVideo
                ? theme.palette.common.white
                : 'primary.contrastText',

              '&:hover': {
                bgcolor: isVideo
                  ? alpha(theme.palette.common.black, 0.75)
                  : 'primary.dark',
              },
            })}
          >
            Reemplazar
          </Button>

          <input
            hidden
            type="file"
            accept={accept}
            onChange={(event) => handleReplaceFile(event, index)}
          />
        </Box>
      </Box>
    );
  };

  const canAddMore = multiple
    ? previews.length < maxFiles
    : previews.length === 0;

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel shrink>{label}</InputLabel>

      <Box
        sx={{
          mt: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          p: 1.5,
          transition:
            'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',

          // Hover dorado suave desde el theme.
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },

          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: (theme) => `0 0 0 4px ${theme.palette.action.focus}`,
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: multiple ? 'repeat(auto-fill, minmax(180px, 1fr))' : '1fr',
            gap: 1.5,
          }}
        >
          {previews.map(renderPreview)}

          {canAddMore && (
            <Box
              sx={{
                minHeight: height,
                borderRadius: 1,
                bgcolor: 'background.default',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <Stack spacing={1.4} sx={{ alignItems: 'center', textAlign: 'center' }}>
                {renderEmptyIcon()}

                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadOutlined />}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3.5,
                  }}
                >
                  {previews.length > 0 ? 'Agregar archivo' : 'Seleccionar archivo'}

                  <input
                    hidden
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleAddFiles}
                  />
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      <FormHelperText>
        {helperText}
        {multiple && ` · Máximo ${maxFiles} archivos`}
      </FormHelperText>
    </FormControl>
  );
};