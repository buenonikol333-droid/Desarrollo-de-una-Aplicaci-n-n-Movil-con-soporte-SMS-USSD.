// screens/palmicultor/TransporteRequestScreen.js
// RN06: al crear la solicitud solo se comparte el municipio/vereda de la
// finca; la ubicación exacta se revela al transportador cuando la acepta.

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Alert } from 'react-native';
import { colors, spacing, typography } from '../../theme/theme';
import { Field, PrimaryButton, FormPicker } from '../../components/ui';
import { listarFincas, listarLotes } from '../../services/fincasService';
import { getCompradoresCercanos } from '../../services/marketService';
import { crearSolicitudTransporte } from '../../services/logisticsService';

export default function TransporteRequestScreen({ navigation }) {
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [compradores, setCompradores] = useState([]);
  const [fincaId, setFincaId] = useState(null);
  const [loteId, setLoteId] = useState(null);
  const [compradorId, setCompradorId] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [destino, setDestino] = useState('');
  const [fechaServicio, setFechaServicio] = useState('');
  const [tarifaSugerida, setTarifaSugerida] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listarFincas().then(setFincas).catch(() => setFincas([]));
    getCompradoresCercanos().then(setCompradores).catch(() => setCompradores([]));
  }, []);

  useEffect(() => {
    if (fincaId) listarLotes(fincaId).then(setLotes).catch(() => setLotes([]));
    else setLotes([]);
  }, [fincaId]);

  const submit = async () => {
    if (!fincaId) {
      setError('Selecciona la finca de origen.');
      return;
    }
    if (!cantidad || Number(cantidad) <= 0) {
      setError('Indica la cantidad estimada en toneladas.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await crearSolicitudTransporte({
        finca_id: fincaId,
        lote_id: loteId,
        comprador_id: compradorId,
        cantidad_estimada: Number(cantidad),
        destino: destino.trim(),
        fecha_servicio: fechaServicio || undefined,
        tarifa_sugerida: tarifaSugerida ? Number(tarifaSugerida) : undefined,
        observaciones: observaciones.trim(),
      });
      Alert.alert('Solicitud enviada', 'Un transportador podrá aceptarla y coordinar la recogida.', [
        { text: 'Ver historial', onPress: () => navigation.replace('HistorialDespachos') },
      ]);
    } catch (err) {
      Alert.alert('No se pudo enviar', err?.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <FormPicker label="Finca de origen" value={fincaId} onSelect={setFincaId} options={fincas.map((f) => ({ value: f.id, label: f.nombre }))} error={error} />
      {lotes.length > 0 && (
        <FormPicker label="Lote (opcional)" value={loteId} onSelect={setLoteId} options={lotes.map((l) => ({ value: l.id, label: l.codigo }))} />
      )}
      {compradores.length > 0 && (
        <FormPicker label="Comprador destino (opcional)" value={compradorId} onSelect={setCompradorId} options={compradores.map((c) => ({ value: c.id, label: c.nombre }))} />
      )}
      <Field label="Cantidad estimada (toneladas)" keyboardType="numeric" value={cantidad} onChangeText={setCantidad} />
      <Field label="Destino" placeholder="Extractora del Pacífico, Tumaco" value={destino} onChangeText={setDestino} />
      <Field label="Fecha del servicio (AAAA-MM-DD, opcional)" placeholder="2026-10-01" value={fechaServicio} onChangeText={setFechaServicio} />
      <Field label="Tarifa sugerida (COP, opcional)" keyboardType="numeric" value={tarifaSugerida} onChangeText={setTarifaSugerida} />
      <Field label="Observaciones" value={observaciones} onChangeText={setObservaciones} multiline />
      <Text style={styles.hint}>Tu ubicación exacta solo se compartirá con el transportador una vez acepte la solicitud.</Text>
      <PrimaryButton title="Solicitar transporte" onPress={submit} loading={loading} />
    </ScrollView>
  );
}

const styles = {
  hint: { ...typography.subtitle, fontSize: 12, marginBottom: spacing.md },
};
