/**
 * ============================================================================
 * GUÍA DE COMBINACIÓN Y USO DEL THEME
 * ============================================================================
 *
 * 1. Base de color:
 *    - emerald: verde oscuro elegante. Uso en fondos , panel admin,
 *      navbar, textos principales en modo claro y acciones secundarias.
 *    - gold: dorado de marca. Uso en acentos, botones primarios,
 *      estados activos, bordes destacados y pequeños detalles de lujo.
 *    - carbon: grises/neutros. Uso en textos, fondos oscuros,
 *      bordes neutros, tablas y superficies sobrias.
 *    - warm: blancos cálidos. Uso en fondos claros, cards, textos
 *      sobre fondos oscuros y superficies limpias.
 *    - status: colores funcionales. Uso solo para estados: éxito,
 *      advertencia, error e información.
 *
 * 2. Zonas del sistema:
 *    - semanticByMode.light: define cómo se ve toda la app en modo claro.
 *    - semanticByMode.dark: define cómo se ve toda la app en modo oscuro.
 *    - adminNavigation: controla SOLO el menú/panel administrativo.
 *    - storeNavigation: controla SOLO la tienda pública/navbar/hero.
 *    - form: controla títulos, superficies y bordes de formularios.
 *
 * 3. Regla de uso en componentes:
 *    - Para páginas y cards: theme.palette.background / theme.palette.custom.semantic.
 *    - Para menú admin: theme.palette.custom.semantic.adminNavigation.
 *    - Para tienda pública: theme.palette.custom.semantic.storeNavigation.
 *    - Para formularios: theme.palette.custom.semantic.form.
 *    - Para tablas: theme.palette.custom.semantic.dataTable.
 *    - Evita hexadecimales directos en componentes.
 *
 * 4. Para cambiar letras doradas a plateadas en menú admin:
 *    - Cambia en adminNavigation:
 *      groupText, itemIcon, itemActiveText, itemActiveBg.
 *    - Recuerda hacerlo en light y/o dark según el modo que estés usando.
 * ============================================================================
 */

/**
 * Design System para Material UI.
 *
 * Todo el lenguaje visual se centraliza aquí:
 * - paleta de marca;
 * - fondos y superficies;
 * - radios, sombras y movimiento;
 * - tipografía oficial;
 * - overrides globales de componentes MUI.
 *
 * Los componentes deben consumir valores del theme con sx, no hexadecimales sueltos.
 */
import { alpha, createTheme } from '@mui/material/styles';

export const colors = {
  /*
   * Paleta base.
   * La aplicación usa estos colores mediante semanticByMode.
   */
  /*
   * Verde esmeralda:
   * Combina con dorado y marfil. Ideal para fondos premium, panel admin,
   * navbar, textos principales en modo claro y acentos secundarios.
   */
  emerald: {
    50: '#F2F7F5', // verde esmeralda muy claro: fondos suaves y badges secundarios.
    100: '#E6EFEC', // verde esmeralda claro: superficies suaves de éxito/secundario.
    200: '#C7DDD8', // verde esmeralda suave: bordes o separadores con tono de marca.
    300: '#93BDB4', // verde esmeralda medio claro: acentos secundarios suaves.
    400: '#5A958A', // verde esmeralda medio: iconos o indicadores secundarios.
    500: '#2E6E62', // verde esmeralda base: acciones secundarias y detalles de marca.
    525: '#1E6A60', // verde esmeralda vivo: secondaryLight en modo oscuro.
    575: '#1A6058', // verde esmeralda profundo: secondaryMain en modo oscuro.
    600: '#1A5249', // verde esmeralda oscuro: éxito y acciones secundarias fuertes.
    700: '#0F3D37', // verde premium: textos principales en modo claro y secundarios.
    800: '#0B312C', // verde muy oscuro: gradientes y fondos profundos.
    900: '#082621', // verde casi negro: sidebar, navbar y texto premium en modo claro.
    950: '#061C18', // verde negro: hero y fondos de máximo contraste.
    975: '#0D1F1C', // verde petróleo casi negro: secondaryDark en modo oscuro.
  },
  /*
   * Dorado:
   * Combina con esmeralda, negro/carbono y marfil.
   * Úsalo para marca, botones principales, estados activos y detalles elegantes.
   */
  gold: {
    50: '#FBF7EE', // dorado casi marfil: fondos muy suaves.
    100: '#F9F1E2', // dorado suave: badges, chips y superficies destacadas.
    200: '#F4E7CE', // dorado claro: bordes cálidos y fondos secundarios.
    300: '#EED9B0', // dorado claro elegante: bordes y acentos de baja intensidad.
    350: '#F0C860', // dorado luminoso: iconos/accesos destacados en fondos oscuros.
    400: '#E4C68C', // dorado medio claro: detalles decorativos.
    500: '#D9B36C', // dorado base suave: textos/acento activo suave.
    550: '#DEB050', // dorado marca en modo oscuro: títulos, logo textual y activo elegante.
    600: '#C99A45', // dorado principal claro: primaryLight y marca en modo claro.
    650: '#C89830', // dorado intenso: primaryMain en modo oscuro y estados activos.
    700: '#B8862B', // dorado principal: botones primarios y acento de marca en modo claro.
    750: '#9C6E1A', // dorado oscuro: primaryDark en modo oscuro.
    800: '#87601D', // dorado profundo: hover fuerte y contrastes.
    900: '#5C4112', // dorado muy oscuro: textos sobre fondos dorados claros.
  },
  /*
   * Carbono / grises:
   * Combina con marfil, dorado y esmeralda.
   * Úsalo para modo oscuro, textos neutros, bordes y fondos sobrios.
   */
  carbon: {
    50: '#F8F8F8', // gris casi blanco: fondos neutros muy suaves.
    100: '#F2F2F2', // gris claro: superficies y divisores suaves.
    150: '#ECECEC', // gris claro intermedio: bordes de tabla o chips.
    200: '#E2E2E2', // gris claro: separadores con más presencia.
    300: '#C5C5C5', // gris medio claro: textos secundarios o iconos suaves.
    400: '#A0A0A0', // gris medio: texto muted en fondos claros.
    500: '#7A7A7A', // gris base: subtítulos, acciones neutras e iconos.
    600: '#5C5C5C', // gris oscuro: texto secundario fuerte.
    700: '#3F3F3F', // gris carbón: texto oscuro no principal.
    800: '#2B2B2B', // carbón claro oscuro: superficies oscuras elevadas.
    850: '#2C2C2C', // carbón medio: paperDeep en modo oscuro.
    875: '#222222', // carbón oscuro: tableHeader/paperWarm en modo oscuro.
    900: '#1D1D1D', // carbón profundo: superficies oscuras.
    925: '#1A1A1A', // carbón premium: paper/appBar en modo oscuro.
    940: '#141414', // carbón de página alterna: pageAlt en modo oscuro.
    950: '#0D0D0D', // carbón casi negro: fondo base oscuro.
    975: '#050505', // negro premium: sidebar/navbar oscuro.
    1000: '#000000', // negro absoluto: sombras y overlays.
  },
  /*
   * Blancos cálidos:
   * Combina con esmeralda y dorado.
   * Úsalo para fondos claros, cards, papel, textos sobre fondos oscuros y superficies limpias.
   */
  warm: {
    ivory: '#F6F3EE', // marfil cálido: fondo claro principal y texto sobre fondos oscuros.
    cream: '#FAF7F2', // crema: superficies limpias y fondos alternos.
    sand: '#EFE9DC', // arena: encabezados de tabla y bloques cálidos.
    sandDeep: '#E5DFCF', // arena profunda: bordes/superficies cálidas con más contraste.
    white: '#FFFFFF', // blanco puro: cards y superficies limpias.
  },
  /*
   * Metales / plateados:
   * Úsalos cuando quieras una apariencia plateada, limpia o metálica,
   * especialmente en modo oscuro, menús premium y textos suaves.
   */
  metal: {
    silverWhite: '#FFFFFF', // blanco brillante: punto máximo de contraste metálico.
    silver50: '#F2F2F2', // plateado muy claro: texto activo o destacado sobre oscuro.
    silver100: '#E8E4DC', // plateado cálido: texto principal en modo oscuro.
    silver200: '#D8D8D8', // plateado medio claro: títulos/íconos plateados.
    silver300: '#AAA69E', // plateado apagado: textos secundarios en modo oscuro.
    silver400: '#78736B', // plateado oscuro: texto muted en modo oscuro.
    silver500: '#5F5A53', // plateado profundo: texto sutil de baja jerarquía.
  },
  /*
   * Colores de refresco visual:
   * Tonos suaves, poco saturados, para romper la repetición de verde/dorado
   * sin salir de una estética elegante y premium.
   */
  fresh: {
    sage50: '#F5F8F3', // verde salvia casi blanco: fondos suaves de descanso visual.
    sage100: '#E8EFE4', // salvia claro: paneles ligeros y bloques alternos.
    sage200: '#CEDDC8', // salvia medio suave: bordes/acento fresco.
    sage700: '#4F6F58', // salvia profundo: iconos o acentos secundarios discretos.
    mist50: '#F4F8F7', // azul verdoso muy claro: fondo fresco para timeline/equipo.
    mist100: '#E8F0EF', // niebla suave: superficies alternativas.
    clay50: '#FBF5EE', // beige cálido: descanso visual cerca del dorado.
    clay100: '#F3E5D6', // arcilla suave: bordes o fondos sutiles.
  },


  /*
   * Estados funcionales:
   * No son colores de marca. Úsalos solo para feedback visual:
   * éxito, advertencia, error e información.
   */
  status: {
    success: '#1A5249', // éxito: confirmado, pagado, activo.
    successLight: '#2D7A4F', // éxito claro: hover o variantes suaves.
    successBg: '#E6EFEC', // fondo de éxito suave.
    warning: '#B8862B', // advertencia: pendiente, stock bajo, atención.
    warningBg: '#F9F1E2', // fondo de advertencia suave.
    error: '#A23A2E', // error: rechazado, eliminado, fallido.
    errorLight: '#BD4A3E', // error claro: acciones destructivas en modo oscuro.
    errorDark: '#7D2C23', // error oscuro: contraste fuerte.
    errorBg: '#F6E5E2', // fondo de error suave.
    info: '#2E5E7A', // información: envío, tracking, estado informativo.
    infoLight: '#467B99', // información clara: hover o variante suave.
    infoDark: '#1E445B', // información oscura: contraste fuerte.
    infoBg: '#E4ECF1', // fondo informativo suave.
  },
  
};

