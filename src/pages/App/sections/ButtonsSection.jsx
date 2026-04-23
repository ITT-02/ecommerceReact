import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {Button} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export const ButtonsSection = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Botones
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Variantes principales de MUI con y sin iconos.
        </Typography>

        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <Button variant="contained" color="primary">Primario</Button>
            <Button variant="contained" color="secondary">Secundario</Button>
            <Button variant="outlined" color="primary">Outlined gold</Button>
            <Button variant="outlined" color="secondary">Outlined dark</Button>
            <Button variant="text" color="primary">Text</Button>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <Button variant="contained" color="primary" startIcon={<AddIcon />}>
              Crear
            </Button>

            <Button variant="contained" color="secondary" startIcon={<EditIcon />}>
              Editar
            </Button>

            <Button variant="outlined" color="secondary" startIcon={<DeleteOutlinedIcon />}>
              Eliminar
            </Button>

            <Button variant="contained" color="primary" endIcon={<ShoppingCartIcon />}>
              Comprar
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <Button size="small" variant="contained" color="primary">Small</Button>
            <Button size="medium" variant="contained" color="primary">Medium</Button>
            <Button size="large" variant="contained" color="primary">Large</Button>
            <Button disabled variant="contained">Disabled</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};