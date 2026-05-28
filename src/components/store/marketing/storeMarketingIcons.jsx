/**
 * Mapa central de iconos para secciones públicas de tienda.
 *
 * El contenido editable solo guarda iconKey; los componentes resuelven aquí
 * el icono visual para evitar guardar JSX dentro de archivos de texto/contenido.
 */

import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const iconMap = {
  savings: AttachMoneyRoundedIcon,
  photo: CameraAltOutlinedIcon,
  support: ContactSupportOutlinedIcon,
  target: TrackChangesOutlinedIcon,
  quality: VerifiedOutlinedIcon,
  community: GroupsOutlinedIcon,
  innovation: RocketLaunchOutlinedIcon,
  whatsapp: WhatsAppIcon,
  email: EmailOutlinedIcon,
  phone: LocalPhoneOutlinedIcon,
  location: LocationOnOutlinedIcon,
  product: Inventory2OutlinedIcon,
  award: EmojiEventsOutlinedIcon,
};

export const getStoreMarketingIcon = (iconKey) => iconMap[iconKey] ?? Inventory2OutlinedIcon;
