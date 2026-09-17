// screens/admin/AdminUsuariosScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, PrimaryButton, EmptyState, Badge, FormPicker } from '../../components/ui';
import { listarUsuarios, cambiarEstadoUsuario } from '../../services/adminService';

const ROL_LABEL = { palmicultor: 'Palmicultor', comprador: 'Comprador', transportador: 'Transportador', administrador: 'Admin' };

export default function AdminUsuariosScreen() {
  const [usuarios, setUsuarios] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroRol, setFiltroRol] = useState(null);

  const load = useCallback(async (rol) => {
    const data = await listarUsuarios(rol).catch(() => []);
    setUsuarios(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(filtroRol);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroRol])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load(filtroRol);
    setRefreshing(false);
  };

  const toggleEstado = (usuario) => {
    const nuevo = usuario.estado === 'activo' ? 'suspendido' : 'activo';
    Alert.alert('Confirmar', `¿${nuevo === 'activo' ? 'Activar' : 'Suspender'} a ${usuario.nombre_completo}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => { await cambiarEstadoUsuario(usuario.id, nuevo); await load(filtroRol); } },
    ]);
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      data={usuarios || []}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <FormPicker
          label="Filtrar por rol"
          value={filtroRol}
          onSelect={setFiltroRol}
          options={[{ value: null, label: 'Todos' }, ...Object.entries(ROL_LABEL).map(([value, label]) => ({ value, label }))]}
        />
      }
      renderItem={({ item }) => (
        <Card style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nombre}>{item.nombre_completo}</Text>
            <Text style={styles.linea}>{item.telefono} · {ROL_LABEL[item.rol] || item.rol}</Text>
          </View>
          <Badge text={item.estado} tone={item.estado === 'activo' ? 'success' : 'danger'} />
          <PrimaryButton
            title={item.estado === 'activo' ? 'Suspender' : 'Activar'}
            variant={item.estado === 'activo' ? 'danger' : 'secondary'}
            onPress={() => toggleEstado(item)}
            style={{ marginLeft: spacing.sm, minHeight: 40, paddingHorizontal: spacing.md }}
          />
        </Card>
      )}
      ListEmptyComponent={<EmptyState icon="people-outline" title="Sin usuarios" />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  nombre: { ...typography.label, textTransform: 'none', fontSize: 15 },
  linea: { ...typography.subtitle, fontSize: 12, marginTop: 2 },
});
