import {
  Card,
  CardContent,
  Typography,
  Stack,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Switch,
  Slider,
  Rating,
} from '@mui/material';
import { useState } from 'react';

export const SelectionSection = () => {
  const [rating, setRating] = useState(4);

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Selección
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Checkbox, radio, switch, slider y rating.
        </Typography>

        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  slotProps={{ input: { 'aria-label': 'checkbox activo' } }}
                />
              }
              label="Activo"
            />

            <FormControlLabel
              control={
                <Checkbox
                  slotProps={{ input: { 'aria-label': 'checkbox inactivo' } }}
                />
              }
              label="Inactivo"
            />
          </Stack>

          <RadioGroup row defaultValue="admin" aria-label="roles">
            <FormControlLabel value="admin" control={<Radio />} label="Admin" />
            <FormControlLabel value="editor" control={<Radio />} label="Editor" />
            <FormControlLabel value="viewer" control={<Radio />} label="Viewer" />
          </RadioGroup>

          <FormControlLabel
            control={
              <Switch
                defaultChecked
                slotProps={{ input: { 'aria-label': 'modo activo' } }}
              />
            }
            label="Modo activo"
          />

          <Slider
            defaultValue={40}
            color="primary"
            aria-label="nivel"
          />

          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            slotProps={{ input: { 'aria-label': 'rating' } }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};