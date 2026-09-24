// screens/palmicultor/LoteDetailScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, PrimaryButton, IconRow, Badge, EmptyState, LoadingView } from '../../components/ui';
import { obtenerLote, listarCiclos, eliminarLote, registrarCosecha } from '../../services/fincasService';

const ESTADO_TONE = {
  Programado: 'neutral',
  'Próximo': 'warning',
  'En curso': 'primary',
  Completado: 'success',
  Retrasado: 'danger',
};

export default function LoteDetailScreen({ navigation, route }) {
  const { loteId } = route.params;
  const [lote, setLote] = useState(null);
  const [ciclos, setCiclos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [l, c] = await Promise.all([obtenerLote(loteId), listarCiclos(loteId)]);
    setLote(l);
    setCiclos(c);
    navigation.setOptions({ title: l.codigo });
  }, [loteId, navigation]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const confirmarEliminar = () => {
    Alert.alert('Desactivar lote', `¿Seguro que deseas desactivar "${lote.codigo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desactivar', style: 'destructive', onPress: async () => { await eliminarLote(loteId); navigation.goBack(); } },
    ]);
  };

  const cosechar = (cicloId) => {
    Alert.alert('Registrar cosecha', '¿Marcar este ciclo como cosechado y programar el siguiente automáticamente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => { await registrarCosecha(cicloId); await load(); } },
    ]);
  };

  if (!lote) return <LoadingView label="Cargando lote..." />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card>
        <IconRow icon="leaf-outline" label="Nombre" value={lote.nombre || '—'} />
        <IconRow icon="apps-outline" label="Palmas" value={lote.numero_palmas || '—'} />
        <IconRow icon="resize-outline" label="Área" value={lote.area_hectareas ? `${lote.area_hectareas} ha` : '—'} />
        <IconRow icon="calendar-outline" label="Siembra" value={lote.anio_siembra || '—'} />
      </Card>

      <View style={styles.actionsRow}>
        <PrimaryButton title="Editar" variant="secondary" icon="create-outline" onPress={() => navigation.navigate('LoteForm', { loteId })} style={{ flex: 1 }} />
        <PrimaryButton title="Desactivar" variant="danger" icon="trash-outline" onPress={confirmarEliminar} style={{ flex: 1 }} />
      </View>

      <View style={styles.gridRow}>
        <PrimaryButton title="Censo de producción" variant="secondary" icon="bar-chart-outline" onPress={() => navigation.navigate('ProduccionForm', { loteId })} style={{ flex: 1 }} />
        <PrimaryButton title="Calcular pronóstico" variant="secondary" icon="trending-up-outline" onPress={() => navigation.navigate('Pronosticos', { loteId })} style={{ flex: 1 }} />
      </View>

      <Text style={styles.sectionTitle}>Ciclos de cosecha</Text>
      <PrimaryButton
        title="Configurar nuevo ciclo"
        icon="add-circle-outline"
        onPress={() => navigation.navigate('CicloForm', { loteId })}
        style={{ marginBottom: spacing.md }}
      />

      {ciclos.length === 0 ? (
        <EmptyState icon="time-outline" title="Sin ciclos configurados" subtitle="Configura la duración del ciclo para recibir alertas de cosecha (RN03)." />
      ) : (
        ciclos.map((c) => (
          <Card key={c.id}>
            <View style={styles.cicloHeader}>
              <Text style={styles.cicloFecha}>Próxima: {c.proxima_fecha_estimada || '—'}</Text>
              <Badge text={c.estado} tone={ESTADO_TONE[c.estado] || 'neutral'} />
            </View>
            <Text style={styles.cicloSub}>Duración: {c.duracion_dias} días · Alerta: {c.dias_anticipacion_alerta} días antes</Text>
            {c.observaciones ? <Text style={styles.cicloSub}>{c.observaciones}</Text> : null}
            {c.estado !== 'Completado' && (
              <PrimaryButton title="Marcar como cosechado" variant="secondary" icon="checkmark-done-outline" onPress={() => cosechar(c.id)} style={{ marginTop: spacing.sm }} />
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, marginBottom: spacing.md },
  gridRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h2, fontSize: 19, marginBottom: spacing.sm },
  cicloHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cicloFecha: { ...typography.label, textTransform: 'none', fontSize: 15 },
  cicloSub: { ...typography.subtitle, fontSize: 13, marginTop: 4 },
});
