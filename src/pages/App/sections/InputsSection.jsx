import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';

import SearchIcon from '@mui/icons-material/Search';

export const InputsSection = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Inputs
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          TextField, select, password y textarea.
        </Typography>

        <Stack spacing={2}>
          <TextField label="Nombre" placeholder="Ingrese su nombre" />

          <TextField
            label="Buscar"
            placeholder="Buscar producto..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField label="Correo" type="email" />

          <TextField label="Contraseña" type="password" />

          <TextField select label="Categoría" defaultValue="joyas">
            <MenuItem value="joyas">Joyas</MenuItem>
            <MenuItem value="anillos">Anillos</MenuItem>
            <MenuItem value="collares">Collares</MenuItem>
          </TextField>

          <TextField
            label="Descripción"
            multiline
            rows={4}
            placeholder="Escriba una descripción"
          />
        </Stack>
      </CardContent>
    </Card>
  );
};