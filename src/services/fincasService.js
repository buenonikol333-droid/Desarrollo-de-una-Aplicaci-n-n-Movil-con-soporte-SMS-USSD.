// services/fincasService.js
// Mis fincas y lotes (RN01 privacidad, RN02 nomenclatura flexible) + ciclos de cosecha (RN03).

import { apiRequest } from '../config/api';

export const listarFincas = () => apiRequest('/fincas');
export const crearFinca = (payload) => apiRequest('/fincas', { method: 'POST', body: payload });
export const obtenerFinca = (id) => apiRequest(`/fincas/${id}`);
export const editarFinca = (id, payload) => apiRequest(`/fincas/${id}`, { method: 'PUT', body: payload });
export const eliminarFinca = (id) => apiRequest(`/fincas/${id}`, { method: 'DELETE' });

export const listarLotes = (fincaId) => apiRequest(`/fincas/${fincaId}/lotes`);
export const crearLote = (fincaId, payload) => apiRequest(`/fincas/${fincaId}/lotes`, { method: 'POST', body: payload });
export const obtenerLote = (loteId) => apiRequest(`/lotes/${loteId}`);
export const editarLote = (loteId, payload) => apiRequest(`/lotes/${loteId}`, { method: 'PUT', body: payload });
export const eliminarLote = (loteId) => apiRequest(`/lotes/${loteId}`, { method: 'DELETE' });

export async function listarTodosLosLotes() {
  const fincas = await listarFincas();
  const porFinca = await Promise.all(
    fincas.map(async (f) => {
      const lotes = await listarLotes(f.id);
      return lotes.map((l) => ({ ...l, finca_nombre: f.nombre }));
    })
  );
  return porFinca.flat();
}

export const listarCiclos = (loteId) => apiRequest(`/lotes/${loteId}/ciclos`);
export const crearCiclo = (loteId, payload) => apiRequest(`/lotes/${loteId}/ciclos`, { method: 'POST', body: payload });
export const editarCiclo = (cicloId, payload) => apiRequest(`/ciclos/${cicloId}`, { method: 'PUT', body: payload });
export const registrarCosecha = (cicloId) => apiRequest(`/ciclos/${cicloId}/registrar-cosecha`, { method: 'POST' });
