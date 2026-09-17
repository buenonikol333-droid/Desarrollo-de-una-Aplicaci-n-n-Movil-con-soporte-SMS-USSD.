// screens/palmicultor/CompradorDetalleScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { colors, spacing } from '../../theme/theme';
import { Card, LoadingView, IconRow } from '../../components/ui';
import { detalleComprador } from '../../services/marketService';

export default function CompradorDetalleScreen({ route }) {
  const { id } = route.params;
  const [comprador, setComprador] = useState(null);

  useEffect(() => {
    detalleComprador(id).then(setComprador).catch(() => {});
  }, [id]);

  if (!comprador) return <LoadingView label="Cargando comprador..." />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <Card>
        <IconRow icon="business-outline" label="Empresa" value={comprador.empresa} />
        <IconRow icon="call-outline" label="Teléfono" value={comprador.telefono || '—'} />
        <IconRow icon="mail-outline" label="Correo" value={comprador.correo || '—'} />
        <IconRow icon="location-outline" label="Ubicación" value={comprador.ubicacion || '—'} />
        <IconRow
          icon="pricetag-outline"
          label="Precio vigente"
          value={comprador.precio_vigente ? `$${Number(comprador.precio_vigente).toLocaleString('es-CO')} / ${comprador.unidad}` : 'No publicado'}
        />
      </Card>
      {comprador.descripcion ? (
        <Card>
          <IconRow icon="information-circle-outline" label="Sobre" value={comprador.descripcion} />
        </Card>
      ) : null}
    </ScrollView>
  );
}
