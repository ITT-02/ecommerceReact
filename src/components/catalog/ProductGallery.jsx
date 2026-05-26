import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChevronLeftRoundedIcon  from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PlayCircleRoundedIcon   from '@mui/icons-material/PlayCircleRounded';
import BrokenImageRoundedIcon  from '@mui/icons-material/BrokenImageRounded';

// ─── Constantes ───────────────────────────────────────────────────
/** Lado del cuadrado de cada miniatura en px */
const THUMB_SIZE   = 72;
/** Relación de aspecto del visor principal – 1/1 = cuadrado, imagen más grande */
const ASPECT_RATIO = '1/1';
/** Duración del fade en ms */
const FADE_MS      = 260;

// ─── Helper: keyframe de fade reutilizable ────────────────────────
const fadeInSx = {
  animation          : `pmgFadeIn ${FADE_MS}ms ease forwards`,
  '@keyframes pmgFadeIn': {
    from: { opacity: 0 },
    to  : { opacity: 1 },
  },
};

// ─── Normalización ────────────────────────────────────────────────
/**
 * Convierte cualquier formato de item multimedia a
 * { type: 'image'|'video', src, alt }.
 */
const normalizeItem = (item, fallbackAlt = '') => {
  if (!item) return null;

  // URL plana
  if (typeof item === 'string') {
    return { type: 'image', src: item, alt: fallbackAlt };
  }

  const rawType = item.tipo_multimedia ?? item.type ?? '';
  const isVideo =
    rawType === 'video' ||
    (typeof rawType === 'string' && rawType.startsWith('video/'));

  const src =
    item.url_archivo ??
    item.src         ??
    item.url         ??
    '';

  if (!src) return null;

  return {
    type: isVideo ? 'video' : 'image',
    src,
    alt : item.texto_alternativo ?? item.name ?? item.alt ?? fallbackAlt,
    id  : item.id ?? null,
  };
};

