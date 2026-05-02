import { useState, useCallback } from 'react';
import { atributoService } from "../../services/catalog/attributeService";


export const useAtributos = () => {
  const [atributos, setAtributos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAtributos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await atributoService.getAtributos();
      setAtributos(data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar los atributos');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (datos) => {
    const nuevoAtributo = await atributoService.createAtributo(datos);
    setAtributos((prev) => [...prev, nuevoAtributo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
  };

  const update = async (id, datos) => {
    const atributoActualizado = await atributoService.updateAtributo(id, datos);
    setAtributos((prev) =>
      prev.map((attr) => (attr.id === id ? atributoActualizado : attr)).sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
  };

  const remove = async (id) => {
    await atributoService.deleteAtributo(id);
    setAtributos((prev) => prev.filter((attr) => attr.id !== id));
  };

  return { atributos, loading, error, fetchAtributos, create, update, remove };
};