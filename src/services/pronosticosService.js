// services/pronosticosService.js
// Pronóstico oficial a 6 meses (RN04).

import { apiRequest } from '../config/api';

export const listarPronosticos = (loteId) =>
  apiRequest(loteId ? `/pronosticos?lote_id=${loteId}` : '/pronosticos');

export const obtenerPronostico = (id) => apiRequest(`/pronosticos/${id}`);

export const calcularPronostico = (payload) =>
  apiRequest('/pronosticos', { method: 'POST', body: payload });
