// screens/transportador/SolicitudesPendientesScreen.js
// RN06: antes de aceptar solo se muestra la zona general (municipio/vereda),
// nunca la ubicación exacta de la finca.

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, PrimaryButton, EmptyState, FormPicker } from '../../components/ui';
import { listarSolicitudes, aceptarSolicitud, rechazarSolicitud, listarVehiculos } from '../../services/logisticsService';

export default function SolicitudesPendientesScreen() {
  const [solicitudes, setSolicitudes] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [seleccion, setSeleccion] = useState({});

  const load = useCallback(async () => {
    const [data, veh] = await Promise.all([
      listarSolicitudes({ pendientes: 'true' }).catch(() => []),
      listarVehiculos().catch(() => []),
    ]);
    setSolicitudes(data);
    setVehiculos(veh);
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

  const aceptar = async (id) => {
    try {
      await aceptarSolicitud(id, { vehiculo_id: seleccion[id] });
      Alert.alert('Solicitud aceptada', 'Ya puedes ver la ubicación exacta en "Mis viajes activos".');
      await load();
    } catch (err) {
      Alert.alert('No se pudo aceptar', err?.message || 'Intenta de nuevo.');
    }
  };

  const rechazar = (id) => {
    Alert.alert('Rechazar solicitud', '¿Seguro que deseas rechazarla?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: async () => {
          await rechazarSolicitud(id, 'No disponible en la fecha solicitada');
          await load();
        },
      },
    ]);
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
          <Text style={styles.zona}>{item.origen_zona} → {item.destino || 'Destino por confirmar'}</Text>
          <Text style={styles.linea}>{item.cantidad_estimada} ton {item.fecha_servicio ? `· ${item.fecha_servicio}` : ''}</Text>
          {item.tarifa_sugerida ? <Text style={styles.linea}>Tarifa sugerida: ${Number(item.tarifa_sugerida).toLocaleString('es-CO')}</Text> : null}

          {vehiculos.length > 0 && (
            <FormPicker
              label="Vehículo a usar"
              value={seleccion[item.id]}
              onSelect={(v) => setSeleccion((s) => ({ ...s, [item.id]: v }))}
              options={vehiculos.map((v) => ({ value: v.id, label: v.placa }))}
            />
          )}

          <View style={styles.actionsRow}>
            <PrimaryButton title="Aceptar" onPress={() => aceptar(item.id)} style={{ flex: 1 }} />
            <PrimaryButton title="Rechazar" variant="danger" onPress={() => rechazar(item.id)} style={{ flex: 1 }} />
          </View>
        </Card>
      )}
      ListEmptyComponent={<EmptyState icon="notifications-outline" title="Sin solicitudes pendientes" subtitle="Cuando un palmicultor solicite transporte, aparecerá aquí." />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  zona: { ...typography.label, textTransform: 'none', fontSize: 16 },
  linea: { ...typography.subtitle, fontSize: 13, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
