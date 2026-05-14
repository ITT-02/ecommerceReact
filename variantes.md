# Variantes con Atributos Dinámicos

Este documento detalla el funcionamiento del CRUD de variantes del panel administrativo. Se deben respetar los nombres de endpoints, parámetros de entrada, campos de salida y valores enviados.

---

## 1. Concepto funcional

Una variante pertenece a un producto y puede tener atributos dinámicos seleccionados desde el CRUD de atributos/valores.

| Entidad | Qué representa | Ejemplo | Dónde se guarda |
| :--- | :--- | :--- | :--- |
| Producto | Producto base visible en la tienda. | Caja e-commerce | productos |
| Variante | Presentación vendible del producto con precio, medidas y stock mínimo. | Caja e-commerce 30x30x10 Kraft | producto_variantes |
| Atributo | Característica configurable. | Material, Color, Gramaje | atributos_catalogo |
| Valor atributo | Opción de un atributo. | Corrugado, Blanco, 300g | atributo_valores |
| Atributos de variante | Relación entre una variante y los valores elegidos. | Material: Corrugado · Gramaje: 300g | producto_variante_atributos |

---

## 2. Endpoints exactos que se usarán

| Acción | Método | Endpoint relativo | Función service | Qué se envía |
| :--- | :--- | :--- | :--- | :--- |
| Listar variantes | POST | /rpc/listar_variantes_con_atributos_paginado | getVariants() | Body con paginación y filtros. |
| Obtener por id | POST | /rpc/obtener_variante_con_atributos | getVariantById(id) | Body: { p_variante_id: id } |
| Crear variante | POST | /rpc/crear_variante_con_atributos | createVariant(variant) | Body: { p_variante, p_atributos } |
| Editar variante | POST | /rpc/actualizar_variante_con_atributos | updateVariant(id, variant) | Body: { p_variante_id, p_variante, p_atributos } |
| Opciones productos | GET | /productos | getProductOptions(search) | Query params para búsqueda. |
| Opciones atributos | POST | /rpc/obtener_atributos_para_variantes | getVariantAttributeOptions() | Ninguno. |
| Desactivar | PATCH | /producto_variantes | deactivateVariant(id) | Body: { es_activa: false } |
| Eliminar | DELETE | /producto_variantes | deleteVariant(variant) | Query param: id=eq.UUID |

---

## 3. Listado y Paginación (RPC)

Para llenar la tabla administrativa con la información de la variante.

**Endpoint:** `/rpc/listar_variantes_con_atributos_paginado`

### Parámetros de Entrada (Body JSON)
* **p_page_number**: Página actual (1, 2, 3...).
* **p_page_size**: Cantidad de registros por página.
* **p_search**: Búsqueda por producto, código, nombre, medida o atributos.
* **p_producto_id**: UUID de un producto específico o null.
* **p_es_activa**: true, false o null para filtrar por estado.

### Columnas de la Tabla UI
| Columna | field React | Formato |
| :--- | :--- | :--- |
| Producto | producto_nombre | Texto |
| Variante | nombre_variante | Texto |
| Atributos | atributos_resumen | Texto o Chips (Ej: Material: Corrugado) |
| Medida | medida | Texto (Ej: 30x30x10 cm) |
| Precio | precio | Moneda |
| Stock mín. | stock_minimo | Número |
| Estado | es_activa | Switch / Badge |

---

## 4. Select de Productos (Padre)

Para elegir el producto al que pertenece la variante.
* **Endpoint:** `/productos`
* **Parámetros:** `select=id,nombre`, `es_activo=eq.true`, `order=nombre.asc`.
* **Búsqueda:** Si el usuario escribe, añadir `nombre=ilike.*texto*`.

---

## 5. Select Dinámico de Atributos

Permite agregar filas de atributos a la variante.
* **Endpoint:** `/rpc/obtener_atributos_para_variantes`
* **Funcionamiento:** Se elige un atributo (Ej: Color) y luego se habilita el segundo select para elegir su valor (Ej: Kraft). Se debe guardar el `atributo_valor_id` para el envío.

---

## 6. Estructura de Envío (Creación)

**Endpoint:** `/rpc/crear_variante_con_atributos`

```json
{
  "p_variante": {
    "producto_id": "uuid_producto",
    "codigo_referencia": "REF-001",
    "nombre_variante": "30x30x10 Kraft",
    "medida_largo": 30,
    "medida_ancho": 30,
    "medida_alto": 10,
    "unidad_medida": "cm",
    "etiqueta_medida": "30x30x10 cm",
    "peso_gramos": 250,
    "precio": 5.50,
    "precio_comparacion": null,
    "costo": 3.20,
    "stock_minimo": 10,
    "es_predeterminada": false,
    "es_activa": true
  },
  "p_atributos": [
    { "atributo_valor_id": "uuid_valor_corrugado" },
    { "atributo_valor_id": "uuid_valor_300g" }
  ]
}