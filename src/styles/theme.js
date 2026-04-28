import { alpha, createTheme } from '@mui/material/styles';

/**
 * Paleta base del sistema.
 * Aquí se definen colores reutilizables para todo el proyecto.
 * No se usan colores sueltos en cada componente; se centralizan aquí.
 */
export const colors = {
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    50: '#FFFDF8',
    100: '#FCF9F2',
    200: '#F7F4EC',
    300: '#E6DFD2',
    400: '#DDD4C3',
    500: '#A39A8C',
    600: '#6B645A',
    700: '#4A4A4A',
    800: '#2C2C2C',
    850: '#242424',
    900: '#1E1E1E',
    950: '#121212',
  },
  primary: {
    50: '#FFF8E1',
    100: '#F3E6B3',
    200: '#ECD98F',
    300: '#E3C86A',
    400: '#D6B94D',
    500: '#C9A227',
    600: '#B8921F',
    700: '#A8841F',
    800: '#806418',
    900: '#5C4610',
  },
  green: { light: '#7CAF86', main: '#4F8A5B', dark: '#35633F' },
  orange: { light: '#D9A957', main: '#C78B2C', dark: '#8E5F1D' },
  red: { light: '#D98272', main: '#C65A46', dark: '#8D382B' },
  blue: { light: '#7CA3C3', main: '#4B7BA5', dark: '#315A7D' },
};

/**
 * Radios reutilizables para botones, cards, inputs y chips.
 */
