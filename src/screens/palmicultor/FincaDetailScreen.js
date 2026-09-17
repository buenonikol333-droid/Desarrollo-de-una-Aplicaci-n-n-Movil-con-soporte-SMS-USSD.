// screens/palmicultor/FincaDetailScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, PrimaryButton, EmptyState, LoadingView, IconRow } from '../../components/ui';
import { obtenerFinca, listarLotes, eliminarFinca } from '../../services/fincasService';

export default function FincaDetailScreen({ navigation, route }) {
  const { fincaId } = route.params;
  const [finca, setFinca] = useState(null);
  const [lotes, setLotes] = useState([]);

  const load = useCallback(async () => {
    const [f, l] = await Promise.all([obtenerFinca(fincaId), listarLotes(fincaId)]);
    setFinca(f);
    setLotes(l);
    navigation.setOptions({ title: f.nombre });
  }, [fincaId, navigation]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load])
  );

  const confirmarEliminar = () => {
    Alert.alert('Desactivar finca', `¿Seguro que deseas desactivar "${finca.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desactivar',
        style: 'destructive',
        onPress: async () => {
          await eliminarFinca(fincaId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!finca) return <LoadingView label="Cargando finca..." />;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      data={lotes}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <>
          <Card>
            <IconRow icon="location-outline" label="Municipio" value={`${finca.municipio}${finca.vereda ? ', ' + finca.vereda : ''}`} />
            <IconRow icon="map-outline" label="Ubicación" value={finca.ubicacion || 'No registrada'} />
            <IconRow icon="resize-outline" label="Área" value={finca.area_hectareas ? `${finca.area_hectareas} ha` : '—'} />
          </Card>
          <View style={styles.actionsRow}>
            <PrimaryButton title="Editar" variant="secondary" icon="create-outline" onPress={() => navigation.navigate('FincaForm', { fincaId })} style={{ flex: 1 }} />
            <PrimaryButton title="Desactivar" variant="danger" icon="trash-outline" onPress={confirmarEliminar} style={{ flex: 1 }} />
          </View>
          <Text style={styles.sectionTitle}>Lotes</Text>
          <PrimaryButton
            title="Registrar lote"
            icon="add-circle-outline"
            onPress={() => navigation.navigate('LoteForm', { fincaId })}
            style={{ marginBottom: spacing.md }}
          />
        </>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('LoteDetail', { loteId: item.id })} activeOpacity={0.85}>
          <Card style={styles.loteRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.loteCodigo}>{item.codigo}{item.nombre ? ` — ${item.nombre}` : ''}</Text>
              <Text style={styles.loteSub}>{item.numero_palmas || '—'} palmas · {item.area_hectareas || '—'} ha</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Card>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<EmptyState icon="grid-outline" title="Sin lotes todavía" subtitle="Registra el primer lote de esta finca." />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h2, fontSize: 19, marginBottom: spacing.sm },
  loteRow: { flexDirection: 'row', alignItems: 'center' },
  loteCodigo: { ...typography.label, textTransform: 'none', fontSize: 16 },
  loteSub: { ...typography.subtitle, fontSize: 13, marginTop: 2 },
});
