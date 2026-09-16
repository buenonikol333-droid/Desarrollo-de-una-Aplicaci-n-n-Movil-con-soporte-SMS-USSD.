// services/marketService.js
// Precio vigente y compradores cercanos, con caché local para modo offline.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../config/api';

const PRICE_CACHE_KEY = '@cache_precio_vigente';
const BUYERS_CACHE_KEY = '@cache_compradores';

export async function getPrecioVigente() {
  try {
    const data = await apiRequest('/precios/vigente');
    await AsyncStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (_err) {
    const cached = await AsyncStorage.getItem(PRICE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  }
}

export async function getCompradoresCercanos() {
  try {
    const data = await apiRequest('/compradores/cercanos');
    await AsyncStorage.setItem(BUYERS_CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (_err) {
    const cached = await AsyncStorage.getItem(BUYERS_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}

export async function publicarProducto(payload) {
  return apiRequest('/mercado/publicaciones', { method: 'POST', body: payload });
}
