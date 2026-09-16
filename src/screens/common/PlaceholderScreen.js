// screens/common/PlaceholderScreen.js
// Pantalla temporal para rutas que se desarrollarán en la siguiente fase
// (Comprador, Transportador, Administrador y módulos secundarios del Palmicultor).

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../theme/theme';

export default function PlaceholderScreen({ route, navigation }) {
  const title = route?.params?.title || route?.name || 'Próximamente';

  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={48} color={colors.primary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Este módulo se construirá en la siguiente fase.</Text>
      {navigation?.canGoBack() ? (
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: { ...typography.h2, marginTop: spacing.md, textAlign: 'center' },
  subtitle: { ...typography.subtitle, marginTop: spacing.sm, textAlign: 'center' },
  button: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
