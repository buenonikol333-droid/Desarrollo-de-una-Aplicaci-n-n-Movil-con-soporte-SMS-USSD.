// services/logisticsService.js
// Estado de logística (vehículos disponibles, vías, despachos) con caché offline.
// Nota: la ubicación exacta de la finca solo se revela al transportador asignado
// una vez que acepta la solicitud (RN06 - geolocalización protegida).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../config/api';

const CACHE_KEY = '@cache_estado_logistica';

export async function getEstadoLogistica() {
  try {
    const data = await apiRequest('/logistica/estado');
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (_err) {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached
      ? JSON.parse(cached)
      : { vehiculosDisponibles: 0, estadoVias: 'Sin datos', ultimoDespacho: '—' };
  }
}

export async function crearSolicitudTransporte(payload) {
  // payload: { finca_id, lote_id, comprador_id, cantidad_estimada, fecha_servicio, ... }
  return apiRequest('/transporte/solicitudes', { method: 'POST', body: payload });
}

export const listarSolicitudes = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/transporte/solicitudes${qs ? `?${qs}` : ''}`);
};
export const obtenerSolicitud = (id) => apiRequest(`/transporte/solicitudes/${id}`);
export const aceptarSolicitud = (id, payload) =>
  apiRequest(`/transporte/solicitudes/${id}/aceptar`, { method: 'PATCH', body: payload });
export const rechazarSolicitud = (id, motivo) =>
  apiRequest(`/transporte/solicitudes/${id}/rechazar`, { method: 'PATCH', body: { motivo } });
export const actualizarEstadoSolicitud = (id, estado) =>
  apiRequest(`/transporte/solicitudes/${id}/estado`, { method: 'PATCH', body: { estado } });
export const historialTransporte = () => apiRequest('/transporte/historial');

export const perfilTransportador = () => apiRequest('/transportador/perfil');
export const actualizarPerfilTransportador = (payload) =>
  apiRequest('/transportador/perfil', { method: 'PUT', body: payload });

export const listarVehiculos = () => apiRequest('/vehiculos');
export const crearVehiculo = (payload) => apiRequest('/vehiculos', { method: 'POST', body: payload });
export const editarVehiculo = (id, payload) => apiRequest(`/vehiculos/${id}`, { method: 'PUT', body: payload });
export const eliminarVehiculo = (id) => apiRequest(`/vehiculos/${id}`, { method: 'DELETE' });

export const listarVias = (municipio) => apiRequest(municipio ? `/vias?municipio=${municipio}` : '/vias', { auth: false });
export const reportarVia = (payload) => apiRequest('/vias', { method: 'POST', body: payload });
export const actualizarVia = (id, payload) => apiRequest(`/vias/${id}`, { method: 'PUT', body: payload });
