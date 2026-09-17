// services/notificationsService.js
// Notificaciones LOCALES (no push remoto): se programan/disparan desde el
// propio dispositivo cuando la app detecta alertas nuevas (cosecha próxima,
// cambios de estado de logística, etc.), sin depender de un servidor de push.
//
// IMPORTANTE: desde el SDK 53 de Expo, Expo Go en Android ya NO incluye el
// módulo nativo de expo-notifications (solo funciona en un development
// build). Por eso TODA llamada a la librería aquí está protegida: si el
// módulo nativo no está disponible, estas funciones simplemente no hacen
// nada en vez de tumbar la app. En un development build o build de
// producción, las notificaciones funcionan normalmente sin cambiar nada.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFIED_IDS_KEY = '@notified_alert_ids';
const MAX_STORED_IDS = 300;

let Notifications = null;
let disponible = true;

function getNotificationsModule() {
  if (!disponible) return null;
  if (Notifications) return Notifications;
  try {
    Notifications = require('expo-notifications');
    return Notifications;
  } catch (_e) {
    disponible = false;
    return null;
  }
}

export async function initNotifications() {
  const N = getNotificationsModule();
  if (!N) return;

  try {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('alertas-palma-viva', {
        name: 'Alertas Palma Viva',
        importance: N.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B4D3E',
      });
    }

    const { status } = await N.getPermissionsAsync();
    if (status !== 'granted') {
      await N.requestPermissionsAsync();
    }
  } catch (_e) {
    // No disponible en Expo Go (Android, SDK 53+), permiso denegado, o web.
    // La app sigue funcionando normalmente sin notificaciones.
    disponible = false;
  }
}

export function addNotificationTapListener(onTap) {
  const N = getNotificationsModule();
  if (!N) return { remove: () => {} };

  try {
    return N.addNotificationResponseReceivedListener((response) => {
      const data = response?.notification?.request?.content?.data;
      if (data) onTap(data);
    });
  } catch (_e) {
    return { remove: () => {} };
  }
}

export async function notificarAlertasNuevas(alertas) {
  const N = getNotificationsModule();
  if (!N || !alertas?.length) return;

  const yaNotificadas = await _leerNotificadas();
  const pendientes = alertas.filter((a) => !a.leida && !yaNotificadas.has(a.id));
  if (!pendientes.length) return;

  for (const alerta of pendientes) {
    try {
      await N.scheduleNotificationAsync({
        content: {
          title: alerta.titulo,
          body: alerta.mensaje,
          data: { enlace: alerta.enlace, alertaId: alerta.id },
        },
        trigger: null, // inmediata
      });
    } catch (_e) {
      // Sin permisos, módulo no disponible u otro error — no bloquea el resto de la app.
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
