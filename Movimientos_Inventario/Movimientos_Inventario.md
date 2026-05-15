# **Integracion - Movimientos de Inventario**
Guia para implementar el modulo Movimientos de Inventario. Este modulo registra cambios de stock, lista el historial, permite ver detalle y anular movimientos. No se edita ni elimina un movimiento porque es historial de inventario.
## **1. Concepto del modulo**

|**Punto**|**Regla exacta**|
| :- | :- |
|Movimientos|Es el historial de todo cambio de stock: entrada, salida, ajuste, reserva y liberacion.|
|Inventario actual|Se actualiza internamente cuando se registra un movimiento. El usuario no modifica stock directo desde esta pantalla.|
|Editar / eliminar|No corresponde. Si hay error, se anula el movimiento o se registra un ajuste nuevo.|
|Anular|No borra el registro. Marca el movimiento original como anulado y crea un movimiento de anulacion para revertir el stock.|
|Referencia ID|No se muestra en formulario manual. Se envia siempre null. Se reserva para procesos automaticos futuros, como pedido\_id o compra\_id.|

## **2. Endpoints exactos usados**

|**Accion**|**Metodo**|**Endpoint relativo**|**Funcion service**|**Entrada**|**Salida esperada**|
| :- | :- | :- | :- | :- | :- |
|Listar movimientos|POST|/rpc/listar\_movimientos\_inventario\_paginado|getMovements()|Body JSON con paginacion, busqueda y filtros.|Objeto paginado: items, totalCount, pageNumber, pageSize, totalPages, hasPreviousPage, hasNextPage.|
|Registrar movimiento|POST|/rpc/registrar\_movimiento\_inventario|registerMovement(form)|Body JSON con p\_variante\_id, p\_almacen\_id, p\_tipo\_movimiento, p\_cantidad, p\_notas, p\_referencia\_tipo, p\_referencia\_id null.|UUID del movimiento creado.|
|Anular movimiento|POST|/rpc/anular\_movimiento\_inventario|cancelMovement({ movimientoId, motivoAnulacion })|Body JSON con p\_movimiento\_id y p\_motivo\_anulacion.|UUID del movimiento de anulacion creado.|
|Select buscable de variantes|POST|/rpc/listar\_variantes\_con\_atributos\_paginado|getVariantOptions(search)|Body JSON con p\_page\_number=1, p\_page\_size=20, p\_search, p\_producto\_id=null, p\_es\_activa=true.|Array items de variantes activas con producto\_nombre, nombre\_variante, atributos\_resumen.|
|Select buscable de almacenes|GET|/almacenes|getWarehouseOptions(search)|Params select=id,nombre; es\_activo=eq.true; order=nombre.asc; opcional nombre=ilike.\*texto\*.|Array de almacenes: id, nombre.|

## **3. Listar movimientos**

|**Dato**|**Valor exacto**|
| :- | :- |
|Funcion React|getMovements({ pageNumber, pageSize, search, tipoMovimiento })|
|Metodo|POST|
|Endpoint|/rpc/listar\_movimientos\_inventario\_paginado|
|Uso|Llenar tabla de historial de movimientos.|

### **3.1 Parametros de entrada para listar**

|**Parametro RPC**|**Tipo**|**Valor desde React**|**Descripcion**|**Valor permitido**|
| :- | :- | :- | :- | :- |
|p\_page\_number|integer|pageNumber|Pagina actual de la tabla.|1, 2, 3...|
|p\_page\_size|integer|pageSize|Cantidad de filas por pagina.|5, 10, 20...|
|p\_search|text|search|Busqueda general. Busca por producto, variante, almacen, tipo, referencia y notas.|Texto o ''.|
|p\_tipo\_movimiento|text/null|filters.tipoMovimiento || null|Filtra por tipo de movimiento.|entrada, salida, ajuste, reserva, liberacion o null.|
|p\_variante\_id|uuid/null|null en esta pantalla|Filtro opcional por variante. En la pantalla actual no se usa.|UUID o null.|
|p\_almacen\_id|uuid/null|null en esta pantalla|Filtro opcional por almacen. En la pantalla actual no se usa.|UUID o null.|

### **3.2 Body exacto de listado**
{\
`  `"p\_page\_number": 1,\
`  `"p\_page\_size": 10,\
`  `"p\_search": "caja",\
`  `"p\_tipo\_movimiento": null,\
`  `"p\_variante\_id": null,\
`  `"p\_almacen\_id": null\
}
### **3.3 Salida esperada del listado**

