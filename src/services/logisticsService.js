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