export const radius = {
  xs: 6,
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

/**
 * Medidas generales del layout.
 */
export const layout = {
  sidebarWidth: 284,
  sidebarCollapsedWidth: 92,
  headerHeight: 72,
  mobileHeaderHeight: 64,
};

/**
 * Colores semánticos por modo.
 * El nombre indica para qué sirve el color, no solo su valor hexadecimal.
 */
const semanticColors = {
  light: {
    backgroundDefault: colors.neutral[100],
    backgroundPaper: colors.neutral[50],
    backgroundDrawer: colors.neutral[50],
    backgroundAppBar: colors.neutral[50],
    textPrimary: colors.neutral[800],
    textSecondary: colors.neutral[600],
    textDisabled: colors.neutral[500],
    borderDefault: colors.neutral[300],
    borderInput: colors.neutral[400],
    primaryMain: colors.primary[500],
    primaryLight: colors.primary[300],
    primaryDark: colors.primary[700],
    primaryHover: colors.primary[600],
    primarySoft: alpha(colors.primary[500], 0.12),
    primarySofter: alpha(colors.primary[500], 0.06),
    secondaryMain: colors.neutral[800],
    secondaryLight: colors.neutral[700],
    secondaryDark: colors.neutral[950],
    tableHeaderBackground: alpha(colors.primary[500], 0.08),
    tableRowHover: alpha(colors.primary[500], 0.06),
    cardShadow: alpha(colors.neutral[800], 0.08),
    focusRing: alpha(colors.primary[500], 0.24),
  },
  dark: {
    backgroundDefault: colors.neutral[950],
    backgroundPaper: colors.neutral[900],
    backgroundDrawer: colors.neutral[900],
    backgroundAppBar: colors.neutral[900],
    textPrimary: colors.neutral[50],
    textSecondary: colors.neutral[500],
    textDisabled: colors.neutral[700],
    borderDefault: alpha(colors.neutral.white, 0.12),
    borderInput: alpha(colors.neutral.white, 0.18),
    primaryMain: colors.primary[500],
    primaryLight: colors.primary[300],
    primaryDark: colors.primary[700],
    primaryHover: colors.primary[400],
    primarySoft: alpha(colors.primary[500], 0.18),
    primarySofter: alpha(colors.primary[500], 0.10),
    secondaryMain: colors.neutral[50],
    secondaryLight: colors.neutral.white,
    secondaryDark: colors.neutral[300],
    tableHeaderBackground: alpha(colors.primary[500], 0.16),
    tableRowHover: alpha(colors.primary[500], 0.10),
    cardShadow: alpha(colors.neutral.black, 0.45),
    focusRing: alpha(colors.primary[500], 0.32),
  },
};

const getSemanticColors = (mode) => semanticColors[mode === 'dark' ? 'dark' : 'light'];

const createAppShadows = (mode) => {
  const semantic = getSemanticColors(mode);
  const shadowColor = mode === 'dark' ? alpha(colors.neutral.black, 0.5) : semantic.cardShadow;
  const shadows = Array(25).fill('none');
  shadows[1] = `0 1px 2px ${shadowColor}`;
  shadows[2] = `0 2px 8px ${shadowColor}`;
  shadows[3] = `0 4px 14px ${shadowColor}`;
  shadows[4] = `0 8px 24px ${shadowColor}`;
  shadows[5] = `0 12px 32px ${shadowColor}`;
  shadows[6] = `0 16px 40px ${shadowColor}`;
  return shadows;
};

const getPalette = (mode) => {
  const semantic = getSemanticColors(mode);

  return {
    mode,
    primary: {
      main: semantic.primaryMain,
      light: semantic.primaryLight,
      dark: semantic.primaryDark,
      contrastText: colors.neutral.white,
    },
    secondary: {
      main: semantic.secondaryMain,
      light: semantic.secondaryLight,
      dark: semantic.secondaryDark,
      contrastText: mode === 'dark' ? colors.neutral[800] : colors.neutral.white,
    },
    background: {
      default: semantic.backgroundDefault,
      paper: semantic.backgroundPaper,
    },
    text: {
      primary: semantic.textPrimary,
      secondary: semantic.textSecondary,
      disabled: semantic.textDisabled,
    },
    success: { main: colors.green.main, light: colors.green.light, dark: colors.green.dark, contrastText: colors.neutral.white },
    warning: { main: colors.orange.main, light: colors.orange.light, dark: colors.orange.dark, contrastText: colors.neutral.white },
    error: { main: colors.red.main, light: colors.red.light, dark: colors.red.dark, contrastText: colors.neutral.white },
    info: { main: colors.blue.main, light: colors.blue.light, dark: colors.blue.dark, contrastText: colors.neutral.white },
    divider: semantic.borderDefault,
    action: {
      hover: semantic.primarySofter,
      selected: semantic.primarySoft,
      focus: semantic.focusRing,
      disabled: alpha(semantic.textPrimary, 0.35),
      disabledBackground: alpha(semantic.textPrimary, 0.08),
    },
    custom: { semantic, radius, layout },
  };
};

const getTypography = (mode) => {
  const semantic = getSemanticColors(mode);

  return {
    fontFamily: `'Poppins', 'Inter', 'Roboto', 'Arial', sans-serif`,
    fontSize: 14,
    h1: { fontWeight: 800, letterSpacing: '-0.04em', color: semantic.textPrimary },
    h2: { fontWeight: 800, letterSpacing: '-0.03em', color: semantic.textPrimary },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', color: semantic.textPrimary },
    h4: { fontWeight: 700, color: semantic.textPrimary },
    h5: { fontWeight: 700, color: semantic.textPrimary },
    h6: { fontWeight: 700, color: semantic.textPrimary },
    subtitle1: { fontWeight: 600, color: semantic.textPrimary },
    subtitle2: { fontWeight: 600, color: semantic.textSecondary },
    body1: { lineHeight: 1.7, color: semantic.textPrimary },
    body2: { lineHeight: 1.6, color: semantic.textSecondary },
    caption: { lineHeight: 1.4, color: semantic.textSecondary },
    button: { textTransform: 'none', fontWeight: 700 },
  };
};

const getComponents = (mode) => {
  const semantic = getSemanticColors(mode);

  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        body: {
          margin: 0,
          minHeight: '100vh',
          backgroundColor: semantic.backgroundDefault,
          color: semantic.textPrimary,
        },
        '#root': { minHeight: '100vh' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${semantic.borderDefault}`,
          backgroundColor: alpha(semantic.backgroundAppBar, 0.92),
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: { minHeight: '72px !important' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${semantic.borderDefault}`,
          backgroundColor: semantic.backgroundDrawer,
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          border: `1px solid ${semantic.borderDefault}`,
          boxShadow: mode === 'light' ? '0 10px 30px rgba(44,44,44,0.08)' : '0 10px 30px rgba(0,0,0,0.35)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': { paddingBottom: 24 },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 42, borderRadius: radius.sm, textTransform: 'none', fontWeight: 700 } },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: radius.sm } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: semantic.borderInput },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: semantic.primaryMain },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: semantic.primaryMain },
          '&.Mui-focused': { boxShadow: `0 0 0 4px ${semantic.primarySoft}` },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true, size: 'medium' },
    },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: radius.sm } } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 800, backgroundColor: semantic.tableHeaderBackground },
        body: { borderBottom: `1px solid ${semantic.borderDefault}` },
      },
    },
    MuiTableRow: {
      styleOverrides: { root: { '&:hover': { backgroundColor: semantic.tableRowHover } } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: radius.sm, fontWeight: 600 } } },
  };
};

/**
 * Genera el tema completo según el modo actual.
 * AppThemeProvider llama a esta función con light/dark.
 */
export const getTheme = (mode = 'light') => {
  return createTheme({
    spacing: 8,
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
    shape: { borderRadius: radius.sm },
    palette: getPalette(mode),
    typography: getTypography(mode),
    shadows: createAppShadows(mode),
    components: getComponents(mode),
  });
};