// ─── Componente principal ─────────────────────────────────────────
export const ProductGallery = ({
  media         = [],
  fallbackImage = '',
  productName   = '',
  orientation   = 'horizontal', // 'horizontal' | 'vertical'
}) => {
  // Construye el array normalizado; si no hay medios, usa fallback.
  const items = (() => {
    const source =
      media.length > 0
        ? media
        : fallbackImage
          ? [fallbackImage]
          : [];
    return source
      .map((item) => normalizeItem(item, productName))
      .filter(Boolean);
  })();

  const [activeIndex, setActiveIndex]   = useState(0);
  // Rastrea qué src fallaron para mostrar ícono de imagen rota
  const [brokenSrcs, setBrokenSrcs]     = useState(new Set());
  // Clave que fuerza el remonte del elemento activo para reiniciar la animación
  const [animKey, setAnimKey]           = useState(0);
  // Altura real del visor principal (medida por ResizeObserver)
  const [viewerHeight, setViewerHeight] = useState(null);
  // Controla visibilidad de flechas: solo se muestran al hacer hover sobre el visor
  const [showArrows, setShowArrows]     = useState(false);

  const videoRef    = useRef(null);
  const thumbsRef   = useRef(null);
  const viewerBoxRef = useRef(null); // ref sobre el box con aspect-ratio

  const isVertical  = orientation === 'vertical';
  const showNav     = items.length > 1;
  const activeItem  = items[activeIndex] ?? null;
  const isVideo     = activeItem?.type === 'video';
  const srcBroken   = activeItem ? brokenSrcs.has(activeItem.src) : false;

  // ── Mide la altura real del visor para sincronizar el carrusel ─
  useEffect(() => {
    if (!isVertical || !viewerBoxRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setViewerHeight(Math.round(entry.contentRect.height));
    });
    observer.observe(viewerBoxRef.current);
    return () => observer.disconnect();
  }, [isVertical]);

  // ── Sincroniza miniatura activa en el scroll ──────────────────
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const thumb = container.children[activeIndex];
    thumb?.scrollIntoView({
      behavior: 'smooth',
      block   : 'nearest',
      inline  : 'nearest',
    });
  }, [activeIndex]);

  // ── Recarga el video cuando cambia la fuente ──────────────────
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [activeItem?.src]);

  // ── Navega a un índice dado ───────────────────────────────────
  const goTo = useCallback((idx) => {
    setActiveIndex(idx);
    setAnimKey((k) => k + 1); // fuerza remonte → reinicia fade
  }, []);

  const handlePrev = useCallback(
    () => goTo(activeIndex === 0 ? items.length - 1 : activeIndex - 1),
    [activeIndex, items.length, goTo],
  );
  const handleNext = useCallback(
    () => goTo(activeIndex === items.length - 1 ? 0 : activeIndex + 1),
    [activeIndex, items.length, goTo],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   handlePrev();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
    },
    [handlePrev, handleNext],
  );

  const markBroken = useCallback((src) => {
    setBrokenSrcs((prev) => new Set([...prev, src]));
  }, []);

  if (!items.length) return null;

  return (
    <Box
      sx={{
        display      : 'flex',
        flexDirection: isVertical ? 'row' : 'column',
        gap          : 1.5,
        width        : '100%',
      }}
    >
      {/* ── Miniaturas a la IZQUIERDA (vertical) ──────────────── */}
      {isVertical && (
        <ThumbnailStrip
          items       = {items}
          activeIndex = {activeIndex}
          isVertical  = {true}
          brokenSrcs  = {brokenSrcs}
          thumbsRef   = {thumbsRef}
          maxHeight   = {viewerHeight}   // ← altura real medida del visor
          onSelect    = {goTo}
        />
      )}

      {/* ── Visor principal ──────────────────────────────────── */}
      <Box
        sx           = {{ flex: 1, minWidth: 0, minHeight: 0, outline: 'none' }}
        tabIndex     = {0}
        onKeyDown    = {handleKeyDown}
        onMouseEnter = {() => setShowArrows(true)}
        onMouseLeave = {() => setShowArrows(false)}
        aria-label   = {`Galería de medios – ${productName}`}
      >
        {/* Contenedor con relación de aspecto fija */}
        <Box
          ref = {viewerBoxRef}
          sx={{
            position    : 'relative',
            width       : '100%',
            aspectRatio : ASPECT_RATIO,
            borderRadius: 2.5,
            overflow    : 'hidden',
            bgcolor     : 'background.paper',
          }}
        >
          {/* ── Imagen ────────────────────────────────────────── */}
          {!isVideo && !srcBroken && (
            <Box
              key       = {`img-${animKey}`}
              component = "img"
              src       = {activeItem?.src}
              alt       = {activeItem?.alt || productName}
              draggable = {false}
              onError   = {() => markBroken(activeItem?.src)}
              sx={{
                position : 'absolute',
                inset    : 0,
                width    : '100%',
                height   : '100%',
                objectFit: 'contain',
                ...fadeInSx,
              }}
            />
          )}

          {/* ── Video (overlay absoluto sobre el contenedor) ─── */}
          {isVideo && (
            <Box
              key       = {`vid-${animKey}`}
              ref       = {videoRef}
              component = "video"
              src       = {activeItem.src}
              autoPlay
              muted
              loop
              playsInline
              sx={{
                position : 'absolute',
                inset    : 0,
                width    : '100%',
                height   : '100%',
                objectFit: 'contain',
                ...fadeInSx,
              }}
            />
          )}

          {/* ── Imagen rota ───────────────────────────────────── */}
          {(srcBroken || (!activeItem?.src)) && (
            <Box
              sx={{
                position      : 'absolute',
                inset         : 0,
                display       : 'flex',
                flexDirection : 'column',
                alignItems    : 'center',
                justifyContent: 'center',
                gap           : 1,
                color         : 'text.disabled',
              }}
            >
              <BrokenImageRoundedIcon sx={{ fontSize: 52 }} />
              <Typography variant="caption">Sin imagen disponible</Typography>
            </Box>
          )}

          {/* ── Flecha anterior ───────────────────────────────── */}
          {showNav && (
            <NavArrow direction="left"  onClick={handlePrev} aria="Elemento anterior" visible={showArrows} />
          )}

          {/* ── Flecha siguiente ──────────────────────────────── */}
          {showNav && (
            <NavArrow direction="right" onClick={handleNext} aria="Elemento siguiente" visible={showArrows} />
          )}

          {/* ── Contador flotante ─────────────────────────────── */}
          {showNav && (
            <MediaBadge bottom={10} right={12}>
              {activeIndex + 1}&nbsp;/&nbsp;{items.length}
            </MediaBadge>
          )}

          {/* ── Badge VIDEO ───────────────────────────────────── */}
          {isVideo && (
            <Box
              sx={{
                position      : 'absolute',
                top           : 10,
                left          : 12,
                px            : 1,
                py            : 0.25,
                borderRadius  : 10,
                bgcolor       : (t) => alpha(t.palette.common.black, 0.5),
                backdropFilter: 'blur(6px)',
                zIndex        : 2,
                pointerEvents : 'none',
                display       : 'flex',
                alignItems    : 'center',
                gap           : 0.5,
              }}
            >
              <PlayCircleRoundedIcon sx={{ color: '#fff', fontSize: 13 }} />
              <Typography
                variant = "caption"
                sx      = {{
                  color     : '#fff',
                  fontWeight: 700,
                  fontSize  : '0.65rem',
                  lineHeight: 1.5,
                }}
              >
                VIDEO
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Miniaturas ABAJO (horizontal) ─────────────────────── */}
      {!isVertical && (
        <ThumbnailStrip
          items       = {items}
          activeIndex = {activeIndex}
          isVertical  = {false}
          brokenSrcs  = {brokenSrcs}
          thumbsRef   = {thumbsRef}
          onSelect    = {goTo}
        />
      )}
    </Box>
  );
};

