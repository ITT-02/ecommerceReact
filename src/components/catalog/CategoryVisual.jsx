import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { Avatar, Box } from '@mui/material';

import { getCategoryIconOption } from '../../utils/categoryIconOptions';

export const CategoryVisual = ({ category, size = 42 }) => {
  const iconOption = getCategoryIconOption(category?.icono);
  const Icon = iconOption?.Icon || CategoryRoundedIcon;
  const hasImage = Boolean(category?.imagen_url);

  return (
    <Avatar
      variant="rounded"
      src={hasImage ? category.imagen_url : undefined}
      alt={category?.nombre || 'Categoría'}
      sx={(theme) => ({
        width: size,
        height: size,
        borderRadius: theme.palette.custom.radius.xs,
        bgcolor: hasImage ? theme.palette.custom.semantic.paperWarm : theme.palette.custom.semantic.storeMarketing.iconBg,
        color: theme.palette.custom.semantic.storeMarketing.iconText,
        border: `1px solid ${theme.palette.custom.semantic.storeMarketing.lightCardBorder}`,
        '& img': { objectFit: 'cover' },
      })}
    >
      {!hasImage && (
        <Box sx={{ display: 'grid', placeItems: 'center' }}>
          <Icon sx={{ fontSize: Math.max(18, Math.round(size * 0.48)) }} />
        </Box>
      )}
    </Avatar>
  );
};
