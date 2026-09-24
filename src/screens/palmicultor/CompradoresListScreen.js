// screens/palmicultor/CompradoresListScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, EmptyState } from '../../components/ui';
import { getCompradoresCercanos } from '../../services/marketService';

export default function CompradoresListScreen({ navigation }) {
  const [compradores, setCompradores] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getCompradoresCercanos();
    setCompradores(data);
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
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      data={compradores || []}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('CompradorDetalle', { id: item.id })} activeOpacity={0.85}>
          <Card style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="business-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              {item.verificado ? <Text style={styles.verificado}>Verificado</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Card>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<EmptyState icon="business-outline" title="Sin compradores disponibles" />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  nombre: { ...typography.label, textTransform: 'none', fontSize: 16 },
  verificado: { fontSize: 12, color: colors.success, fontWeight: '600', marginTop: 2 },
});
