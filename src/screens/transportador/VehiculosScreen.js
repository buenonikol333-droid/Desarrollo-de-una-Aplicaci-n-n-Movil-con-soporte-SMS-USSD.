// screens/transportador/VehiculosScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, PrimaryButton, EmptyState, Field, Badge } from '../../components/ui';
import { listarVehiculos, crearVehiculo, eliminarVehiculo } from '../../services/logisticsService';

export default function VehiculosScreen() {
  const [vehiculos, setVehiculos] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const data = await listarVehiculos().catch(() => []);
    setVehiculos(data);
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

  const submit = async () => {
    if (!placa.trim()) {
      Alert.alert('Falta información', 'Ingresa la placa del vehículo.');
      return;
    }
    setLoading(true);
    try {
      await crearVehiculo({ placa, tipo_vehiculo: tipo, capacidad_toneladas: capacidad ? Number(capacidad) : null });
      setPlaca('');
      setTipo('');
      setCapacidad('');
      setShowForm(false);
      await load();
    } catch (err) {
      Alert.alert('No se pudo guardar', err?.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = (id) => {
    Alert.alert('Desactivar vehículo', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desactivar', style: 'destructive', onPress: async () => { await eliminarVehiculo(id); await load(); } },
    ]);
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      data={vehiculos || []}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <>
          <PrimaryButton
            title={showForm ? 'Cancelar' : 'Registrar vehículo'}
            variant={showForm ? 'secondary' : 'primary'}
            icon={showForm ? 'close' : 'add-circle-outline'}
            onPress={() => setShowForm((s) => !s)}
            style={{ marginBottom: spacing.lg }}
          />
          {showForm && (
            <Card>
              <Field label="Placa" placeholder="TUM123" value={placa} onChangeText={setPlaca} />
              <Field label="Tipo de vehículo" placeholder="Camión estacas" value={tipo} onChangeText={setTipo} />
              <Field label="Capacidad (toneladas)" keyboardType="numeric" value={capacidad} onChangeText={setCapacidad} />
              <PrimaryButton title="Guardar" onPress={submit} loading={loading} />
            </Card>
          )}
        </>
      }
      renderItem={({ item }) => (
        <Card style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.placa}>{item.placa}</Text>
            <Text style={styles.linea}>{item.tipo_vehiculo || '—'} · {item.capacidad_toneladas || '—'} ton</Text>
          </View>
          <Badge text={item.disponible ? 'Disponible' : 'No disponible'} tone={item.disponible ? 'success' : 'neutral'} />
          <PrimaryButton title="Quitar" variant="danger" onPress={() => eliminar(item.id)} style={{ marginLeft: spacing.sm, minHeight: 40, paddingHorizontal: spacing.md }} />
        </Card>
      )}
      ListEmptyComponent={<EmptyState icon="car-outline" title="Sin vehículos registrados" />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  placa: { ...typography.label, textTransform: 'none', fontSize: 16 },
  linea: { ...typography.subtitle, fontSize: 13, marginTop: 2 },
});
