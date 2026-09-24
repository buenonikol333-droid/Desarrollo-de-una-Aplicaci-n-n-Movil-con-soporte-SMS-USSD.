// services/adminService.js
// Panel de administrador: usuarios, validación de transportadores y reportes agregados.

import { apiRequest } from '../config/api';

export const listarUsuarios = (rol) => apiRequest(rol ? `/admin/usuarios?rol=${rol}` : '/admin/usuarios');
export const cambiarEstadoUsuario = (id, estado) =>
  apiRequest(`/admin/usuarios/${id}/estado`, { method: 'PATCH', body: { estado } });

export const transportadoresPendientes = () => apiRequest('/admin/transportadores/pendientes');
export const listarTransportadores = () => apiRequest('/admin/transportadores');
export const validarTransportador = (id, estado) =>
  apiRequest(`/admin/transportadores/${id}/validar`, { method: 'PATCH', body: { estado } });

export const reportesGenerales = () => apiRequest('/admin/reportes');
