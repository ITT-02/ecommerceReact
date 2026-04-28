// Adapta el carrito para mostrar resúmenes en pantalla.

export const calculateCartTotal = (items = []) => {
  return items.reduce((total, item) => {
    return total + Number(item.precio_unitario || 0) * Number(item.cantidad || 0);
  }, 0);
};
