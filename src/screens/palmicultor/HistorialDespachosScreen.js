// screens/palmicultor/HistorialDespachosScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, PrimaryButton, EmptyState, Badge } from '../../components/ui';
import { listarSolicitudes } from '../../services/logisticsService';

const ESTADO_TONE = {
  Pendiente: 'neutral',
  Aceptada: 'primary',
  Rechazada: 'danger',
  'En preparación': 'warning',
  'En tránsito': 'warning',
  Entregada: 'success',
  Cancelada: 'danger',
};

export default function HistorialDespachosScreen({ navigation }) {
  const [solicitudes, setSolicitudes] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await listarSolicitudes().catch(() => []);
    setSolicitudes(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      data={solicitudes || []}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <PrimaryButton
          title="Solicitar nuevo transporte"
          icon="add-circle-outline"
          onPress={() => navigation.navigate('Transporte')}
          style={{ marginBottom: spacing.lg }}
        />
      }
      renderItem={({ item }) => (
        <Card>
          <View style={styles.rowHeader}>
            <Text style={styles.id}>Solicitud #{item.id}</Text>
            <Badge text={item.estado} tone={ESTADO_TONE[item.estado] || 'neutral'} />
          </View>
          <Text style={styles.linea}>{item.cantidad_estimada} ton · {item.origen_zona} → {item.destino || '—'}</Text>
          {item.fecha_servicio ? <Text style={styles.linea}>Fecha servicio: {item.fecha_servicio}</Text> : null}
          {item.ubicacion_exacta ? (
            <Text style={styles.linea}>Punto exacto: {item.ubicacion_exacta.direccion || `${item.ubicacion_exacta.lat}, ${item.ubicacion_exacta.long}`}</Text>
          ) : null}
          {item.motivo_rechazo ? <Text style={styles.linea}>Motivo de rechazo: {item.motivo_rechazo}</Text> : null}
          <PrimaryButton
            title="Ver mapa de la ruta"
            variant="secondary"
            icon="map-outline"
            onPress={() => navigation.navigate('RutaMap', { solicitudId: item.id })}
            style={{ marginTop: spacing.sm }}
          />
        </Card>
      )}
      ListEmptyComponent={<EmptyState icon="time-outline" title="Sin despachos todavía" subtitle="Aquí verás el historial de tus solicitudes de transporte." />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { ...typography.label, textTransform: 'none', fontSize: 15 },
  linea: { ...typography.subtitle, fontSize: 13, marginTop: 4 },
});