export const radius = {
  /*
   * Radios globales:
   * Controlan qué tan redondeados son cards, botones, inputs, drawers y chips.
   * Usa estos valores desde theme.palette.custom.radius.
   */
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  pill: 999,
};

export const layout = {
  /*
   * Medidas estructurales:
   * Mantienen consistente el ancho del sidebar, header y contenedores.
   * Útil para AdminLayout, StoreLayout y páginas con Container.
   */
  sidebarWidth: 284,
  sidebarCollapsedWidth: 92,
  mobileHeaderHeight: 64,
  headerHeight: 72,
  containerNarrow: 960,
  containerBase: 1200,
  containerWide: 1440,
};

export const motion = {
  /*
   * Movimiento global:
   * Duraciones y curvas para hover, transiciones de botones, cards, drawers y menús.
   */
  durationQuick: '120ms',
  durationBase: '200ms',
  durationSlow: '320ms',
  easeOut: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.5, 0, 0.2, 1)',
};

const semanticByMode = {
  /*
   * Colores semánticos por modo.
   *
   * light: modo claro.
   * dark: modo oscuro.
   */
  light: {
    /*
     * Modo claro:
     * Fondo cálido + texto verde oscuro + acento dorado.
     * Combina bien para tienda pública, formularios limpios y paneles de lectura.
     */
    page: colors.warm.ivory,
    pageAlt: colors.warm.cream,
    paper: colors.warm.white,
    paperWarm: colors.warm.cream,
    paperDeep: colors.warm.sand,
    drawer: colors.emerald[900],
    drawerActive: alpha(colors.gold[700], 0.14),
    appBar: colors.warm.white,
    textPrimary: colors.emerald[900],
    textSecondary: colors.carbon[700],
    textMuted: colors.carbon[500],
    textSubtle: colors.carbon[400],
    textInverse: colors.warm.ivory,
    border: alpha(colors.carbon[900], 0.10),
    borderSubtle: alpha(colors.carbon[900], 0.06),
    borderStrong: alpha(colors.carbon[900], 0.18),
    inputBorder: alpha(colors.carbon[900], 0.18),
    primaryMain: colors.gold[700],
    primaryLight: colors.gold[600],
    primaryDark: colors.gold[800],
    primarySoft: colors.gold[100],
    primarySofter: colors.gold[50],
    secondaryMain: colors.emerald[700],
    secondaryLight: colors.emerald[600],
    secondaryDark: colors.emerald[900],
    secondarySoft: colors.emerald[100],
    focusRing: alpha(colors.gold[700], 0.22),
    rowHover: alpha(colors.gold[700], 0.06),
    tableHeader: colors.warm.sand,
    shadowColor: alpha(colors.emerald[900], 0.12),
    overlay: alpha(colors.emerald[900], 0.54),
    adminNavigation: {
      /*
       * MENÚ ADMINISTRATIVO.
       *
       * Se usa en:
       * - AdminSidebar
       * - AdminMobileDrawer
       * - AdminMenuList
       * - AdminActionItem
       * - AdminBrandLogo
       *
       * Si el menú se ve dorado o plateado, normalmente se controla aquí.
       */
      // Fondo general del sidebar/drawer administrativo.
      drawerBg: colors.emerald[900],
      // Color base del texto dentro del drawer cuando no hay regla más específica.
      drawerText: colors.warm.ivory,
      // Superficie del bloque de marca/logo según la zona donde se use.
      brandSurface: alpha(colors.warm.ivory, 0.035),
      // Borde del bloque del logo/marca.
      brandBorder: alpha(colors.warm.ivory, 0.10),
      // Fondo de marca o contenedor pequeño del símbolo/logo.
      brandMarkBg: alpha(colors.warm.ivory, 0.04),
      // Color del título de marca si se usa texto en lugar de imagen.
      brandTitle: colors.gold[600],
      // Color del subtítulo: por ejemplo, “Panel administrativo”.
      brandSubtitle: alpha(colors.warm.ivory, 0.58),
      // Color de títulos principales: INICIO, CONFIGURACIÓN BASE, CATÁLOGO, etc.
      groupText: colors.gold[600],
      // Color apagado del grupo cuando quieres menor jerarquía.
      groupTextMuted: alpha(colors.warm.ivory, 0.72),
      // Fondo al pasar el mouse sobre un grupo principal.
      groupHoverBg: alpha(colors.warm.ivory, 0.06),
      // Color de submenús normales: Resumen general, Pedidos, Productos, etc.
      itemText: alpha(colors.warm.ivory, 0.78),
      // Color de los íconos de submenús normales.
      itemIcon: alpha(colors.gold[300], 0.74),
      // Fondo al pasar el mouse sobre un submenú.
      itemHoverBg: alpha(colors.warm.ivory, 0.07),
      // Texto del submenú en hover.
      itemHoverText: alpha(colors.warm.ivory, 0.96),
      // Fondo del submenú activo/seleccionado.
      itemActiveBg: alpha(colors.gold[700], 0.16),
      // Texto e ícono del submenú activo. Si sigue dorado, cambia este valor.
      itemActiveText: colors.gold[500],
      // Líneas separadoras internas de la zona de navegación.
      divider: alpha(colors.warm.ivory, 0.10),
      // Fondo del botón para colapsar/expandir sidebar.
      toggleBg: alpha(colors.warm.ivory, 0.06),
      // Hover del botón para colapsar/expandir sidebar.
      toggleHoverBg: alpha(colors.gold[700], 0.18),
      // Texto/icono para acciones peligrosas: Cerrar sesión, eliminar, cancelar.
      actionDanger: colors.status.error,
      // Fondo suave para acciones peligrosas.
      actionDangerBg: alpha(colors.status.error, 0.12),
    },
    storeNavigation: {
      /*
       * Navbar público.
       * Mantiene el color institucional y evita repetirlo como fondo de cada página.
       */
      bg: colors.emerald[900],
      text: colors.warm.ivory,
      textMuted: alpha(colors.warm.ivory, 0.76),
      textSubtle: alpha(colors.warm.ivory, 0.58),
      border: alpha(colors.gold[700], 0.24),
      divider: alpha(colors.warm.ivory, 0.12),
      hoverBg: alpha(colors.warm.ivory, 0.07),
      activeBg: alpha(colors.gold[700], 0.16),
      brandSurface: alpha(colors.warm.ivory, 0.045),
      brandText: colors.gold[600],
      brandSubtext: alpha(colors.warm.ivory, 0.58),
      actionBorder: alpha(colors.gold[300], 0.42),
      heroCardBg: alpha(colors.warm.white, 0.08),
      heroCardBorder: alpha(colors.gold[300], 0.22),
    },
    storeMarketing: {
      /*
       * Tienda pública.
       * Base clara para Inicio, Mayoristas, Nuestra Historia y Contacto.
       * Los componentes deben consumir estos tokens y no colores directos.
       */
      pageBg: colors.warm.ivory,
      sectionBg: colors.warm.ivory,
      sectionAltBg: colors.warm.cream,
      sectionSoftBg: colors.warm.sand,

      cardBg: colors.warm.white,
      cardBgAlt: colors.warm.cream,
      panelBg: colors.warm.white,
      panelSoftBg: colors.warm.cream,

      text: colors.emerald[900],
      muted: colors.carbon[700],
      subtle: colors.carbon[500],

      accent: colors.gold[700],
      accentHover: colors.gold[800],
      accentSoft: colors.gold[100],
      accentSofter: colors.gold[50],

      border: alpha(colors.carbon[900], 0.10),
      borderStrong: alpha(colors.carbon[900], 0.16),
      divider: alpha(colors.carbon[900], 0.07),

      strongBg: colors.carbon[900],
      strongBgAlt: colors.emerald[950],
      strongText: colors.warm.ivory,
      strongMuted: alpha(colors.warm.ivory, 0.76),
      strongSubtle: alpha(colors.warm.ivory, 0.56),
      strongAccent: colors.gold[500],
      strongAccentSoft: alpha(colors.gold[600], 0.16),
      strongBorder: alpha(colors.gold[500], 0.24),
      strongCardBg: alpha(colors.warm.white, 0.065),
      strongCardHoverBg: alpha(colors.warm.white, 0.10),
      strongCardBorder: alpha(colors.gold[500], 0.22),

      lightBg: colors.warm.ivory,
      lightBgAlt: colors.warm.cream,
      lightPanelBg: colors.warm.sand,
      lightText: colors.emerald[900],
      lightMuted: colors.carbon[700],
      lightSubtle: colors.carbon[500],
      lightAccent: colors.gold[700],
      lightAccentSoft: colors.gold[100],
      lightBorder: alpha(colors.carbon[900], 0.10),
      lightDivider: alpha(colors.carbon[900], 0.07),
      lightCardBg: colors.warm.white,
      lightCardBgAlt: colors.warm.cream,
      lightCardBorder: alpha(colors.carbon[900], 0.10),

      darkBg: colors.carbon[900],
      darkBgAlt: colors.emerald[950],
      heroCardBg: colors.carbon[875],
      darkText: colors.warm.ivory,
      darkMuted: alpha(colors.warm.ivory, 0.76),
      darkSubtle: alpha(colors.warm.ivory, 0.56),
      darkAccent: colors.gold[500],
      darkAccentSoft: alpha(colors.gold[600], 0.16),
      darkBorder: alpha(colors.gold[500], 0.24),
      darkDivider: alpha(colors.warm.ivory, 0.10),
      darkCardBg: alpha(colors.warm.white, 0.065),
      darkCardHoverBg: alpha(colors.warm.white, 0.10),
      darkCardBorder: alpha(colors.gold[500], 0.22),

      freshBg: colors.warm.cream,
      freshBgAlt: colors.warm.sand,
      freshAccent: colors.gold[700],
      freshAccentSoft: colors.gold[100],
      freshBorder: alpha(colors.carbon[900], 0.10),

      mauveBg: colors.warm.cream,
      mauveAccent: colors.gold[700],
      mauveBorder: alpha(colors.carbon[900], 0.10),
      wineAccent: colors.emerald[900],
      sandAccent: colors.gold[700],

      iconBg: colors.gold[100],
      iconText: colors.gold[800],

      timelineBg: colors.warm.ivory,
      timelineLine: alpha(colors.carbon[900], 0.10),
    },
    form: {
      /*
       * FORMULARIOS.
       *
       * Se usa en formularios admin y tienda:
       * títulos, subtítulos, superficies, secciones y bordes.
       */
      // Color del título principal del formulario.
      titleColor: colors.emerald[900],
      // Color de títulos de sección dentro del formulario.
      sectionTitleColor: colors.emerald[900],
      // Color de captions/etiquetas pequeñas destacadas.
      captionColor: colors.gold[700],
      // Fondo principal del formulario.
      surface: colors.warm.white,
      // Fondo secundario para bloques internos.
      surfaceMuted: colors.warm.cream,
      // Borde de la zona o contenedor según el bloque donde se use.
      border: alpha(colors.carbon[900], 0.10),
    },
    dataTable: {
      /*
       * TABLAS ADMINISTRATIVAS.
       *
       * Se usa en:
       * - AdminResourceTable
       * - DataTableToolbar
       * - DataTable
       * - paginación, acciones, filtros y estados vacíos.
       *
       * Regla: los componentes de tabla deben consumir este bloque antes
       * de usar colores sueltos del theme.
       */
      toolbarBg: colors.warm.white, // #FFFFFF - fondo de barra de búsqueda/filtros.
      toolbarBorder: alpha(colors.carbon[900], 0.08), // #1D1D1D al 8% - borde de toolbar.
      filterBg: colors.warm.white, // #FFFFFF - fondo de campos de filtro.
      filterBorder: alpha(colors.carbon[900], 0.10), // #1D1D1D al 10% - borde de filtros.
      headerBg: colors.warm.sand, // #EFE9DC - fondo del encabezado de tabla.
      headerText: colors.emerald[900], // #082621 - texto del encabezado de tabla.
      rowBg: colors.warm.white, // #FFFFFF - fondo base de filas.
      rowHoverBg: alpha(colors.gold[700], 0.06), // #B8862B al 6% - hover de fila.
      rowSelectedBg: alpha(colors.gold[700], 0.10), // #B8862B al 10% - fila seleccionada.
      cellText: colors.emerald[900], // #082621 - texto principal de celda.
      cellMuted: colors.carbon[500], // #7A7A7A - texto secundario de celda.
      cellBorder: alpha(colors.carbon[900], 0.06), // #1D1D1D al 6% - separador de filas.
      actionIcon: colors.carbon[500], // #7A7A7A - iconos de acciones normales.
      actionHoverBg: alpha(colors.gold[700], 0.10), // #B8862B al 10% - hover de acciones.
      actionDanger: colors.status.error, // #A23A2E - acción destructiva.
      paginationBg: colors.warm.white, // #FFFFFF - fondo de paginación.
      paginationText: colors.carbon[700], // #3F3F3F - texto de paginación.
      paginationActiveBg: colors.gold[700], // #B8862B - página activa.
      paginationActiveText: colors.emerald[900], // #082621 - texto sobre página activa.
      emptyStateBg: colors.warm.cream, // #FAF7F2 - fondo de estado vacío.
      emptyStateIcon: colors.gold[700], // #B8862B - icono de estado vacío.
      statusChipBg: alpha(colors.gold[700], 0.10), // #B8862B al 10% - chip suave dentro de tabla.
    },
    entityTone: {
      /*
      * TONOS SEMÁNTICOS REUTILIZABLES.
      *
      * Se usan para:
      * - chips de permisos;
      * - módulos administrativos;
      * - etiquetas visuales;
      * - badges;
      * - cards pequeñas;
      * - agrupadores por tipo.
      */

      brand: {
        bg: colors.gold[100], // #F9F1E2 - fondo dorado suave de marca.
        fg: colors.gold[800], // #87601D - texto dorado oscuro.
        border: alpha(colors.gold[700], 0.24), // #B8862B al 24% - borde dorado suave.
      },

      emerald: {
        bg: colors.emerald[100], // #E6EFEC - fondo verde esmeralda suave.
        fg: colors.emerald[800], // #0B312C - texto verde elegante.
        border: alpha(colors.emerald[700], 0.22), // #0F3D37 al 22% - borde verde suave.
      },

      success: {
        bg: colors.status.successBg, // #E6EFEC - fondo de éxito.
        fg: colors.status.success, // #1A5249 - texto de éxito.
        border: alpha(colors.status.success, 0.22), // #1A5249 al 22% - borde de éxito.
      },

      warning: {
        bg: colors.status.warningBg, // #F9F1E2 - fondo de advertencia.
        fg: colors.status.warning, // #B8862B - texto de advertencia.
        border: alpha(colors.status.warning, 0.24), // #B8862B al 24% - borde de advertencia.
      },

      info: {
        bg: colors.status.infoBg, // #E4ECF1 - fondo informativo.
        fg: colors.status.info, // #2E5E7A - texto informativo.
        border: alpha(colors.status.info, 0.22), // #2E5E7A al 22% - borde informativo.
      },

      danger: {
        bg: colors.status.errorBg, // #F6E5E2 - fondo de error/peligro.
        fg: colors.status.error, // #A23A2E - texto de error/peligro.
        border: alpha(colors.status.error, 0.22), // #A23A2E al 22% - borde de error/peligro.
      },

      neutral: {
        bg: colors.carbon[100], // #F2F2F2 - fondo neutro.
        fg: colors.carbon[700], // #3F3F3F - texto neutro.
        border: alpha(colors.carbon[900], 0.12), // #1D1D1D al 12% - borde neutro.
      },
    },
  },
  dark: {
    /*
     * Modo oscuro:
     * Fondo carbono/negro + texto marfil + acento dorado.
     * Combina bien para panel administrativo premium y navbar elegante.
     */
    page: colors.carbon[950],
    pageAlt: colors.carbon[940], // #141414 - fondo alterno oscuro.
    paper: colors.carbon[925], // #1A1A1A - superficie principal oscura.
    paperWarm: colors.carbon[875], // #222222 - superficie elevada oscura.
    paperDeep: colors.carbon[850], // #2C2C2C - superficie interna profunda.
    drawer: colors.carbon[975], // #050505 - sidebar/drawer oscuro.
    drawerActive: alpha(colors.gold[600], 0.18),
    appBar: colors.carbon[925], // #1A1A1A - barra superior oscura.
    textPrimary: colors.metal.silver100, // #E8E4DC - texto principal plateado cálido.
    textSecondary: colors.metal.silver300, // #AAA69E - texto secundario plateado.
    textMuted: colors.metal.silver400, // #78736B - texto apagado.
    textSubtle: colors.metal.silver500, // #5F5A53 - texto sutil.
    textInverse: colors.carbon[950],
    border: alpha(colors.warm.ivory, 0.10),
    borderSubtle: alpha(colors.warm.ivory, 0.05),
    borderStrong: alpha(colors.warm.ivory, 0.18),
    inputBorder: alpha(colors.warm.ivory, 0.16),
    primaryMain: colors.gold[650], // #C89830 - dorado principal en modo oscuro.
    primaryLight: colors.gold[550], // #DEB050 - dorado claro de marca.
    primaryDark: colors.gold[750], // #9C6E1A - dorado oscuro.
    primarySoft: alpha(colors.gold[650], 0.16), // #C89830 al 16% - fondo dorado suave.
    primarySofter: alpha(colors.gold[650], 0.08), // #C89830 al 8% - hover suave.
    secondaryMain: colors.emerald[575], // #1A6058 - verde secundario oscuro.
    secondaryLight: colors.emerald[525], // #1E6A60 - verde secundario claro.
    secondaryDark: colors.emerald[975], // #0D1F1C - verde petróleo profundo.
    secondarySoft: alpha(colors.emerald[575], 0.16), // #1A6058 al 16% - verde suave.
    focusRing: alpha(colors.gold[650], 0.30), // #C89830 al 30% - anillo de foco.
    rowHover: alpha(colors.gold[650], 0.08), // #C89830 al 8% - hover de fila.
    tableHeader: colors.carbon[875], // #222222 - encabezado de tabla oscuro.
    shadowColor: alpha(colors.carbon[1000], 0.56), // #000000 al 56% - sombra fuerte.
    overlay: alpha(colors.carbon[1000], 0.70), // #000000 al 70% - overlay modal.
    adminNavigation: {
      /*
       * MENÚ ADMINISTRATIVO.
       *
       * Se usa en:
       * - AdminSidebar
       * - AdminMobileDrawer
       * - AdminMenuList
       * - AdminActionItem
       * - AdminBrandLogo
       *
       * Si el menú se ve dorado o plateado, normalmente se controla aquí.
       */
      // Fondo general del sidebar/drawer administrativo.
      drawerBg: colors.carbon[975], // #050505 - fondo del sidebar/drawer administrativo.
      // Color base del texto dentro del drawer cuando no hay regla más específica.
      drawerText: colors.metal.silver100, // #E8E4DC - texto base del drawer.
      // Superficie del bloque de marca/logo según la zona donde se use.
      brandSurface: alpha(colors.warm.ivory, 0.045),
      // Borde del bloque del logo/marca.
      brandBorder: alpha(colors.warm.ivory, 0.10),
      // Fondo de marca o contenedor pequeño del símbolo/logo.
      brandMarkBg: alpha(colors.warm.ivory, 0.05),
      // Color del título de marca si se usa texto en lugar de imagen.
      brandTitle: colors.gold[550], // #DEB050 - título de marca dorado.
      // Color del subtítulo: por ejemplo, “Panel administrativo”.
      brandSubtitle: alpha(colors.warm.ivory, 0.58),
      // Color de títulos principales: INICIO, CONFIGURACIÓN BASE, CATÁLOGO, etc.
      groupText: colors.gold[550], // #DEB050 - título de grupos principales.
      // Color apagado del grupo cuando quieres menor jerarquía.
      groupTextMuted: alpha(colors.warm.ivory, 0.72),
      // Fondo al pasar el mouse sobre un grupo principal.
      groupHoverBg: alpha(colors.warm.ivory, 0.07),
      // Color de submenús normales: Resumen general, Pedidos, Productos, etc.
      itemText: alpha(colors.warm.ivory, 0.80),
      // Color de los íconos de submenús normales.
      itemIcon: alpha(colors.gold[350], 0.74), // #F0C860 al 74% - iconos de submenús.
      // Fondo al pasar el mouse sobre un submenú.
      itemHoverBg: alpha(colors.warm.ivory, 0.08),
      // Texto del submenú en hover.
      itemHoverText: alpha(colors.warm.ivory, 0.98),
      // Fondo del submenú activo/seleccionado.
      itemActiveBg: alpha(colors.gold[650], 0.18), // #C89830 al 18% - fondo activo.
      // Texto e ícono del submenú activo. Si sigue dorado, cambia este valor.
      itemActiveText: colors.gold[550], // #DEB050 - texto/ícono activo.
      // Líneas separadoras internas de la zona de navegación.
      divider: alpha(colors.warm.ivory, 0.10),
      // Fondo del botón para colapsar/expandir sidebar.
      toggleBg: alpha(colors.warm.ivory, 0.07),
      // Hover del botón para colapsar/expandir sidebar.
      toggleHoverBg: alpha(colors.gold[650], 0.20), // #C89830 al 20% - hover del toggle.
      // Texto/icono para acciones peligrosas: Cerrar sesión, eliminar, cancelar.
      actionDanger: colors.status.errorLight, // #BD4A3E - acción peligrosa en modo oscuro.
      // Fondo suave para acciones peligrosas.
      actionDangerBg: alpha(colors.status.errorLight, 0.12), // #BD4A3E al 12% - fondo danger.
    },
    storeNavigation: {
      /*
       * Navbar público en modo oscuro.
       * Se conserva el mismo fondo institucional para mantener identidad entre modos.
       */
      bg: colors.emerald[900],
      text: colors.metal.silver100,
      textMuted: alpha(colors.warm.ivory, 0.78),
      textSubtle: alpha(colors.warm.ivory, 0.58),
      border: alpha(colors.gold[650], 0.24),
      divider: alpha(colors.warm.ivory, 0.12),
      hoverBg: alpha(colors.warm.ivory, 0.07),
      activeBg: alpha(colors.gold[650], 0.18),
      brandSurface: alpha(colors.warm.ivory, 0.05),
      brandText: colors.gold[550],
      brandSubtext: alpha(colors.warm.ivory, 0.58),
      actionBorder: alpha(colors.gold[350], 0.42),
      heroCardBg: alpha(colors.warm.ivory, 0.08),
      heroCardBorder: alpha(colors.gold[650], 0.24),
    },
    storeMarketing: {
      /*
       * Tienda pública en modo oscuro.
       * Mantiene la misma API semántica que el modo claro.
       */
      pageBg: colors.carbon[950],
      sectionBg: colors.carbon[950],
      sectionAltBg: colors.carbon[940],
      sectionSoftBg: colors.carbon[925],

      cardBg: colors.carbon[925],
      cardBgAlt: colors.carbon[875],
      panelBg: colors.carbon[925],
      panelSoftBg: colors.carbon[875],

      text: colors.metal.silver100,
      muted: colors.metal.silver300,
      subtle: colors.metal.silver400,

      accent: colors.gold[550],
      accentHover: colors.gold[650],
      accentSoft: alpha(colors.gold[650], 0.16),
      accentSofter: alpha(colors.gold[650], 0.08),

      border: alpha(colors.warm.ivory, 0.10),
      borderStrong: alpha(colors.warm.ivory, 0.16),
      divider: alpha(colors.warm.ivory, 0.07),

      strongBg: colors.carbon[975],
      strongBgAlt: colors.emerald[950],
      strongText: colors.metal.silver100,
      strongMuted: alpha(colors.warm.ivory, 0.76),
      strongSubtle: alpha(colors.warm.ivory, 0.56),
      strongAccent: colors.gold[550],
      strongAccentSoft: alpha(colors.gold[650], 0.16),
      strongBorder: alpha(colors.gold[650], 0.24),
      strongCardBg: alpha(colors.warm.ivory, 0.065),
      strongCardHoverBg: alpha(colors.warm.ivory, 0.10),
      strongCardBorder: alpha(colors.gold[650], 0.22),

      lightBg: colors.carbon[950],
      lightBgAlt: colors.carbon[940],
      lightPanelBg: colors.carbon[925],
      lightText: colors.metal.silver100,
      lightMuted: colors.metal.silver300,
      lightSubtle: colors.metal.silver400,
      lightAccent: colors.gold[550],
      lightAccentSoft: alpha(colors.gold[650], 0.16),
      lightBorder: alpha(colors.warm.ivory, 0.10),
      lightDivider: alpha(colors.warm.ivory, 0.07),
      lightCardBg: colors.carbon[925],
      lightCardBgAlt: colors.carbon[875],
      lightCardBorder: alpha(colors.warm.ivory, 0.10),

      darkBg: colors.carbon[975],
      darkBgAlt: colors.emerald[950],
      darkText: colors.metal.silver100,
      darkMuted: alpha(colors.warm.ivory, 0.76),
      darkSubtle: alpha(colors.warm.ivory, 0.56),
      darkAccent: colors.gold[550],
      darkAccentSoft: alpha(colors.gold[650], 0.16),
      darkBorder: alpha(colors.gold[650], 0.24),
      darkDivider: alpha(colors.warm.ivory, 0.10),
      darkCardBg: alpha(colors.warm.ivory, 0.065),
      darkCardHoverBg: alpha(colors.warm.ivory, 0.10),
      darkCardBorder: alpha(colors.gold[650], 0.22),

      freshBg: colors.carbon[940],
      freshBgAlt: colors.carbon[925],
      freshAccent: colors.gold[550],
      freshAccentSoft: alpha(colors.gold[650], 0.16),
      freshBorder: alpha(colors.warm.ivory, 0.10),

      mauveBg: colors.carbon[940],
      mauveAccent: colors.gold[550],
      mauveBorder: alpha(colors.warm.ivory, 0.10),
      wineAccent: colors.gold[550],
      sandAccent: colors.gold[550],

      iconBg: alpha(colors.gold[650], 0.16),
      iconText: colors.gold[550],

      timelineBg: colors.carbon[950],
      timelineLine: alpha(colors.warm.ivory, 0.10),
    },
    form: {
      /*
       * FORMULARIOS.
       *
       * Se usa en formularios admin y tienda:
       * títulos, subtítulos, superficies, secciones y bordes.
       */
      // Color del título principal del formulario.
      titleColor: colors.metal.silver100, // #E8E4DC - título principal en modo oscuro.
      // Color de títulos de sección dentro del formulario.
      sectionTitleColor: colors.metal.silver100, // #E8E4DC - título de sección.
      // Color de captions/etiquetas pequeñas destacadas.
      captionColor: colors.gold[550], // #DEB050 - acento dorado de formulario.
      // Fondo principal del formulario.
      surface: colors.carbon[925], // #1A1A1A - superficie principal de formulario.
      // Fondo secundario para bloques internos.
      surfaceMuted: colors.carbon[875], // #222222 - superficie secundaria.
      // Borde de la zona o contenedor según el bloque donde se use.
      border: alpha(colors.warm.ivory, 0.10), // #F6F3EE al 10% - borde suave.
    },
    dataTable: {
      /*
       * TABLAS ADMINISTRATIVAS.
       *
       * Se usa en:
       * - AdminResourceTable
       * - DataTableToolbar
       * - DataTable
       * - paginación, acciones, filtros y estados vacíos.
       *
       * En modo oscuro usa carbono + plateado + dorado suave
       */
      toolbarBg: colors.carbon[925], // #1A1A1A - fondo de barra de búsqueda/filtros.
      toolbarBorder: alpha(colors.warm.ivory, 0.08), // #F6F3EE al 8% - borde de toolbar.
      filterBg: colors.carbon[875], // #222222 - fondo de campos de filtro.
      filterBorder: alpha(colors.warm.ivory, 0.10), // #F6F3EE al 10% - borde de filtros.
      headerBg: colors.carbon[875], // #222222 - fondo del encabezado de tabla.
      headerText: colors.metal.silver100, // #E8E4DC - texto del encabezado.
      rowBg: colors.carbon[925], // #1A1A1A - fondo base de filas.
      rowHoverBg: alpha(colors.gold[650], 0.08), // #C89830 al 8% - hover de fila.
      rowSelectedBg: alpha(colors.gold[650], 0.14), // #C89830 al 14% - fila seleccionada.
      cellText: colors.metal.silver100, // #E8E4DC - texto principal de celda.
      cellMuted: colors.metal.silver300, // #AAA69E - texto secundario de celda.
      cellBorder: alpha(colors.warm.ivory, 0.06), // #F6F3EE al 6% - separador de filas.
      actionIcon: alpha(colors.warm.ivory, 0.72), // #F6F3EE al 72% - iconos de acciones normales.
      actionHoverBg: alpha(colors.warm.ivory, 0.08), // #F6F3EE al 8% - hover de acciones.
      actionDanger: colors.status.errorLight, // #BD4A3E - acción destructiva en oscuro.
      paginationBg: colors.carbon[925], // #1A1A1A - fondo de paginación.
      paginationText: colors.metal.silver300, // #AAA69E - texto de paginación.
      paginationActiveBg: colors.gold[650], // #C89830 - página activa.
      paginationActiveText: colors.carbon[975], // #050505 - texto sobre página activa.
      emptyStateBg: colors.carbon[875], // #222222 - fondo de estado vacío.
      emptyStateIcon: colors.gold[550], // #DEB050 - icono de estado vacío.
      statusChipBg: alpha(colors.gold[650], 0.14), // #C89830 al 14% - chip suave dentro de tabla.
    },
    entityTone: {
      brand: {
        bg: alpha(colors.gold[600], 0.18), // #C99A45 al 18% - fondo dorado oscuro.
        fg: colors.gold[300], // #EED9B0 - texto dorado claro.
        border: alpha(colors.gold[500], 0.28), // #D9B36C al 28% - borde dorado.
      },

      emerald: {
        bg: alpha(colors.emerald[500], 0.18), // #2E6E62 al 18% - fondo verde oscuro.
        fg: colors.emerald[100], // #E6EFEC - texto verde claro.
        border: alpha(colors.emerald[300], 0.24), // #93BDB4 al 24% - borde verde.
      },

      success: {
        bg: alpha(colors.status.success, 0.20), // #1A5249 al 20% - fondo de éxito oscuro.
        fg: colors.status.successBg, // #E6EFEC - texto de éxito claro.
        border: alpha(colors.status.successBg, 0.18), // #E6EFEC al 18% - borde de éxito.
      },

      warning: {
        bg: alpha(colors.status.warning, 0.20), // #B8862B al 20% - fondo de advertencia oscuro.
        fg: colors.status.warningBg, // #F9F1E2 - texto de advertencia claro.
        border: alpha(colors.status.warningBg, 0.18), // #F9F1E2 al 18% - borde de advertencia.
      },

      info: {
        bg: alpha(colors.status.info, 0.22), // #2E5E7A al 22% - fondo informativo oscuro.
        fg: colors.status.infoBg, // #E4ECF1 - texto informativo claro.
        border: alpha(colors.status.infoBg, 0.18), // #E4ECF1 al 18% - borde informativo.
      },

      danger: {
        bg: alpha(colors.status.error, 0.22), // #A23A2E al 22% - fondo de error oscuro.
        fg: colors.status.errorBg, // #F6E5E2 - texto de error claro.
        border: alpha(colors.status.errorBg, 0.18), // #F6E5E2 al 18% - borde de error.
      },

      neutral: {
        bg: alpha(colors.warm.ivory, 0.08), // #F6F3EE al 8% - fondo neutro oscuro.
        fg: alpha(colors.warm.ivory, 0.82), // #F6F3EE al 82% - texto neutro claro.
        border: alpha(colors.warm.ivory, 0.12), // #F6F3EE al 12% - borde neutro.
      },
    },
  },
};

