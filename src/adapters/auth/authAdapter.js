// Adapta respuestas y formularios de autenticación entre React y la API externa.

export const authResponseToSession = (data) => {
  const expiresAt = data.expires_at || Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    tokenType: data.token_type || 'bearer',
    user: data.user || null,
  };
};

export const initialRegisterFormData = {
  nombres: '',
  apellidos: '',
  telefono: '',
  email: '',
  password: '',
  confirmPassword: ''
};

export const registerFormToAuthPayload = (formData) => ({
  email: formData.email.trim().toLowerCase(),
  password: formData.password,
  data: {
    nombres: formData.nombres.trim(),
    apellidos: formData.apellidos.trim(),
    telefono: formData.telefono.trim() || null,
  },
});

export const validateRegisterForm = (formData) => {
  if (!formData.nombres.trim()) return 'Ingresa tus nombres.';
  if (!formData.apellidos.trim()) return 'Ingresa tus apellidos.';
  if (!formData.email.trim()) return 'Ingresa tu correo electrónico.';
  if (formData.password.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
  if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden.';
  return null;
};
