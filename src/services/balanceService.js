// services/balanceService.js
// Balance de extracción industrial (RN05).

import { apiRequest } from '../config/api';

export const calcularBalance = (payload) => apiRequest('/balance/calcular', { method: 'POST', body: payload });
export const historialBalance = () => apiRequest('/balance/historial');