export const getSemanticColors = (mode = 'light') => semanticByMode[mode === 'dark' ? 'dark' : 'light'];

const createAppShadows = (mode) => {
  const semantic = getSemanticColors(mode);
  const shadows = Array(25).fill('none');

  shadows[1] = `0 1px 2px ${alpha(semantic.shadowColor, 0.55)}`;
  shadows[2] = `0 2px 6px ${alpha(semantic.shadowColor, 0.60)}, 0 1px 2px ${alpha(semantic.shadowColor, 0.45)}`;
  shadows[3] = `0 8px 20px ${alpha(semantic.shadowColor, 0.65)}, 0 2px 6px ${alpha(semantic.shadowColor, 0.45)}`;
  shadows[4] = `0 18px 40px ${alpha(semantic.shadowColor, 0.70)}, 0 6px 14px ${alpha(semantic.shadowColor, 0.50)}`;
  shadows[5] = `0 28px 55px ${alpha(semantic.shadowColor, 0.76)}`;
  shadows[6] = `0 34px 70px ${alpha(semantic.shadowColor, 0.82)}`;

  return shadows;
};

const getPalette = (mode = 'light') => {
  /*
   * Convierte los colores semánticos en palette de MUI.
   * Desde los componentes puedes consumir:
   * - theme.palette.primary.main
   * - theme.palette.secondary.main
   * - theme.palette.background.default
   * - theme.palette.text.primary
   * - theme.palette.custom.semantic
   */
  const semantic = getSemanticColors(mode);

  return {
    mode,
    primary: {
      main: semantic.primaryMain,
      light: semantic.primaryLight,
      dark: semantic.primaryDark,
      contrastText: colors.emerald[900],
    },
    secondary: {
      main: semantic.secondaryMain,
      light: semantic.secondaryLight,
      dark: semantic.secondaryDark,
      contrastText: colors.warm.ivory,
    },
    success: {
      main: colors.status.success,
      light: colors.status.successLight, // #2D7A4F - éxito claro.
      dark: colors.emerald[800],
      contrastText: colors.warm.white,
    },
    warning: {
      main: colors.status.warning,
      light: colors.gold[600],
      dark: colors.gold[800],
      contrastText: colors.emerald[900],
    },
    error: {
      main: colors.status.error,
      light: colors.status.errorLight, // #BD4A3E - error claro.
      dark: colors.status.errorDark, // #7D2C23 - error oscuro.
      contrastText: colors.warm.white,
    },
    info: {
      main: colors.status.info,
      light: colors.status.infoLight, // #467B99 - información clara.
      dark: colors.status.infoDark, // #1E445B - información oscura.
      contrastText: colors.warm.white,
    },
    grey: colors.carbon,
    common: { black: colors.carbon[950], white: colors.warm.white },
    background: {
      default: semantic.page,
      paper: semantic.paper,
    },
    text: {
      primary: semantic.textPrimary,
      secondary: semantic.textSecondary,
      disabled: semantic.textMuted,
    },
    divider: semantic.border,
    action: {
      active: semantic.secondaryMain,
      hover: semantic.primarySofter,
      selected: semantic.primarySoft,
      focus: semantic.focusRing,
      disabled: alpha(semantic.textPrimary, 0.35),
      disabledBackground: alpha(semantic.textPrimary, 0.08),
    },
    custom: {
      colors,
      semantic,
      radius,
      layout,
      motion,
      gradients: {
        hero: `linear-gradient(135deg, ${colors.emerald[900]} 0%, ${colors.emerald[800]} 58%, ${colors.emerald[700]} 100%)`,
        gold: `linear-gradient(135deg, ${colors.gold[600]} 0%, ${colors.gold[400]} 100%)`,
        paper: mode === 'dark'
          ? `linear-gradient(180deg, ${alpha(colors.warm.ivory, 0.045)} 0%, ${alpha(colors.warm.ivory, 0.015)} 100%)`
          : `linear-gradient(180deg, ${colors.warm.white} 0%, ${colors.warm.cream} 100%)`,
      },
      shadows: {
        sm: `0 1px 2px ${alpha(semantic.shadowColor, 0.50)}`,
        md: `0 8px 20px ${alpha(semantic.shadowColor, 0.60)}`,
        lg: `0 18px 40px ${alpha(semantic.shadowColor, 0.68)}`,
        xl: `0 28px 55px ${alpha(semantic.shadowColor, 0.76)}`,
        goldGlow: `0 0 0 3px ${alpha(semantic.primaryMain, 0.18)}`,
        emeraldGlow: `0 0 0 3px ${alpha(semantic.secondaryMain, 0.18)}`,
      },
    },
  };
};