// ─── NavArrow ─────────────────────────────────────────────────────
const NavArrow = ({ direction, onClick, aria, visible = false }) => (
  <IconButton
    size       = "small"
    onClick    = {onClick}
    aria-label = {aria}
    tabIndex   = {visible ? 0 : -1}   // excluir del foco cuando está oculto
    sx={{
      position      : 'absolute',
      [direction]   : 8,
      top           : '50%',
      transform     : 'translateY(-50%)',
      zIndex        : 2,
      bgcolor       : (t) => alpha(t.palette.background.paper, 0.88),
      backdropFilter: 'blur(6px)',
      border        : '1px solid',
      borderColor   : 'divider',
      // Fade in/out al hacer hover sobre el visor
      opacity       : visible ? 1 : 0,
      pointerEvents : visible ? 'auto' : 'none',
      transition    : 'opacity 0.22s ease, background-color 0.2s',
      '&:hover'     : { bgcolor: 'background.paper' },
    }}
  >
    {direction === 'left'
      ? <ChevronLeftRoundedIcon  fontSize="small" />
      : <ChevronRightRoundedIcon fontSize="small" />}
  </IconButton>
);

// ─── MediaBadge (contador flotante) ──────────────────────────────
const MediaBadge = ({ bottom, right, top, left, children }) => (
  <Box
    sx={{
      position      : 'absolute',
      ...(bottom !== undefined && { bottom }),
      ...(right  !== undefined && { right  }),
      ...(top    !== undefined && { top    }),
      ...(left   !== undefined && { left   }),
      px            : 1,
      py            : 0.25,
      borderRadius  : 10,
      bgcolor       : (t) => alpha(t.palette.common.black, 0.45),
      backdropFilter: 'blur(6px)',
      zIndex        : 2,
      pointerEvents : 'none',
    }}
  >
    <Typography
      variant = "caption"
      sx      = {{ color: '#fff', fontWeight: 700, lineHeight: 1.5 }}
    >
      {children}
    </Typography>
  </Box>
);

