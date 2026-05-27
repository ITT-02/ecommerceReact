import { Avatar, Box, Card, CardContent, Typography } from "@mui/material";

const TeamMemberCard = ({ name, role, description }) => {
  return (
    <Card sx={{ maxWidth: 340, textAlign: "center", p: 2 }}>
      <CardContent>
        <Avatar
          sx={{
            bgcolor: "#1a4a3a",
            color: "#c9a84c",
            width: 72,
            height: 72,
            fontSize: "1.8rem",
            mx: "auto",
            mb: 2,
            border: "2px solid #c9a84c",
          }}
        >
          {name?.charAt(0).toUpperCase()}
        </Avatar>

        <Typography variant="h6" fontFamily="Georgia, serif" gutterBottom>
          {name}
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: "#c9a84c", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}
          display="block"
          gutterBottom
        >
          {role}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const teamMembers = [
  {
    name: "María Quispe",
    role: "Fundadora & CEO",
    description:
      "Gemmóloga certificada con 12 años en el sector joyero. Lidera la selección de productos y relaciones con proveedores internacionales.",
  },
  {
    name: "Carlos Quispe",
    role: "Co-Fundador & Operaciones",
    description:
      "Especialista en logística y cadena de suministro. Supervisa la bodega y asegura que cada pedido llegue perfecto y a tiempo.",
  },
  {
    name: "Lucía Mamani",
    role: "Jefa de Ventas Mayoristas",
    description:
      "Atiende personalmente a nuestros mayoristas top. Más de 5 años ayudando a revendedores a crecer su negocio de joyería.",
  },
];

export const TeamSection = () => {
  return (
    <Box sx={{ py: 8, px: 4, bgcolor: "#f5f0e8", textAlign: "center" }}>
      <Typography
        variant="caption"
        sx={{ color: "#c9a84c", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}
        display="block"
      >
        El Equipo
      </Typography>

      <Typography variant="h3" fontFamily="Georgia, serif" fontWeight={400} mb={6}>
        Las personas detrás de Aliqora
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 3 }}>
        {teamMembers.map((member, index) => (
          <TeamMemberCard
            key={index}
            name={member.name}
            role={member.role}
            description={member.description}
          />
        ))}
      </Box>
    </Box>
  );
};
