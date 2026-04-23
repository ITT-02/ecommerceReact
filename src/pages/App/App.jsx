import { Box, Container, Typography, Grid } from '@mui/material';
import { AppLayout } from './AppLayout';
import { ButtonsSection } from './sections/ButtonsSection';
import { InputsSection } from './sections/InputsSection';
import { CardsSection } from './sections/CardsSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { NavigationSection } from './sections/NavigationSection';
import { DataDisplaySection } from './sections/DataDisplaySection';
import { SelectionSection } from './sections/SelectionSection';

export const App = () => {
  return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            Catálogo de componentes MUI
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Laboratorio visual para aprender Material UI y mostrar cómo funciona el theme global.
          </Typography>
        </Box>

        <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
            <ButtonsSection />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
            <InputsSection />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
            <CardsSection />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
            <FeedbackSection />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
            <NavigationSection />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
            <SelectionSection />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
            <DataDisplaySection />
        </Grid>
        </Grid>
      </Container>
    </AppLayout>
  );
};