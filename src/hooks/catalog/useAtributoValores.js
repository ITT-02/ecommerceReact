import { useState, useCallback } from 'react';
import { atributoService } from "../../services/catalog/attributeService";

export const useAtributoValores = (atributoId) => {
  const [valores, setValores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchValores = useCallback(async () => {
    if (!atributoId) return;
    setLoading(true);
    try {
      const data = await atributoService.getValoresByAtributoId(atributoId);
      setValores(data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar los valores');
    } finally {
      setLoading(false);
    }
  }, [atributoId]);

  const create = async (datos) => {
    const payload = { ...datos, atributo_id: atributoId };
    await atributoService.createValor(payload);
    await fetchValores(); // <-- Fuerza a recargar desde la BD (A prueba de balas)
  };

  const update = async (id, datos) => {
    await atributoService.updateValor(id, datos);
    await fetchValores(); // <-- Fuerza a recargar desde la BD 
  };

  const remove = async (id) => {
    await atributoService.deleteValor(id);
    await fetchValores(); // <-- Fuerza a recargar desde la BD 
  };

  return { valores, loading, error, fetchValores, create, update, remove };
};