/**
 * Contenido editable de páginas públicas.
 *
 * Mantener textos, pasos, beneficios, valores, equipo y preguntas frecuentes
 * en este archivo
 */

export const wholesalePageContent = {
  hero: {
    eyebrow: 'Programa mayorista',
    title: 'Únete a nuestra red de distribuidores',
    description:
      'Accede a precios por volumen, stock para campañas, asesoría personalizada y soporte logístico para que tu negocio venda empaques con una presentación profesional.',
    primaryAction: { label: 'Solicitar cuenta mayorista', to: '/contacto?motivo=mayorista' },
    secondaryAction: { label: 'Ver catálogo', to: '/catalogo' },
    metrics: [
      { value: '+1,200', label: 'clientes atendidos' },
      { value: '24 h', label: 'respuesta comercial' },
      { value: '+40%', label: 'beneficio por volumen' },
    ],
  },
  benefits: [
    {
      iconKey: 'savings',
      title: 'Precios mayoristas',
      description:
        'Condiciones especiales para compras por volumen, campañas recurrentes y abastecimiento de negocios.',
    },
    {
      iconKey: 'photo',
      title: 'Material para vender',
      description:
        'Apoyo con información del producto, medidas, usos recomendados e imágenes para publicaciones comerciales.',
    },
    {
      iconKey: 'support',
      title: 'Asesor personal',
      description:
        'Acompañamiento por WhatsApp para elegir cajas, bolsas, medidas, acabados y cantidades adecuadas.',
    },
  ],
  steps: [
    {
      number: 1,
      title: 'Completa tu solicitud',
      description:
        'Envíanos tus datos de contacto, tipo de negocio, ciudad y líneas de empaque que necesitas.',
    },
    {
      number: 2,
      title: 'Validamos tu perfil',
      description:
        'Nuestro equipo revisa la información y te contacta para entender tus volúmenes y necesidades.',
    },
    {
      number: 3,
      title: 'Compra con condiciones especiales',
      description:
        'Accede a precios por volumen, recomendaciones de stock y seguimiento de tus pedidos.',
    },
  ],
  cta: {
    eyebrow: 'Atención comercial',
    title: '¿Tienes un pedido recurrente o necesitas abastecimiento mensual?',
    description:
      'Cuéntanos qué productos necesitas y te ayudamos a armar una propuesta mayorista ordenada.',
    action: { label: 'Hablar con ventas', to: '/contacto?motivo=mayorista' },
  },
};

