// screens/comprador/CompradorDashboard.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, radius, MIN_TOUCH_TARGET } from '../../theme/theme';
import { getStoredUser } from '../../services/authService';
import { getPrecioVigente, vitrinaPublica } from '../../services/marketService';

export default function CompradorDashboard({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [precio, setPrecio] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [u, p, pub] = await Promise.all([
      getStoredUser(),
      getPrecioVigente(),
      vitrinaPublica().catch(() => []),
    ]);
    setUsuario(u);
    setPrecio(p);
    setPublicaciones(pub.slice(0, 5));
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>¡Hola, {usuario?.nombre_completo?.split(' ')[0] || 'Comprador'}!</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Perfil')} hitSlop={12}>
          <Ionicons name="person-circle-outline" size={30} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>PRECIO DE REFERENCIA</Text>
        <Text style={styles.priceValue}>{precio?.valor ? `$${Number(precio.valor).toLocaleString('es-CO')}` : '$ ----'}</Text>
        <Text style={styles.priceUnit}>{precio?.unidad || 'Tonelada de Aceite de Palma'}</Text>
      </View>

      <TouchableOpacity style={styles.bigButton} onPress={() => navigation.navigate('MercadoVitrina')} activeOpacity={0.85}>
        <Ionicons name="storefront-outline" size={22} color={colors.white} />
        <Text style={styles.bigButtonText}>Explorar cosechas disponibles</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Publicaciones recientes</Text>
      {publicaciones.map((p) => (
        <TouchableOpacity key={p.id} onPress={() => navigation.navigate('PublicacionDetalle', { id: p.id })} activeOpacity={0.85}>
          <View style={styles.pubCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pubCantidad}>{p.cantidad_toneladas} ton — {p.municipio}</Text>
              <Text style={styles.pubPrecio}>{p.precio_esperado ? `$${Number(p.precio_esperado).toLocaleString('es-CO')} / ${p.unidad}` : 'Precio a convenir'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      ))}
      {publicaciones.length === 0 ? <Text style={styles.emptyText}>Aún no hay publicaciones activas.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greeting: { ...typography.h1 },
  priceCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  priceLabel: { color: colors.white, opacity: 0.8, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  priceValue: { color: colors.white, fontSize: 34, fontWeight: '800', marginTop: 4 },
  priceUnit: { color: colors.white, opacity: 0.9, fontSize: 15, marginTop: 2 },
  bigButton: {
    backgroundColor: colors.accentOrange, borderRadius: radius.pill, minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: spacing.xl,
  },
  bigButtonText: { color: colors.white, fontWeight: '700', fontSize: 17 },
  sectionTitle: { ...typography.h2, fontSize: 19, marginBottom: spacing.sm },
  pubCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  pubCantidad: { ...typography.label, textTransform: 'none', fontSize: 15 },
  pubPrecio: { ...typography.subtitle, fontSize: 13, marginTop: 2 },
  emptyText: { color: colors.textSecondary, paddingVertical: spacing.md },
});
