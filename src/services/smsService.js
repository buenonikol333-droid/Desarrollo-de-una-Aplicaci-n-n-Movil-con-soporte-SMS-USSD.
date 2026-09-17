// services/smsService.js
// Simulador SMS/USSD (MOCK) — permite probar dentro de la app los mismos
// comandos que un palmicultor sin datos móviles enviaría por SMS/USSD real.

import { apiRequest } from '../config/api';

export const enviarComandoSms = (telefono, mensaje, canal = 'sms') =>
  apiRequest('/sms/entrante', { method: 'POST', body: { telefono, mensaje, canal }, auth: false });

export const listarLogsSms = () => apiRequest('/sms/logs');
