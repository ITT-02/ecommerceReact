// Adapta respuestas y formularios de autenticación entre React y la API externa.

import {
  trimText,
  validateEmailField,
  validatePasswordField,
  validatePhoneField,
  validateRequiredTextField,
} from '../../utils/validators';

export const authResponseToSession = (data) => {
  const expiresAt =
    data.expires_at || Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    tokenType: data.token_type || 'bearer',
    user: data.user || null,
  };
};

export const initialLoginFormData = {
  email: '',
  password: '',
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

export const normalizeLoginFormData = (formData) => ({
  email: trimText(formData.email).toLowerCase(),
  password: formData.password || '',
});

export const normalizeRegisterFormData = (formData) => ({
  ...initialRegisterFormData,
  ...formData,
  nombres: trimText(formData.nombres),
  apellidos: trimText(formData.apellidos),
  telefono: trimText(formData.telefono),
  email: trimText(formData.email).toLowerCase(),
  tipo_documento: formData.tipo_documento || '',
  documento_identidad: trimText(formData.documento_identidad),
});

export const loginFormToAuthPayload = (formData) => {
  const normalized = normalizeLoginFormData(formData);

  return {
    email: normalized.email,
    password: normalized.password,
  };
};

export const registerFormToAuthPayload = (formData) => {
  const normalized = normalizeRegisterFormData(formData);

  const nombreCompleto = `${normalized.nombres} ${normalized.apellidos}`.trim();

  return {
    email: normalized.email,
    password: normalized.password,
    data: {
      nombres: normalized.nombres,
      apellidos: normalized.apellidos,
      nombre_completo: nombreCompleto,
      telefono: normalized.telefono || null,
      tipo_documento: normalized.tipo_documento || null,
      documento_identidad: normalized.documento_identidad || null,
    },
  };
};

export const validateLoginForm = (formData) => {
  const errors = {};

  const emailError = validateEmailField(formData.email, 'correo electrónico');
  if (emailError) errors.email = emailError;

  const passwordError = validatePasswordField(formData.password, 'contraseña', {
    minLength: 1,
  });
  if (passwordError) errors.password = passwordError;

  return errors;
};

export const validateRegisterForm = (formData) => {
  const errors = {};

  const nombresError = validateRequiredTextField(formData.nombres, 'tus nombres', {
    minLength: 2,
    rejectOnlyNumbers: true,
  });
  if (nombresError) errors.nombres = nombresError;

  const apellidosError = validateRequiredTextField(formData.apellidos, 'tus apellidos', {
    minLength: 2,
    rejectOnlyNumbers: true,
  });
  if (apellidosError) errors.apellidos = apellidosError;

  const telefonoError = validatePhoneField(formData.telefono, 'teléfono', {
    minDigits: 9,
    maxDigits: 15,
    optional: true,
  });
  if (telefonoError) errors.telefono = telefonoError;

  const emailError = validateEmailField(formData.email, 'correo electrónico');
  if (emailError) errors.email = emailError;

  const passwordError = validatePasswordField(formData.password, 'contraseña', {
    minLength: 8,
  });
  if (passwordError) errors.password = passwordError;

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  return errors;
};