// config/api.js
// Cliente HTTP centralizado. Ajusta API_BASE_URL a tu backend Flask local.
// En el emulador Android, "10.0.2.2" apunta al localhost de tu PC.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'http://192.168.1.9:5000/api';

async function getToken() {
  return AsyncStorage.getItem('@auth_token');
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_e) {
    // respuesta sin cuerpo JSON
  }

  if (!response.ok) {
    const message = data?.message || data?.error || `Error ${response.status}`;
    throw new Error(message);
  }
  return data;
}
