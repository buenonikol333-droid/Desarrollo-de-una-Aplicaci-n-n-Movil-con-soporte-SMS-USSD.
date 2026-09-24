// screens/transportador/HistorialTransportadorScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, EmptyState, Badge } from '../../components/ui';
import { historialTransporte } from '../../services/logisticsService';

const ESTADO_TONE = { Entregada: 'success', Cancelada: 'danger', Rechazada: 'danger' };

export default function HistorialTransportadorScreen() {
  const [solicitudes, setSolicitudes] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await historialTransporte().catch(() => []);
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
      renderItem={({ item }) => (
        <Card>
          <View style={styles.rowHeader}>
            <Text style={styles.id}>Solicitud #{item.id}</Text>
            <Badge text={item.estado} tone={ESTADO_TONE[item.estado] || 'neutral'} />
          </View>
          <Text style={styles.linea}>{item.cantidad_estimada} ton · {item.destino || '—'}</Text>
        </Card>
      )}
      ListEmptyComponent={<EmptyState icon="time-outline" title="Sin historial todavía" />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { ...typography.label, textTransform: 'none', fontSize: 15 },
  linea: { ...typography.subtitle, fontSize: 13, marginTop: 4 },
});
