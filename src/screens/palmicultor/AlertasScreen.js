// screens/palmicultor/AlertasScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, PrimaryButton, EmptyState, Badge } from '../../components/ui';
import { listarAlertas, marcarAlertaLeida, marcarTodasLeidas } from '../../services/alertasService';
import { notificarAlertasNuevas } from '../../services/notificationsService';

const TIPO_ICON = { cosecha: 'leaf-outline', logistica: 'car-outline' };

export default function AlertasScreen({ navigation }) {
  const [alertas, setAlertas] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await listarAlertas();
    setAlertas(data);
    notificarAlertasNuevas(data).catch(() => {});
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

  const onPressAlerta = async (item) => {
    if (!item.leida) await marcarAlertaLeida(item.id);
    await load();
    if (item.enlace) navigation.navigate(item.enlace);
  };

  const leerTodas = async () => {
    await marcarTodasLeidas();
    await load();
  };

  const hayNoLeidas = (alertas || []).some((a) => !a.leida);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      data={alertas || []}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        hayNoLeidas ? (
          <PrimaryButton title="Marcar todas como leídas" variant="secondary" icon="checkmark-done-outline" onPress={leerTodas} style={{ marginBottom: spacing.lg }} />
        ) : null
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onPressAlerta(item)} activeOpacity={0.85}>
          <Card style={[styles.row, !item.leida && styles.rowUnread]}>
            <Ionicons name={TIPO_ICON[item.tipo] || 'notifications-outline'} size={22} color={colors.accentOrange} style={{ marginRight: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.mensaje}>{item.mensaje}</Text>
              <Text style={styles.fecha}>{item.fecha ? new Date(item.fecha).toLocaleDateString('es-CO') : ''}</Text>
            </View>
            {!item.leida ? <Badge text="Nueva" tone="warning" /> : null}
          </Card>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<EmptyState icon="notifications-outline" title="Sin alertas" subtitle="Te avisaremos cuando tus cultivos estén próximos a cosecha." />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  rowUnread: { borderLeftWidth: 4, borderLeftColor: colors.accentOrange },
  titulo: { ...typography.label, textTransform: 'none', fontSize: 15 },
  mensaje: { ...typography.subtitle, fontSize: 13, marginTop: 2 },
  fecha: { ...typography.subtitle, fontSize: 11, marginTop: 4 },
});
