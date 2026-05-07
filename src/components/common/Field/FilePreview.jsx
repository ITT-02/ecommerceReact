import { Box, Typography } from '@mui/material';

export const FilePreview = ({
  src,
  type = '',
  alt = 'Archivo',
  size = 80,
  width,
  height,
  objectFit = 'cover',
  rounded = 2,
  controls = true,
  sx = {},
}) => {
  const finalWidth = width || size;
  const finalHeight = height || size;

  if (!src) {
    return (
      <Box
        sx={{
          width: finalWidth,
          height: finalHeight,
          borderRadius: rounded,
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: 'action.hover',
          display: 'grid',
          placeItems: 'center',
          ...sx,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Sin archivo
        </Typography>
      </Box>
    );
  }

  if (type.startsWith('video/')) {
    return (
      <Box
        component="video"
        src={src}
        controls={controls}
        sx={{
          width: finalWidth,
          height: finalHeight,
          objectFit,
          borderRadius: rounded,
          border: '1px solid',
          borderColor: 'divider',
          display: 'block',
          ...sx,
        }}
      />
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      sx={{
        width: finalWidth,
        height: finalHeight,
        objectFit,
        borderRadius: rounded,
        border: '1px solid',
        borderColor: 'divider',
        display: 'block',
        ...sx,
      }}
    />
  );
};