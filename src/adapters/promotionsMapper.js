export const initialPromotionFormData = {
  nombre: '',
  descripcion: '',
  tipo_promocion: 'descuento_directo',
  tipo_descuento: 'porcentaje',
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

const toDatetimeLocalValue = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

/**
 * Convierte la respuesta del backend al estado plano del formulario.
 */
export const mapPromotionToFormData = (promotion) => {
  if (!promotion) return { ...initialPromotionFormData };

  return {
    nombre: promotion.nombre || '',
    descripcion: promotion.descripcion || '',
    tipo_promocion: promotion.tipo_promocion || 'descuento_directo',
    tipo_descuento: promotion.tipo_descuento || 'porcentaje',
    valor_descuento: promotion.valor_descuento ?? '',
    codigo: promotion.codigo || '',
    fecha_inicio: toDatetimeLocalValue(promotion.fecha_inicio),
    fecha_fin: toDatetimeLocalValue(promotion.fecha_fin),
    prioridad: promotion.prioridad ?? 0,
    monto_minimo_pedido: promotion.monto_minimo_pedido ?? 0,
    uso_maximo: promotion.uso_maximo ?? '',
    uso_por_cliente: promotion.uso_por_cliente ?? '',
    es_activa: promotion.es_activa ?? true,
    aplica_a: promotion.aplica_a || 'todos',
  };
};

/**
 * Convierte el formulario al contrato esperado por las funciones remotas
 * de creación y actualización de promociones.
 */
export const mapFormDataToPayload = (formData, selectedApplications = []) => {
  const isFreeShipping = formData.tipo_promocion === 'envio_gratis';
  const isCoupon = formData.tipo_promocion === 'cupon';

  const p_promocion = {
    nombre: formData.nombre?.trim() || null,
    descripcion: formData.descripcion?.trim() || null,
    tipo_promocion: formData.tipo_promocion,
    tipo_descuento: isFreeShipping ? 'envio_gratis' : formData.tipo_descuento,
    valor_descuento: isFreeShipping ? 0 : Number(formData.valor_descuento || 0),
    codigo: isCoupon ? formData.codigo?.trim()?.toUpperCase() || null : null,
    fecha_inicio: formData.fecha_inicio ? new Date(formData.fecha_inicio).toISOString() : null,
    fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : null,
    prioridad: Number(formData.prioridad || 0),
    monto_minimo_pedido: Number(formData.monto_minimo_pedido || 0),
    uso_maximo: toNullableNumber(formData.uso_maximo),
    uso_por_cliente: toNullableNumber(formData.uso_por_cliente),
    es_activa: Boolean(formData.es_activa),
    aplica_a: formData.aplica_a || 'todos',
  };

  const p_aplicaciones =
    p_promocion.aplica_a === 'todos'
      ? []
      : selectedApplications.map((item) => ({
          target_tipo: p_promocion.aplica_a,
          target_id: item.target_id || item.id,
        }));

  return {
    p_promocion,
    p_aplicaciones,
  };
};