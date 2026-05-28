/**
 * Sección de equipo para tienda pública.
 * Fondo salvia suave para refrescar después de bloques comerciales.
 */

import { Avatar, Box, Card, CardContent, Container, Typography } from '@mui/material';

import { StoreSectionHeader } from './StoreSectionHeader';

const TeamMemberCard = ({ name, role, description }) => (
  <Card
    sx={(theme) => {
      const m = theme.palette.custom.semantic.storeMarketing;

      return {
        height: '100%',
        borderRadius: theme.palette.custom.radius.xs,
        backgroundImage: 'none',
        bgcolor: m.lightCardBg,
        border: `1px solid ${m.freshBorder}`,
        boxShadow: theme.palette.custom.shadows.sm,
      };
    }}
  >
    <CardContent sx={{ p: 3, textAlign: 'center', '&:last-child': { pb: 3 } }}>
      <Avatar
        sx={(theme) => {
          const m = theme.palette.custom.semantic.storeMarketing;

          return {
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
            borderRadius: theme.palette.custom.radius.xs,
            bgcolor: m.darkBgAlt,
            color: m.darkAccent,
            border: `1px solid ${m.darkAccent}`,
            fontFamily: theme.typography.h4.fontFamily,
            fontSize: '1.5rem',
            boxShadow: theme.palette.custom.shadows.sm,
          };
        }}
      >
        {name?.charAt(0).toUpperCase()}
      </Avatar>

      <Typography variant="h5" component="h3" sx={(theme) => ({ mb: 0.75, color: theme.palette.custom.semantic.storeMarketing.lightText })}>
        {name}
      </Typography>

      <Typography
        variant="overline"
        component="p"
        sx={(theme) => ({ mb: 1.5, display: 'block', color: theme.palette.custom.semantic.storeMarketing.mauveAccent, letterSpacing: '0.16em' })}
      >
        {role}
      </Typography>

      <Typography variant="body2" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightMuted, lineHeight: 1.7 })}>
        {description}
      </Typography>
    </CardContent>
  </Card>
);

export const TeamSection = ({ members = [] }) => {
  if (!members.length) return null;

  return (
    <Box component="section" sx={(theme) => ({ bgcolor: theme.palette.custom.semantic.storeMarketing.freshBgAlt, py: { xs: 7, md: 9 } })}>
      <Container maxWidth="lg">
        <StoreSectionHeader eyebrow="El equipo" title="Las personas detrás de Aliqora" accent="sage" />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 3,
          }}
        >
          {members.map((member) => (
            <TeamMemberCard
              key={member.name}
              name={member.name}
              role={member.role}
              description={member.description}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};