const getTypography = (mode = 'light') => {
  /*
   * Tipografía global:
   * - Cinzel para títulos elegantes.
   * - Montserrat/Poppins/Roboto para lectura y UI.
   */
  const semantic = getSemanticColors(mode);

  return {
    fontFamily: `'Montserrat', 'Poppins', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontFamily: `'Cinzel', Georgia, serif`,
      fontWeight: 500,
      fontSize: '2.5rem',
      lineHeight: 1.1,
      letterSpacing: '0.04em',
      color: semantic.textPrimary,
    },
    h2: {
      fontFamily: `'Cinzel', Georgia, serif`,
      fontWeight: 500,
      fontSize: '2rem',
      lineHeight: 1.14,
      letterSpacing: '0.04em',
      color: semantic.textPrimary,
    },
    h3: {
      fontFamily: `'Cinzel', Georgia, serif`,
      fontWeight: 500,
      fontSize: '1.65rem',
      lineHeight: 1.18,
      letterSpacing: '0.035em',
      color: semantic.textPrimary,
    },
    h4: {
      fontFamily: `'Cinzel', Georgia, serif`,
      fontWeight: 500,
      fontSize: '1.35rem',
      lineHeight: 1.24,
      letterSpacing: '0.04em',
      color: semantic.textPrimary,
    },
    h5: {
      fontFamily: `'Cinzel', Georgia, serif`,
      fontWeight: 500,
      fontSize: '1.12rem',
      lineHeight: 1.28,
      letterSpacing: '0.04em',
      color: semantic.textPrimary,
    },
    h6: {
      fontFamily: `'Cinzel', Georgia, serif`,
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.32,
      letterSpacing: '0.04em',
      color: semantic.textPrimary,
    },
    subtitle1: { fontWeight: 700, lineHeight: 1.45, color: semantic.textPrimary },
    subtitle2: { fontWeight: 700, lineHeight: 1.45, color: semantic.textSecondary },
    body1: { fontSize: '0.95rem', lineHeight: 1.65, color: semantic.textPrimary },
    body2: { fontSize: '0.86rem', lineHeight: 1.55, color: semantic.textSecondary },
    caption: { fontSize: '0.74rem', lineHeight: 1.4, color: semantic.textMuted },
    overline: {
      fontSize: '0.68rem',
      lineHeight: 1.4,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      fontWeight: 700,
      color: semantic.primaryMain,
    },
    button: {
      fontSize: '0.82rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'none',
    },
  };
};

const statusSoftBackground = (themeColor, mode) => (
  mode === 'dark' ? alpha(themeColor, 0.18) : alpha(themeColor, 0.12)
);

const getComponents = (mode = 'light') => {
  /*
   * Overrides globales de MUI .
   * Aquí se define la apariencia base de Paper, Card, Button, TextField,
   * Dialog, Table, Drawer, Menu, Chip, etc.
   *
   * Regla: los componentes reutilizables deben apoyarse en estos estilos
   * y solo ajustar con sx cuando sea necesario.
   */
  const semantic = getSemanticColors(mode);
  const isDark = mode === 'dark';

  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        html: {
          minHeight: '100%',
          scrollBehavior: 'smooth',
        },
        body: {
          minHeight: '100%',
          margin: 0,
          backgroundColor: semantic.page,
          color: semantic.textPrimary,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        },
        '#root': { minHeight: '100%' },
        '::selection': {
          backgroundColor: semantic.primaryMain,
          color: colors.warm.white,
        },
        a: {
          color: 'inherit',
          textDecoration: 'none',
        },
        img: { maxWidth: '100%', display: 'block' },
        'input, textarea, select, button': { fontFamily: 'inherit' },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-track': { background: alpha(semantic.textPrimary, 0.04) },
        '*::-webkit-scrollbar-thumb': {
          background: alpha(semantic.secondaryMain, isDark ? 0.48 : 0.24),
          borderRadius: radius.pill,
          // Borde de la zona o contenedor según el bloque donde se use.
      border: `2px solid ${semantic.page}`,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: alpha(semantic.primaryMain, isDark ? 0.70 : 0.52),
        },
      },
    },

    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (min-width: 1200px)': { paddingLeft: 32, paddingRight: 32 },
        },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          // Borde de la zona o contenedor según el bloque donde se use.
      border: `1px solid ${semantic.border}`,
          backgroundColor: semantic.paper,
          color: semantic.textPrimary,
        },
        rounded: { borderRadius: radius.lg },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: radius.lg,
          // Borde de la zona o contenedor según el bloque donde se use.
      border: `1px solid ${semantic.border}`,
          backgroundColor: semantic.paper,
          // Las cards globales son neutras. Los degradados o fondos especiales se definen por componente.
          backgroundImage: 'none',
          boxShadow: 'none',
          transition: `border-color ${motion.durationBase} ${motion.easeOut}, box-shadow ${motion.durationBase} ${motion.easeOut}, transform ${motion.durationBase} ${motion.easeOut}`,
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
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          padding: '10px 20px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          minHeight: 40,
          boxShadow: 'none',
          transition: `all ${motion.durationBase} ${motion.easeOut}`,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 8px 20px ${alpha(semantic.shadowColor, 0.22)}`,
          },
          '&.Mui-disabled': { transform: 'none', boxShadow: 'none' },
        },
        sizeSmall: {
          minHeight: 34,
          padding: '7px 14px',
          fontSize: '0.75rem',
        },
        sizeLarge: {
          minHeight: 48,
          padding: '13px 28px',
          fontSize: '0.88rem',
        },
        containedPrimary: {
          backgroundColor: semantic.primaryMain,
          color: colors.emerald[900],
          '&:hover': { backgroundColor: semantic.primaryLight },
        },
        containedSecondary: {
          backgroundColor: semantic.secondaryMain,
          color: colors.warm.ivory,
          '&:hover': { backgroundColor: semantic.secondaryDark },
        },
        outlined: {
          borderColor: semantic.borderStrong,
          color: semantic.textPrimary,
          backgroundColor: 'transparent',
          '&:hover': {
            borderColor: semantic.primaryMain,
            backgroundColor: semantic.primarySofter,
          },
        },
        // Texto principal sobre el navbar público.
      text: {
          color: semantic.textSecondary,
          '&:hover': { backgroundColor: semantic.primarySofter, color: semantic.textPrimary },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          transition: `all ${motion.durationBase} ${motion.easeOut}`,
          '&:hover': {
            backgroundColor: semantic.primarySofter,
            color: semantic.primaryMain,
          },
        },
        colorPrimary: {
          color: semantic.primaryMain,
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: semantic.textSecondary,
          fontWeight: 600,
          '&.MuiInputLabel-shrink': {
            color: semantic.primaryMain,
            fontWeight: 700,
            letterSpacing: '0.02em',
          },
          '&.Mui-focused': {
            color: semantic.primaryMain,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          color: semantic.textPrimary,
          backgroundColor: semantic.paper,
          transition: `box-shadow ${motion.durationBase} ${motion.easeOut}, border-color ${motion.durationBase} ${motion.easeOut}`,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: semantic.inputBorder },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: semantic.primaryMain },
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${semantic.focusRing}` },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: semantic.primaryMain, borderWidth: 1 },
          '&.Mui-disabled': { backgroundColor: alpha(semantic.textPrimary, 0.04) },
          '& input:-webkit-autofill, & textarea:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 100px ${semantic.paper} inset !important`,
            WebkitTextFillColor: `${semantic.textPrimary} !important`,
            caretColor: semantic.textPrimary,
            borderRadius: 'inherit',
          },
        },
        input: {
          padding: '12.5px 14px',
          fontWeight: 500,
          '&::placeholder': { color: semantic.textSubtle, opacity: 1 },
        },
        multiline: { padding: 0 },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true, size: 'medium' },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          letterSpacing: '0.02em',
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: { marginLeft: 0, marginRight: 0, color: semantic.textMuted, fontSize: '0.74rem' },
      },
    },

    MuiSelect: {
      styleOverrides: {
        icon: { color: semantic.textMuted },
        select: { fontWeight: 500 },
      },
    },

    MuiMenu: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        paper: {
          borderRadius: radius.md,
          // Borde de la zona o contenedor según el bloque donde se use.
      border: `1px solid ${semantic.border}`,
          boxShadow: `0 18px 40px ${alpha(semantic.shadowColor, 0.45)}`,
          backgroundImage: 'none',
          backgroundColor: semantic.paper,
          marginTop: 8,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          margin: '2px 6px',
          fontWeight: 500,
          '&.Mui-selected': {
            backgroundColor: semantic.primarySoft,
            color: semantic.textPrimary,
            fontWeight: 700,
          },
          '&.Mui-selected:hover, &:hover': {
            backgroundColor: semantic.primarySofter,
          },
        },
      },
    },

    MuiChip: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          borderRadius: radius.pill,
          fontWeight: 700,
          letterSpacing: '0.02em',
          borderColor: semantic.border,
          backgroundColor: alpha(semantic.textPrimary, 0.06),
          color: semantic.textSecondary,
        },
        colorPrimary: { backgroundColor: semantic.primarySoft, color: semantic.primaryDark },
        colorSecondary: { backgroundColor: semantic.secondarySoft, color: semantic.secondaryMain },
        colorSuccess: { backgroundColor: statusSoftBackground(colors.status.success, mode), color: colors.status.success },
        colorWarning: { backgroundColor: statusSoftBackground(colors.status.warning, mode), color: colors.status.warning },
        colorError: { backgroundColor: statusSoftBackground(colors.status.error, mode), color: colors.status.error },
        colorInfo: { backgroundColor: statusSoftBackground(colors.status.info, mode), color: colors.status.info },
        outlined: {
          backgroundColor: 'transparent',
          borderColor: semantic.borderStrong,
        },
      },
    },

    MuiAlert: {
      defaultProps: { variant: 'standard' },
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          // Borde de la zona o contenedor según el bloque donde se use.
      border: `1px solid ${semantic.border}`,
          alignItems: 'flex-start',
        },
        standardSuccess: {
          backgroundColor: statusSoftBackground(colors.status.success, mode),
          color: colors.status.success,
          borderLeft: `3px solid ${colors.status.success}`,
        },
        standardWarning: {
          backgroundColor: statusSoftBackground(colors.status.warning, mode),
          color: colors.status.warning,
          borderLeft: `3px solid ${colors.status.warning}`,
        },
        standardError: {
          backgroundColor: statusSoftBackground(colors.status.error, mode),
          color: colors.status.error,
          borderLeft: `3px solid ${colors.status.error}`,
        },
        standardInfo: {
          backgroundColor: statusSoftBackground(colors.status.info, mode),
          color: colors.status.info,
          borderLeft: `3px solid ${colors.status.info}`,
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: semantic.dataTable.rowBg,
          border: `1px solid ${semantic.dataTable.cellBorder}`,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${semantic.dataTable.cellBorder}`,
          color: semantic.dataTable.cellText,
          fontSize: '0.84rem',
        },
        head: {
          backgroundColor: semantic.dataTable.headerBg,
          color: semantic.dataTable.headerText,
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: semantic.dataTable.rowBg,
          '&.MuiTableRow-hover:hover': {
            backgroundColor: semantic.dataTable.rowHoverBg,
          },
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: semantic.dataTable.rowSelectedBg,
          },
        },
      },
    },

    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: semantic.dataTable.paginationText,
          backgroundColor: semantic.dataTable.paginationBg,
        },
        selectLabel: { fontWeight: 600 },
        displayedRows: { fontWeight: 600 },
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderBottom: `1px solid ${semantic.border}`,
          boxShadow: 'none',
        },
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: { minHeight: `${layout.headerHeight}px !important` },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          borderColor: semantic.border,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          transition: `all ${motion.durationBase} ${motion.easeOut}`,
          '&.Mui-selected': {
            backgroundColor: semantic.primarySoft,
            color: semantic.textPrimary,
          },
          '&.Mui-selected:hover, &:hover': {
            backgroundColor: semantic.primarySofter,
          },
        },
      },
    },

    MuiDialog: {
      defaultProps: { slotProps: { paper: { elevation: 0 } } },
      styleOverrides: {
        paper: {
          borderRadius: radius.lg,
          // Borde de la zona o contenedor según el bloque donde se use.
      border: `1px solid ${semantic.border}`,
          backgroundImage: 'none',
          backgroundColor: semantic.paper,
          boxShadow: `0 28px 55px ${alpha(semantic.shadowColor, 0.60)}`,
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: `'Cinzel', Georgia, serif`,
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: semantic.textPrimary,
          borderBottom: `1px solid ${semantic.borderSubtle}`,
          padding: '22px 28px',
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: { root: { padding: '24px 28px' } },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '18px 28px',
          borderTop: `1px solid ${semantic.borderSubtle}`,
          backgroundColor: semantic.paperWarm,
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: semantic.primaryMain, height: 2 },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'none',
          color: semantic.textMuted,
          '&.Mui-selected': { color: semantic.textPrimary },
        },
      },
    },

    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontWeight: 700,
          color: semantic.textMuted,
          '&.Mui-active, &.Mui-completed': { color: semantic.textPrimary },
        },
      },
    },

    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: alpha(semantic.textPrimary, 0.18),
          '&.Mui-active': { color: semantic.primaryMain },
          '&.Mui-completed': { color: semantic.secondaryMain },
        },
      },
    },

    MuiDivider: {
      styleOverrides: { root: { borderColor: semantic.border } },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: semantic.secondaryDark,
          color: colors.warm.ivory,
          borderRadius: radius.sm,
          fontWeight: 600,
        },
        arrow: { color: semantic.secondaryDark },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          backgroundColor: semantic.primaryMain,
          color: colors.emerald[900],
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 800,
          // Borde de la zona o contenedor según el bloque donde se use.
      border: `1px solid ${semantic.paper}`,
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: colors.warm.white,
            '& + .MuiSwitch-track': { backgroundColor: semantic.secondaryMain, opacity: 1 },
          },
        },
        track: { backgroundColor: alpha(semantic.textPrimary, 0.26), opacity: 1 },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: alpha(semantic.textPrimary, 0.44),
          '&.Mui-checked': { color: semantic.secondaryMain },
        },
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: {
          color: alpha(semantic.textPrimary, 0.44),
          '&.Mui-checked': { color: semantic.secondaryMain },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: radius.pill, backgroundColor: alpha(semantic.textPrimary, 0.09) },
        bar: { borderRadius: radius.pill, backgroundColor: semantic.primaryMain },
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          fontWeight: 700,
          '&.Mui-selected': {
            backgroundColor: semantic.primaryMain,
            color: colors.emerald[900],
            '&:hover': { backgroundColor: semantic.primaryLight },
          },
        },
      },
    },
  };
};

export const getTheme = (mode = 'light') => {
  /*
   * Punto final del theme.
   * AppThemeProvider debe llamar getTheme(mode) y pasar el resultado a <ThemeProvider />.
   */
  return createTheme({
    spacing: 8,
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
    shape: { borderRadius: radius.md },
    palette: getPalette(mode),
    typography: getTypography(mode),
    shadows: createAppShadows(mode),
    components: getComponents(mode),
  });
};
