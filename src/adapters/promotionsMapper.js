export const initialPromotionFormData = {
  nombre: '',
  descripcion: '',
  tipo_promocion: 'descuento_directo', // por defecto
  tipo_descuento: 'porcentaje',        // por defecto
  valor_descuento: '',
  codigo: '',
  fecha_inicio: '',
  fecha_fin: '',
  prioridad: 0,
  monto_minimo_pedido: 0,
  uso_maximo: '',
  uso_por_cliente: '',
  es_activa: true,
  aplica_a: 'todos',
};

// Convierte lo que viene de la base de datos al formato plano del formulario
export const mapPromotionToFormData = (promotion) => {
  if (!promotion) return initialPromotionFormData;
  return {
    nombre: promotion.nombre || '',
    descripcion: promotion.descripcion || '',
    tipo_promocion: promotion.tipo_promocion || 'descuento_directo',
    tipo_descuento: promotion.tipo_descuento || 'porcentaje',
    valor_descuento: promotion.valor_descuento ?? '',
    codigo: promotion.codigo || '',
    fecha_inicio: promotion.fecha_inicio ? promotion.fecha_inicio.substring(0, 16) : '', // Corta a formato datetime-local
    fecha_fin: promotion.fecha_fin ? promotion.fecha_fin.substring(0, 16) : '',
    prioridad: promotion.prioridad ?? 0,
    monto_minimo_pedido: promotion.monto_minimo_pedido ?? 0,
    uso_maximo: promotion.uso_maximo ?? '',
    uso_por_cliente: promotion.uso_por_cliente ?? '',
    es_activa: promotion.es_activa ?? true,
    aplica_a: promotion.aplica_a || 'todos',
  };
};

// Convierte los estados del formulario al payload estructurado de la base de datos
export const mapFormDataToPayload = (formData, selectedApplications = []) => {
  const esEnvioGratis = formData.tipo_promocion === 'envio_gratis' || formData.tipo_descuento === 'envio_gratis';
  
  const p_promocion = {
    nombre: formData.nombre?.trim() || null,
    descripcion: formData.descripcion?.trim() || null,
    tipo_promocion: formData.tipo_promocion,
    tipo_descuento: formData.tipo_descuento,
    valor_descuento: esEnvioGratis ? 0 : Number(formData.valor_descuento),
    codigo: formData.tipo_promocion === 'cupon' ? (formData.codigo?.trim() || null) : null,
    fecha_inicio: formData.fecha_inicio ? new Date(formData.fecha_inicio).toISOString() : null,
    fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : null,
    prioridad: Number(formData.prioridad) || 0,
    monto_minimo_pedido: Number(formData.monto_minimo_pedido) || 0,
    uso_maximo: formData.uso_maximo === '' ? null : Number(formData.uso_maximo),
    uso_por_cliente: formData.uso_por_cliente === '' ? null : Number(formData.uso_por_cliente),
    es_activa: Boolean(formData.es_activa),
    aplica_a: formData.aplica_a,
  };

  // Regla estricta de tu documentación: si aplica_a es todos, p_aplicaciones va vacío []
  const p_aplicaciones = formData.aplica_a === 'todos' ? [] : selectedApplications;

  return {
    p_promocion,
    p_aplicaciones,
  };
};