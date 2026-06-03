import { useRef, useState } from 'react';

import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Box, Button, MenuItem, MenuList, Paper, Typography } from '@mui/material';

export const HoverFilterMenu = ({
  label,
  value = '',
  placeholder = 'Todos',
  options = [],
  onChange,
  minWidth = 190,
}) => {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef(null);

  const currentLabel = options.find((option) => String(option.value) === String(value))?.label || placeholder;

  const closeLater = () => {
    closeTimerRef.current = setTimeout(() => setOpen(false), 160);
  };

  const cancelClose = () => clearTimeout(closeTimerRef.current);

  return (
    <Box
      sx={{ position: 'relative', minWidth: { xs: '100%', sm: minWidth } }}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={closeLater}
    >
      <Button
        fullWidth
        variant="outlined"
        endIcon={
          <KeyboardArrowDownRoundedIcon
            sx={{
              transition: 'transform 160ms ease',
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          />
        }
        onClick={() => setOpen((prev) => !prev)}
        sx={(theme) => ({
          height: 44,
          justifyContent: 'space-between',
          borderRadius: theme.palette.custom.radius.xs,
          color: theme.palette.custom.semantic.storeMarketing.lightText,
          borderColor: theme.palette.custom.semantic.storeMarketing.lightCardBorder,
          bgcolor: theme.palette.custom.semantic.storeMarketing.lightCardBg,
          textTransform: 'none',
          '&:hover': {
            borderColor: theme.palette.custom.semantic.storeMarketing.lightAccent,
            bgcolor: theme.palette.custom.semantic.storeMarketing.accentSofter,
          },
        })}
      >
        <Box sx={{ minWidth: 0, textAlign: 'left' }}>
          <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.1, color: 'text.secondary' }}>
            {label}
          </Typography>
          <Typography variant="body2" noWrap sx={{ fontWeight: 850 }}>
            {currentLabel}
          </Typography>
        </Box>
      </Button>

      {open && (
        <Paper
          elevation={0}
          sx={(theme) => ({
            position: 'absolute',
            top: '100%',
            left: 0,
            mt: 0.6,
            minWidth,
            width: '100%',
            zIndex: theme.zIndex.modal,
            borderRadius: theme.palette.custom.radius.xs,
            border: `1px solid ${theme.palette.custom.semantic.storeMarketing.lightCardBorder}`,
            boxShadow: theme.palette.custom.shadows.lg,
            overflow: 'hidden',
            bgcolor: theme.palette.custom.semantic.storeMarketing.lightCardBg,
          })}
        >
          <MenuList dense disablePadding sx={{ py: 0.6 }}>
            <MenuItem
              selected={value === '' || value === null || value === undefined}
              onClick={() => {
                onChange?.('');
                setOpen(false);
              }}
            >
              {placeholder}
            </MenuItem>
            {options.map((option) => (
              <MenuItem
                key={option.value}
                selected={String(value) === String(option.value)}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      )}
    </Box>
  );
};
