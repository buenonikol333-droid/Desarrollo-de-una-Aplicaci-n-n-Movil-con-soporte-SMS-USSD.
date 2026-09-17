// components/RouteMap.js
// Mapa de ruta esquemático — no usa react-native-maps (requeriría un
// development build fuera de Expo Go). En su lugar dibuja origen, destino y
// la línea entre ambos con Views posicionadas a partir de las coordenadas,
// tal como se documentó como alternativa compatible con Expo Go.

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme/theme';

const CANVAS_HEIGHT = 220;
const PADDING_RATIO = 0.18;

export default function RouteMap({ origen, destino }) {
  const [width, setWidth] = useState(0);

  const tieneOrigen = origen && origen.lat != null && origen.long != null;
  const tieneDestino = destino && destino.lat != null && destino.long != null;

  let puntoOrigen = null;
  let puntoDestino = null;
  let distanciaKm = null;

  if (width > 0) {
    if (tieneOrigen && tieneDestino) {
      const lats = [origen.lat, destino.lat];
      const longs = [origen.long, destino.long];
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLong = Math.min(...longs);
      const maxLong = Math.max(...longs);
      const padLat = (maxLat - minLat) * PADDING_RATIO || 0.01;
      const padLong = (maxLong - minLong) * PADDING_RATIO || 0.01;

      const project = (p) => {
        const x = ((p.long - (minLong - padLong)) / ((maxLong + padLong) - (minLong - padLong))) * width;
        // Invierte Y: latitud mayor = más arriba en el mapa.
        const y = (1 - (p.lat - (minLat - padLat)) / ((maxLat + padLat) - (minLat - padLat))) * CANVAS_HEIGHT;
        return { x, y };
      };

      puntoOrigen = project(origen);
      puntoDestino = project(destino);
      distanciaKm = haversineKm(origen.lat, origen.long, destino.lat, destino.long);
    } else if (tieneOrigen) {
      puntoOrigen = { x: width / 2, y: CANVAS_HEIGHT / 2 };
    } else if (tieneDestino) {
      puntoDestino = { x: width / 2, y: CANVAS_HEIGHT / 2 };
    }
  }

  return (
    <View>
      <View style={styles.canvas} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {puntoOrigen && puntoDestino ? (
          <Line from={puntoOrigen} to={puntoDestino} />
        ) : null}

        {puntoOrigen ? <Pin point={puntoOrigen} color={colors.primary} icon="leaf" label={origen?.etiqueta || 'Origen'} /> : null}
        {puntoDestino ? <Pin point={puntoDestino} color={colors.accentOrange} icon="flag" label={destino?.etiqueta || 'Destino'} /> : null}

        {!tieneOrigen ? (
          <View style={styles.overlayNote}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.overlayNoteText}>La ubicación exacta de la finca se mostrará aquí cuando el transportador acepte la solicitud.</Text>
          </View>
        ) : null}
        {tieneOrigen && !tieneDestino ? (
          <View style={styles.overlayNote}>
            <Text style={styles.overlayNoteText}>Destino por confirmar.</Text>
          </View>
        ) : null}
      </View>

      {distanciaKm != null ? (
        <Text style={styles.distancia}>≈ {distanciaKm.toFixed(1)} km en línea recta (la ruta real puede variar).</Text>
      ) : null}
    </View>
  );
}

function Pin({ point, color, icon, label }) {
  return (
    <View style={[styles.pinWrap, { left: point.x - 45, top: point.y - 14 }]} pointerEvents="none">
      <View style={[styles.pinCircle, { backgroundColor: color }]}>
        <Ionicons name={icon} size={16} color={colors.white} />
      </View>
      <View style={styles.pinLabelBox}>
        <Text style={styles.pinLabelText} numberOfLines={1}>{label}</Text>
      </View>
    </View>
  );
}

function Line({ from, to }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angleRad = Math.atan2(dy, dx);
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: from.x,
        top: from.y,
        width: length,
        height: 3,
        backgroundColor: colors.accentEarth,
        opacity: 0.7,
        borderRadius: 2,
        transform: [{ rotate: `${angleRad}rad` }],
        transformOrigin: 'left center',
      }}
    />
  );
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const styles = StyleSheet.create({
  canvas: {
    height: CANVAS_HEIGHT,
    backgroundColor: '#E7EFE3',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinWrap: { position: 'absolute', alignItems: 'center', width: 90 },
  pinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  pinLabelBox: {
    marginTop: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: 100,
  },
  pinLabelText: { fontSize: 11, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  overlayNote: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(251,243,231,0.92)',
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  overlayNoteText: { flex: 1, fontSize: 12, color: colors.textSecondary },
  distancia: { ...typography.subtitle, fontSize: 12, marginTop: spacing.sm, textAlign: 'center' },
});
