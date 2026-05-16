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
  confirmPassword: '',
  tipo_documento: '',
  documento_identidad: '',
};

export const registerFormToAuthPayload = (formData) => {
    const nombres = formData.nombres?.trim() || '';
    const apellidos = formData.apellidos?.trim() || '';
    const nombreCompleto = `${nombres} ${apellidos}`.trim();

    return {
      email: formData.email?.trim(),
      password: formData.password,
      data: {
        nombres,
        apellidos,
        nombre_completo: nombreCompleto,
        telefono: formData.telefono?.trim() || null,
        tipo_documento: formData.tipo_documento || null,
        documento_identidad: formData.documento_identidad?.trim() || null,
      },
    };
  };

export const validateRegisterForm = (formData) => {
  if (!formData.nombres?.trim()) return 'Ingresa tus nombres.';
  if (!formData.apellidos?.trim()) return 'Ingresa tus apellidos.';
  if (!formData.email?.trim()) return 'Ingresa tu correo electrónico.';
  if (!formData.password) return 'Ingresa una contraseña.';
  if (formData.password.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
  if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden.';
  return null;
};