// ─── ThumbnailStrip ───────────────────────────────────────────────
const ThumbnailStrip = ({
  items,
  activeIndex,
  isVertical,
  brokenSrcs,
  thumbsRef,
  maxHeight,   // altura real del visor (solo aplica en vertical)
  onSelect,
}) => {
  if (items.length <= 1) return null;

  return (
    <Box
      ref       = {thumbsRef}
      role      = "listbox"
      aria-label= "Miniaturas de medios"
      sx={{
        display      : 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap          : 1,
        /* Scroll según orientación */
        overflowX    : isVertical ? 'hidden' : 'auto',
        overflowY    : isVertical ? 'auto'   : 'hidden',
        /* Tamaño del carril de miniaturas */
        ...(isVertical
          ? {
              // THUMB_SIZE + 8px → 4px de respiro a cada lado para que
              // los bordes redondeados y el box-shadow no queden cortados
              width    : THUMB_SIZE + 8,
              flexShrink: 0,
              px       : 0.5,   // 4px izquierda y derecha (simétrico)
              // maxHeight = altura medida del visor → carrusel proporcional
              maxHeight: maxHeight != null ? `${maxHeight}px` : 'unset',
            }
          : { pb: 0.5 }),
        /* Scrollbar completamente oculto (igual que Temu)
           – el scroll sigue funcionando con rueda del mouse y touch */
        scrollbarWidth: 'none',           // Firefox
        '&::-webkit-scrollbar': {
          display: 'none',                // Chrome / Safari / Edge
        },
      }}
    >
      {items.map((item, idx) => (
        <ThumbnailItem
          key       = {item.id ?? idx}
          item      = {item}
          index     = {idx}
          isActive  = {idx === activeIndex}
          isBroken  = {brokenSrcs.has(item.src)}
          onClick   = {() => onSelect(idx)}
        />
      ))}
    </Box>
  );
};

// ─── ThumbnailItem ────────────────────────────────────────────────
const ThumbnailItem = ({ item, index, isActive, isBroken, onClick }) => {
  const isVideo = item.type === 'video';

  return (
    <Box
      role         = "option"
      aria-selected= {isActive}
      aria-label   = {`${isVideo ? 'Video' : 'Imagen'} ${index + 1}`}
      tabIndex      = {0}
      onClick       = {onClick}
      onMouseEnter  = {onClick}
      onKeyDown     = {(e) =>
        (e.key === 'Enter' || e.key === ' ') && onClick()
      }
      sx={{
        position    : 'relative',
        width       : THUMB_SIZE,
        height      : THUMB_SIZE,
        flexShrink  : 0,
        borderRadius: 1.5,
        overflow    : 'hidden',
        cursor      : 'pointer',
        outline     : 'none',
        transition  : 'opacity 0.18s',
        bgcolor     : 'background.paper',
        '&:hover'   : { opacity: 0.82 },
        '&:focus-visible': {
          // inset box-shadow: nunca se recorta por el overflow del padre
          boxShadow: (t) => `inset 0 0 0 2px ${t.palette.primary.main}`,
        },
      }}
    >
      {/* Contenido de la miniatura */}
      {isBroken ? (
        <Box
          sx={{
            width         : '100%',
            height        : '100%',
            display       : 'flex',
            alignItems    : 'center',
            justifyContent: 'center',
            color         : 'text.disabled',
          }}
        >
          <BrokenImageRoundedIcon fontSize="small" />
        </Box>
      ) : isVideo ? (
        /* Primer frame del video */
        <Box
          component = "video"
          src       = {`${item.src}#t=0.5`}
          muted
          preload   = "metadata"
          sx        = {{
            width    : '100%',
            height   : '100%',
            objectFit: 'cover',
            display  : 'block',
          }}
        />
      ) : (
        <Box
          component = "img"
          src       = {item.src}
          alt       = {item.alt}
          draggable = {false}
          sx        = {{
            width    : '100%',
            height   : '100%',
            objectFit: 'cover',
            display  : 'block',
          }}
        />
      )}

      {/* Overlay play sobre miniaturas de video */}
      {isVideo && !isBroken && (
        <Box
          sx={{
            position      : 'absolute',
            inset         : 0,
            display       : 'flex',
            alignItems    : 'center',
            justifyContent: 'center',
            bgcolor       : (t) => alpha(t.palette.common.black, 0.30),
          }}
        >
          <PlayCircleRoundedIcon
            sx={{
              color : '#fff',
              fontSize: 26,
              filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))',
            }}
          />
        </Box>
      )}

      {/* Indicador activo: borde interior (inset) → nunca recortado por overflow del padre */}
      {isActive && (
        <Box
          sx={{
            position     : 'absolute',
            inset        : 0,
            borderRadius : 'inherit',
            border       : '3px solid',
            borderColor  : 'primary.main',
            pointerEvents: 'none',
            zIndex       : 4,
          }}
        />
      )}

    </Box>
  );
};
