// screens/admin/AdminTransportadoresScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, PrimaryButton, EmptyState, Badge } from '../../components/ui';
import { listarTransportadores, validarTransportador } from '../../services/adminService';

const ESTADO_TONE = { pendiente: 'warning', aprobado: 'success', rechazado: 'danger' };

export default function AdminTransportadoresScreen() {
  const [transportadores, setTransportadores] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await listarTransportadores().catch(() => []);
    setTransportadores(data);
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

  const validar = (id, estado) => {
    Alert.alert('Confirmar', `¿Marcar este transportador como "${estado}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => { await validarTransportador(id, estado); await load(); } },
    ]);
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      data={transportadores || []}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <Card>
          <View style={styles.rowHeader}>
            <Text style={styles.nombre}>{item.nombre_completo}</Text>
            <Badge text={item.estado} tone={ESTADO_TONE[item.estado] || 'neutral'} />
          </View>
          <Text style={styles.linea}>{item.telefono} · {item.ubicacion || '—'} · {item.total_vehiculos} vehículo(s)</Text>
          {item.estado === 'pendiente' && (
            <View style={styles.actionsRow}>
              <PrimaryButton title="Aprobar" onPress={() => validar(item.id, 'aprobado')} style={{ flex: 1 }} />
              <PrimaryButton title="Rechazar" variant="danger" onPress={() => validar(item.id, 'rechazado')} style={{ flex: 1 }} />
            </View>
          )}
        </Card>
      )}
      ListEmptyComponent={<EmptyState icon="car-outline" title="Sin transportadores registrados" />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombre: { ...typography.label, textTransform: 'none', fontSize: 15, flexShrink: 1 },
  linea: { ...typography.subtitle, fontSize: 13, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
