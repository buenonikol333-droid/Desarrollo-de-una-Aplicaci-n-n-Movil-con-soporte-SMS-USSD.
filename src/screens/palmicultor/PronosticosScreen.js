// screens/palmicultor/PronosticosScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, PrimaryButton, EmptyState, FormPicker } from '../../components/ui';
import { listarTodosLosLotes } from '../../services/fincasService';
import { listarPronosticos, calcularPronostico } from '../../services/pronosticosService';

export default function PronosticosScreen({ navigation, route }) {
  const loteIdParam = route.params?.loteId;
  const [pronosticos, setPronosticos] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lotes, setLotes] = useState([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState(loteIdParam || null);
  const [calculando, setCalculando] = useState(false);

  const load = useCallback(async () => {
    const data = await listarPronosticos(loteIdParam).catch(() => []);
    setPronosticos(data);
  }, [loteIdParam]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    if (!loteIdParam) {
      listarTodosLosLotes().then(setLotes).catch(() => setLotes([]));
    }
  }, [loteIdParam]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const calcular = async () => {
    const loteId = loteIdParam || loteSeleccionado;
    if (!loteId) {
      Alert.alert('Selecciona un lote', 'Elige el lote para el que quieres calcular el pronóstico.');
      return;
    }
    setCalculando(true);
    try {
      await calcularPronostico({ lote_id: loteId });
      await load();
    } catch (err) {
      Alert.alert('No se pudo calcular', err?.message || 'Revisa que el lote tenga un censo de producción registrado.');
    } finally {
      setCalculando(false);
    }
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      data={pronosticos || []}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <Card>
          <Text style={styles.cardTitle}>Nuevo pronóstico (RN04)</Text>
          {!loteIdParam && (
            <FormPicker
              value={loteSeleccionado}
              onSelect={setLoteSeleccionado}
              options={lotes.map((l) => ({ value: l.id, label: l.codigo }))}
            />
          )}
          <Text style={styles.hint}>Usa el último censo de producción registrado en el lote.</Text>
          <PrimaryButton title="Calcular pronóstico a 6 meses" icon="trending-up-outline" onPress={calcular} loading={calculando} />
        </Card>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('PronosticoDetail', { pronosticoId: item.id })} activeOpacity={0.85}>
          <Card style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fecha}>{item.fecha_calculo ? new Date(item.fecha_calculo).toLocaleDateString('es-CO') : '—'}</Text>
              <Text style={styles.produccion}>{item.produccion_estimada_ton?.toFixed(2)} ton estimadas ({Math.round(item.produccion_estimada_kg)} kg)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Card>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<EmptyState icon="trending-up-outline" title="Sin pronósticos todavía" subtitle="Calcula tu primer pronóstico de producción a 6 meses." />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  cardTitle: { ...typography.label, textTransform: 'none', fontSize: 17, marginBottom: spacing.sm },
  hint: { ...typography.subtitle, fontSize: 13, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  fecha: { ...typography.subtitle, fontSize: 13 },
  produccion: { ...typography.label, textTransform: 'none', fontSize: 16, marginTop: 2 },
});
