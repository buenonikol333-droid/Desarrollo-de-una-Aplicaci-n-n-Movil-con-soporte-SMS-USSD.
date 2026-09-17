// screens/common/RutaMapScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, LoadingView, IconRow, Badge } from '../../components/ui';
import RouteMap from '../../components/RouteMap';
import { obtenerSolicitud } from '../../services/logisticsService';

export default function RutaMapScreen({ route }) {
  const { solicitudId } = route.params;
  const [s, setS] = useState(null);

  useEffect(() => {
    obtenerSolicitud(solicitudId).then(setS).catch(() => {});
  }, [solicitudId]);

  if (!s) return <LoadingView label="Cargando ruta..." />;

  const origen = s.ubicacion_exacta?.lat != null
    ? { lat: s.ubicacion_exacta.lat, long: s.ubicacion_exacta.long, etiqueta: s.ubicacion_exacta.direccion || 'Finca' }
    : null;
  const destino = s.destino_coords?.lat != null
    ? { lat: s.destino_coords.lat, long: s.destino_coords.long, etiqueta: s.destino_coords.etiqueta || s.destino || 'Destino' }
    : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.title}>Solicitud #{s.id}</Text>
      <Badge text={s.estado} tone="primary" />

      <Card style={{ marginTop: spacing.md }}>
        <RouteMap origen={origen} destino={destino} />
      </Card>

      <Card>
        <IconRow icon="navigate-outline" label="Zona de origen" value={s.origen_zona} />
        <IconRow icon="flag-outline" label="Destino" value={s.destino || 'Por confirmar'} />
        <IconRow icon="cube-outline" label="Cantidad" value={`${s.cantidad_estimada} ton`} />
        {s.fecha_servicio ? <IconRow icon="calendar-outline" label="Fecha" value={s.fecha_servicio} /> : null}
      </Card>
    </ScrollView>
  );
}

const styles = {
  title: { ...typography.h2, fontSize: 19 },
};