export const storyPageContent = {
  hero: {
    eyebrow: 'Nuestra historia',
    title: 'Empaques con propósito para marcas que cuidan cada entrega',
    description:
      'Aliqora Empaques nace para ayudar a negocios, tiendas online y emprendedores a presentar sus productos con orden, protección y una experiencia visual memorable.',
    primaryAction: { label: 'Conoce el programa mayorista', to: '/mayoristas' },
    secondaryAction: { label: 'Contáctanos', to: '/contacto' },
  },
  intro: {
    eyebrow: 'Quiénes somos',
    title: 'Diseñamos soluciones de empaque para vender, proteger y entregar mejor',
    paragraphs: [
      'Trabajamos con cajas, bolsas y empaques pensados para comercio electrónico, regalos, campañas corporativas y negocios que necesitan una presentación consistente.',
      'Nuestro enfoque combina atención personalizada, catálogo ordenado, pagos claros y seguimiento del pedido hasta la entrega final.',
    ],
    stats: [
      { value: '+8', label: 'años de experiencia comercial' },
      { value: '+500', label: 'productos y variantes' },
      { value: '+1,200', label: 'clientes atendidos' },
    ],
  },
  timeline: [
    {
      year: '2017',
      title: 'El comienzo',
      description:
        'Iniciamos atendiendo pedidos pequeños para negocios locales que necesitaban empaques resistentes y mejor presentados.',
    },
    {
      year: '2019',
      title: 'Expansión de catálogo',
      description:
        'Ampliamos líneas de cajas, bolsas y empaques por medida, material y tipo de uso comercial.',
    },
    {
      year: '2021',
      title: 'Crecimiento digital',
      description:
        'Organizamos el catálogo para que los clientes puedan revisar productos, disponibilidad, pedidos y cotizaciones desde la tienda.',
    },
    {
      year: '2024',
      title: 'Seguimiento logístico',
      description:
        'Integramos estados de pedido, pagos y envío con transportistas externos para informar al cliente cada avance.',
    },
    {
      year: '2026',
      title: 'Aliqora Empaques',
      description:
        'Consolidamos una experiencia de compra más moderna, clara y preparada para clientes finales y mayoristas.',
    },
  ],
  values: [
    {
      iconKey: 'target',
      title: 'Transparencia',
      description: 'Información clara sobre precios, cantidades, estados, pagos y tiempos de preparación.',
    },
    {
      iconKey: 'quality',
      title: 'Calidad',
      description: 'Productos seleccionados para proteger mejor y elevar la presentación de cada marca.',
    },
    {
      iconKey: 'community',
      title: 'Cercanía',
      description: 'Acompañamos a negocios que buscan vender mejor, ordenar su abastecimiento y crecer.',
    },
    {
      iconKey: 'innovation',
      title: 'Innovación',
      description: 'Mejoramos procesos, catálogo, cotizaciones y seguimiento para una compra más simple.',
    },
  ],
  team: [
    {
      name: 'María Quispe',
      role: 'Dirección comercial',
      description:
        'Lidera la selección de líneas de empaque, campañas comerciales y atención a clientes estratégicos.',
    },
    {
      name: 'Carlos Quispe',
      role: 'Operaciones y logística',
      description:
        'Supervisa preparación, coordinación con transportistas y seguimiento de pedidos hasta la entrega.',
    },
    {
      name: 'Lucía Mamani',
      role: 'Atención mayorista',
      description:
        'Acompaña a negocios que compran por volumen y necesitan recomendaciones de producto y abastecimiento.',
    },
  ],
};

export const contactPageContent = {
  hero: {
    eyebrow: 'Contacto',
    title: 'Estamos para ayudarte',
    description:
      'Nuestro equipo atiende consultas sobre catálogo, cotizaciones, pedidos mayoristas, pagos y seguimiento de envíos.',
  },
  channels: [
    {
      iconKey: 'whatsapp',
      label: 'WhatsApp ventas',
      value: '+51 984 000 000',
      helper: 'Respuesta prioritaria para consultas comerciales.',
      href: 'https://wa.me/51984000000',
    },
    {
      iconKey: 'email',
      label: 'Email ventas',
      value: 'ventas@aliqora.com',
      helper: 'Para cotizaciones, propuestas y pedidos corporativos.',
      href: 'mailto:ventas@aliqora.com',
    },
    {
      iconKey: 'phone',
      label: 'Teléfono',
      value: '+51 984 000 000',
      helper: 'Atención de lunes a sábado de 9:00 a 18:00.',
      href: 'tel:+51984000000',
    },
    {
      iconKey: 'location',
      label: 'Oficina / despacho',
      value: 'Perú',
      helper: 'Coordinación de entregas y atención con cita previa.',
    },
  ],
  reasons: [
    'Consulta general',
    'Registro como mayorista',
    'Cotización personalizada',
    'Seguimiento de pedido',
    'Pagos y comprobantes',
  ],
  faqs: [
    {
      question: '¿Cuál es el pedido mínimo?',
      answer:
        'Depende del producto, material y presentación. Para compras mayoristas podemos armar una propuesta por volumen.',
    },
    {
      question: '¿Puedo solicitar una cotización personalizada?',
      answer:
        'Sí. Puedes indicar medidas, cantidades, tipo de empaque, logo o necesidad especial para preparar una cotización.',
    },
    {
      question: '¿Cómo se realiza el seguimiento del envío?',
      answer:
        'Cuando el pedido pasa a transporte, se registra la empresa transportista, número de seguimiento y estado de entrega.',
    },
    {
      question: '¿Atienden compras para empresas?',
      answer:
        'Sí. Atendemos compras recurrentes, campañas corporativas y abastecimiento por volumen.',
    },
  ],
};
