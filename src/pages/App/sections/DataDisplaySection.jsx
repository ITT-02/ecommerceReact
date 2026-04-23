import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsIcon from '@mui/icons-material/Notifications';

export const DataDisplaySection = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Data Display
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Chips, avatar, badge y accordion.
        </Typography>

        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <Chip label="Nuevo" color="primary" />
            <Chip label="Oferta" color="secondary" />
            <Chip label="Premium" variant="outlined" color="primary" />
            <Chip label="Agotado" variant="outlined" color="secondary" />
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center' }}
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>

            <Badge badgeContent={4} color="error">
              <IconButton>
                <NotificationsIcon />
              </IconButton>
            </Badge>
          </Stack>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>¿Qué es el theme global?</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Typography color="text.secondary">
                Es la configuración visual centralizada de Material UI para toda la app.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </CardContent>
    </Card>
  );
};