|**Campo recibido**|**Uso en frontend**|**Descripcion**|
| :- | :- | :- |
|id|Acciones Ver detalle / Anular|Identificador del movimiento.|
|variante\_id|Detalle|ID de la variante afectada.|
|almacen\_id|Detalle|ID del almacen afectado.|
|producto\_nombre|Columna Producto|Nombre del producto padre.|
|nombre\_variante|Columna Variante|Nombre de la variante.|
|almacen\_nombre|Columna Almacen|Nombre del almacen.|
|tipo\_movimiento|Columna Tipo|Tipo: entrada, salida, ajuste, reserva o liberacion.|
|cantidad|Columna Cantidad|Cantidad registrada en el movimiento. En ajuste es la diferencia absoluta guardada por backend.|
|referencia\_tipo|Columna Referencia|Motivo seleccionado en formulario: compra, stock\_inicial, venta\_manual, etc.|
|referencia\_id|Detalle tecnico|UUID interno para procesos automaticos. En registro manual llega null.|
|notas|Columna Notas|Observacion escrita por el usuario.|
|stock\_disponible\_antes|Detalle|Stock disponible antes del movimiento.|
|stock\_disponible\_despues|Detalle|Stock disponible despues del movimiento.|
|stock\_reservado\_antes|Detalle|Stock reservado antes del movimiento.|
|stock\_reservado\_despues|Detalle|Stock reservado despues del movimiento.|
|anulado|Columna Anulado|true si el movimiento original fue anulado.|
|anulado\_en|Detalle|Fecha/hora de anulacion.|
|anulado\_por|Detalle|Usuario que anulo.|
|motivo\_anulacion|Detalle|Motivo ingresado al anular.|
|movimiento\_anulacion\_id|Detalle|Movimiento creado para revertir el original.|
|created\_at|Columna Fecha|Fecha/hora de registro.|

## **4. Tabla recomendada**

|**Columna**|**field React**|**Tipo / formato**|**Descripcion**|
| :- | :- | :- | :- |
|Fecha|created\_at|Texto fecha|Fecha del movimiento.|
|Tipo|tipo\_movimiento|Texto o chip|Entrada, salida, ajuste, reserva o liberacion.|
|Producto|producto\_nombre|Texto|Producto padre.|
|Variante|nombre\_variante|Texto|Variante afectada.|
|Almacen|almacen\_nombre|Texto|Almacen afectado.|
|Cantidad|cantidad|Numero|Cantidad del movimiento.|
|Referencia|referencia\_tipo|Texto|Motivo/origen del movimiento.|
|Anulado|anulado|Boolean|Mostrar Si / No.|
|Notas|notas|Texto|Observacion.|

## **5. Registrar movimiento**

|**Dato**|**Valor exacto**|
| :- | :- |
|Funcion React|registerMovement(form)|
|Metodo|POST|
|Endpoint|/rpc/registrar\_movimiento\_inventario|
|Respuesta esperada|UUID del movimiento creado.|


### **5.1 Campos del formulario**

|**Campo formData**|**Componente**|**Mostrar en pantalla**|**Enviar al backend**|**Descripcion**|
| :- | :- | :- | :- | :- |
|tipo\_movimiento|TextField select|Entrada, Salida, Ajuste, Reserva, Liberacion|<p>p\_tipo\_movimiento</p><p></p>|Tipo de cambio que afectara el inventario.|
|variante|Autocomplete buscable|producto\_nombre - nombre\_variante - atributos\_resumen|No directo|Objeto seleccionado para mostrar.|
|variante\_id|Valor interno|No visible|p\_variante\_id|ID de la variante seleccionada.|
|almacen|Autocomplete buscable|nombre del almacen|No directo|Objeto seleccionado para mostrar.|
|almacen\_id|Valor interno|No visible|p\_almacen\_id|ID del almacen seleccionado.|
|cantidad|TextField number|Cantidad / Nuevo stock final|p\_cantidad|Mayor a 0. En ajuste representa el nuevo stock fisico final.|
|referencia\_tipo|TextField select|Stock inicial, Compra, Venta manual, Merma, Conteo fisico, Ajuste manual, Devolucion|p\_referencia\_tipo|Motivo u origen del movimiento.|
|notas|TextField multiline|Texto libre|p\_notas|Observacion adicional.|
|<p>referencia\_id</p><p></p>|No mostrar|No aplica|p\_referencia\_id = null|Reservado para procesos automaticos futuros.|

### **5.2 Tipos de movimiento y reglas**

|**Tipo**|**Cuando usar**|**Regla principal**|
| :- | :- | :- |
|entrada|Stock inicial, compra, devolucion o ingreso de mercaderia.|Suma cantidad al stock disponible.|
|salida|Venta manual, merma, retiro o producto danado.|Resta cantidad del stock disponible. Requiere stock suficiente.|
|ajuste|Correccion por conteo fisico.|p\_cantidad representa el nuevo stock final, no la diferencia.|
|reserva|Separar stock para pedido.|Aumenta cantidad reservada. Requiere disponible suficiente.|
|liberacion|Liberar stock reservado.|Disminuye cantidad reservada. Requiere reservado suficiente.|

### **5.3 Motivo / referencia - opciones fijas**

|**value enviado**|**label mostrado**|**Uso recomendado**|
| :- | :- | :- |
|stock\_inicial|Stock inicial|Primera carga de stock de una variante en un almacen.|
|compra|Compra|Ingreso por compra a proveedor.|
|venta\_manual|Venta manual|Salida manual por venta registrada fuera del flujo online.|
|merma|Merma|Salida por perdida, dano o descarte.|
|conteo\_fisico|Conteo fisico|Ajuste por conteo real de almacen.|
|ajuste\_manual|Ajuste manual|Correccion administrativa.|
|devolucion|Devolucion|Ingreso por devolucion de cliente o reingreso.|

