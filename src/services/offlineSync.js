// services/offlineSync.js
// Punto único para vaciar todas las colas offline (registros pendientes de
// producción y de cuentas creadas sin conexión) cuando vuelve la señal.

import { syncPendingRegistrations } from './authService';
import { sincronizarPendientes as sincronizarProduccion, contarPendientes } from './produccionService';

export async function sincronizarTodo() {
  const [registros, produccion] = await Promise.all([
    syncPendingRegistrations().catch(() => ({ enviados: 0, pendientes: 0 })),
    sincronizarProduccion().catch(() => ({ enviados: 0, pendientes: 0, errores: [] })),
  ]);
  return { registros, produccion };
}

export async function hayPendientes() {
  const pendientesProduccion = await contarPendientes();
  return pendientesProduccion > 0;
}
