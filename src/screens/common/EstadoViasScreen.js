// screens/common/EstadoViasScreen.js
// Estado de vías: consulta para todos los roles; reporte/edición solo para
// transportador y administrador (regla aplicada también en backend).

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, Badge, Field, PrimaryButton, EmptyState, FormPicker } from '../../components/ui';
import { listarVias, reportarVia } from '../../services/logisticsService';
import { getStoredUser } from '../../services/authService';

const ESTADO_TONE = {
  habilitada: 'success',
  precaucion: 'warning',
  restringida: 'warning',
  cerrada: 'danger',
};

const ESTADO_LABEL = {
  habilitada: 'Habilitada',
  precaucion: 'Precaución',
  restringida: 'Restringida',
  cerrada: 'Cerrada',
};

export default function EstadoViasScreen() {
  const [vias, setVias] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [puedeReportar, setPuedeReportar] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [via, setVia] = useState('');
  const [municipio, setMunicipio] = useState('Tumaco');
  const [estado, setEstado] = useState('habilitada');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const data = await listarVias().catch(() => []);
    setVias(data);
  }, []);

  useEffect(() => {
    load();
    getStoredUser().then((u) => setPuedeReportar(['transportador', 'administrador'].includes(u?.rol)));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const submit = async () => {
    if (!via.trim()) {
      Alert.alert('Falta información', 'Escribe el nombre de la vía.');
      return;
    }
    setLoading(true);
    try {
      await reportarVia({ via: via.trim(), municipio, estado, observaciones });
      setVia('');
      setObservaciones('');
      setShowForm(false);
      await load();
    } catch (err) {
      Alert.alert('No se pudo reportar', err?.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      data={vias}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <>
          {puedeReportar && (
            <PrimaryButton
              title={showForm ? 'Cancelar' : 'Reportar estado de una vía'}
              variant={showForm ? 'secondary' : 'primary'}
              icon={showForm ? 'close' : 'add-circle-outline'}
              onPress={() => setShowForm((s) => !s)}
              style={{ marginBottom: spacing.lg }}
            />
          )}
          {showForm && (
            <Card>
              <Field label="Vía" placeholder="Vía Tumaco - Llorente" value={via} onChangeText={setVia} />
              <Field label="Municipio" value={municipio} onChangeText={setMunicipio} />
              <FormPicker
                label="Estado"
                value={estado}
                onSelect={setEstado}
                options={Object.entries(ESTADO_LABEL).map(([value, label]) => ({ value, label }))}
              />
              <Field label="Observaciones" value={observaciones} onChangeText={setObservaciones} multiline />
              <PrimaryButton title="Guardar" onPress={submit} loading={loading} />
            </Card>
          )}
        </>
      }
      renderItem={({ item }) => (
        <Card>
          <View style={styles.rowHeader}>
            <Text style={styles.via}>{item.via}</Text>
            <Badge text={ESTADO_LABEL[item.estado] || item.estado} tone={ESTADO_TONE[item.estado] || 'neutral'} />
          </View>
          <Text style={styles.municipio}>{item.municipio}</Text>
          {item.observaciones ? <Text style={styles.observaciones}>{item.observaciones}</Text> : null}
        </Card>
      )}
      ListEmptyComponent={<EmptyState icon="trail-sign-outline" title="Sin novedades" subtitle="No hay reportes de vías por ahora." />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  via: { ...typography.label, textTransform: 'none', fontSize: 17, flexShrink: 1 },
  municipio: { ...typography.subtitle, marginTop: 4 },
  observaciones: { ...typography.body, fontSize: 14, marginTop: spacing.sm, color: colors.textSecondary },
});
