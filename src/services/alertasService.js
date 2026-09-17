// services/alertasService.js
// Alertas de cosecha (RN03) y notificaciones de logística.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../config/api';

const CACHE_KEY = '@cache_alertas';

export async function listarAlertas(soloNoLeidas = false) {
  const path = soloNoLeidas ? '/alertas?no_leidas=true' : '/alertas';
  try {
    const data = await apiRequest(path);
    if (!soloNoLeidas) await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (_err) {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}

export const marcarAlertaLeida = (id) => apiRequest(`/alertas/${id}/leida`, { method: 'PATCH' });
export const marcarTodasLeidas = () => apiRequest('/alertas/leer-todas', { method: 'POST' });