### **5.4 Payload exacto de registro**
{\
`  `"p\_variante\_id": "uuid\_variante",\
`  `"p\_almacen\_id": "uuid\_almacen",\
`  `"p\_tipo\_movimiento": "entrada",\
`  `"p\_cantidad": 10,\
`  `"p\_notas": "Ingreso stock inicial",\
`  `"p\_referencia\_tipo": "stock\_inicial",\
`  `"p\_referencia\_id": null\
}
## **6. Selects / Autocomplete requeridos**

|**Select**|**Endpoint**|**Parametros**|**Mostrar**|**Guardar / enviar**|
| :- | :- | :- | :- | :- |
|Variante|POST /rpc/listar\_variantes\_con\_atributos\_paginado|p\_page\_number=1, p\_page\_size=20, p\_search=texto, p\_producto\_id=null, p\_es\_activa=true|producto\_nombre - nombre\_variante - atributos\_resumen|Guardar option.id en variante\_id y enviar como p\_variante\_id.|
|Almacen|GET /almacenes|select=id,nombre; es\_activo=eq.true; order=nombre.asc; opcional nombre=ilike.\*texto\*|nombre|Guardar option.id en almacen\_id y enviar como p\_almacen\_id.|

## **7. Acciones de tabla**

|**Accion**|**Debe mostrarse**|**Parametros**|**Regla**|
| :- | :- | :- | :- |
|Ver detalle|Siempre|row completo recibido del listado.|Puede abrir modal o mostrar detalle en consola durante prueba. Mostrar stock antes/despues, notas y anulacion.|
|Anular|Solo si anulado=false y referencia\_tipo != anulacion.|p\_movimiento\_id=row.id, p\_motivo\_anulacion=texto obligatorio.|No elimina. Marca original como anulado y crea movimiento de anulacion.|

### **7.1 Anular movimiento**

|**Dato**|**Valor exacto**|
| :- | :- |
|Funcion React|cancelMovement({ movimientoId, motivoAnulacion })|
|Metodo|POST|
|Endpoint|/rpc/anular\_movimiento\_inventario|
|Respuesta esperada|UUID del movimiento de anulacion creado.|

|**Parametro RPC**|**Tipo**|**Valor desde React**|**Descripcion**|
| :- | :- | :- | :- |
|p\_movimiento\_id|uuid|row.id|Movimiento original que se desea anular.|
|p\_motivo\_anulacion|text|cancelData.motivo\_anulacion|Motivo obligatorio. Ej: error de cantidad, registro duplicado, variante equivocada.|

{\
`  `"p\_movimiento\_id": "uuid\_movimiento\_original",\
`  `"p\_motivo\_anulacion": "Error de cantidad"\
}
### **7.2 Detalle recomendado para Ver detalle**

|**Dato**|**Campo**|
| :- | :- |
|Movimiento|id|
|Fecha|created\_at|
|Producto|producto\_nombre|
|Variante|nombre\_variante|
|Almacen|almacen\_nombre|
|Tipo|tipo\_movimiento|
|Cantidad|cantidad|
|Referencia / motivo|referencia\_tipo|
|Notas|notas|
|Stock disponible antes / despues|stock\_disponible\_antes / stock\_disponible\_despues|
|Stock reservado antes / despues|stock\_reservado\_antes / stock\_reservado\_despues|
|Anulado|anulado|
|Motivo anulacion|motivo\_anulacion|
|Movimiento anulacion|movimiento\_anulacion\_id|

## **8. Manejo de errores y TanStack Query**

|**Elemento**|**Implementacion esperada**|
| :- | :- |
|Query key listado|['inventory-movements', pageNumber, pageSize, search, tipoMovimiento]|
|Invalidacion al registrar|queryClient.invalidateQueries({ queryKey: ['inventory-movements'] })|
|Invalidacion al anular|queryClient.invalidateQueries({ queryKey: ['inventory-movements'] })|
|Errores del modal registrar|Capturar error.response?.data?.message y mostrarlo dentro del modal con ErrorMessage.|
|Errores del modal anular|Capturar error.response?.data?.message y mostrarlo dentro del modal con ErrorMessage.|

### **8.1 Mensajes que puede devolver backend**

|**Mensaje**|**Causa**|**Que debe hacer el frontend**|
| :- | :- | :- |
|Stock disponible insuficiente|Se intento salida/reserva mayor al stock disponible.|Mostrar mensaje en modal. No cerrar formulario.|
|Stock reservado insuficiente para liberar|Se intento liberar mas de lo reservado.|Mostrar mensaje en modal.|
|Debe seleccionar una variante|p\_variante\_id llego null.|Validar select de variante.|
|Debe seleccionar un almacen|p\_almacen\_id llego null.|Validar select de almacen.|
|La cantidad debe ser mayor a cero|Cantidad vacia, 0 o negativa.|Deshabilitar boton o mostrar error.|
|El movimiento ya fue anulado|Se intento anular dos veces.|Ocultar/deshabilitar accion Anular si anulado=true.|

