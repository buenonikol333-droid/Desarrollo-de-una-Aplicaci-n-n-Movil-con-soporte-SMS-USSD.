// screens/common/PerfilScreen.js
// Perfil básico compartido por los 4 roles + cierre de sesión.

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../theme/theme';
import { PrimaryButton, Card, Badge } from '../../components/ui';
import { getStoredUser, logoutUser } from '../../services/authService';

const ROL_LABEL = {
  palmicultor: 'Palmicultor',
  comprador: 'Comprador',
  transportador: 'Transportador',
  administrador: 'Administrador',
};

export default function PerfilScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    getStoredUser().then(setUsuario);
  }, []);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={36} color={colors.white} />
      </View>
      <Text style={styles.name}>{usuario?.nombre_completo || '—'}</Text>
      <Badge text={ROL_LABEL[usuario?.rol] || usuario?.rol || ''} tone="primary" />

      <Card style={{ marginTop: spacing.xl, width: '100%' }}>
        <Row icon="call-outline" label="Teléfono" value={usuario?.telefono} />
        <Row icon="mail-outline" label="Correo" value={usuario?.correo || 'No registrado'} />
        <Row icon="checkmark-circle-outline" label="Estado" value={usuario?.estado} />
      </Card>

      <PrimaryButton title="Cerrar sesión" variant="danger" icon="log-out-outline" onPress={handleLogout} style={{ marginTop: spacing.xl, width: '100%' }} />
    </ScrollView>
  );
}

function Row({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl, alignItems: 'center' },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: { ...typography.h1, fontSize: 24, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { ...typography.subtitle, width: 90 },
  rowValue: { ...typography.body, fontWeight: '600', flex: 1 },
});
