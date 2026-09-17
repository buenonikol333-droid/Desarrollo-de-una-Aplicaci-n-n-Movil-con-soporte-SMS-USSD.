// services/notificationsService.js
// Notificaciones LOCALES (no push remoto): compatibles con Expo Go. Se
// programan/disparan desde el propio dispositivo cuando la app detecta
// alertas nuevas (cosecha próxima, cambios de estado de logística, etc.),
// sin depender de un servidor de push.

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFIED_IDS_KEY = '@notified_alert_ids';
const MAX_STORED_IDS = 300;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function initNotifications() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alertas-palma-viva', {
        name: 'Alertas Palma Viva',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B4D3E',
      });
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  } catch (_e) {
    // Permiso denegado o no disponible (p. ej. web) — la app sigue funcionando sin notificaciones.
  }
}

export function addNotificationTapListener(onTap) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response?.notification?.request?.content?.data;
    if (data) onTap(data);
  });
}

export async function notificarAlertasNuevas(alertas) {
  if (!alertas?.length) return;
  const yaNotificadas = await _leerNotificadas();
  const pendientes = alertas.filter((a) => !a.leida && !yaNotificadas.has(a.id));
  if (!pendientes.length) return;

  for (const alerta of pendientes) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: alerta.titulo,
          body: alerta.mensaje,
          data: { enlace: alerta.enlace, alertaId: alerta.id },
        },
        trigger: null, // inmediata
      });
    } catch (_e) {
      // Sin permisos u otro error — no bloquea el resto de la app.
    }
    yaNotificadas.add(alerta.id);
  }

  const recortadas = Array.from(yaNotificadas).slice(-MAX_STORED_IDS);
  await AsyncStorage.setItem(NOTIFIED_IDS_KEY, JSON.stringify(recortadas));
}

async function _leerNotificadas() {
  const raw = await AsyncStorage.getItem(NOTIFIED_IDS_KEY);
  return new Set(raw ? JSON.parse(raw) : []);
}
