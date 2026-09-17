// screens/palmicultor/CicloFormScreen.js
// Configuración del ciclo de cosecha (RN03): 7-12 días palmas jóvenes,
// 9-15 días palmas adultas (puede variar por época climática), y anticipación
// de la alerta entre 1 y 7 días.

import React, { useState } from 'react';
import { ScrollView, Text, Alert } from 'react-native';
import { colors, spacing, typography } from '../../theme/theme';
import { Field, PrimaryButton, FormPicker } from '../../components/ui';
import { crearCiclo } from '../../services/fincasService';

export default function CicloFormScreen({ navigation, route }) {
  const { loteId } = route.params;
  const [duracionDias, setDuracionDias] = useState('10');
  const [anticipacion, setAnticipacion] = useState(3);
  const [fechaUltimaCosecha, setFechaUltimaCosecha] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const dias = Number(duracionDias);
    if (!dias || dias < 1 || dias > 60) {
      setError('La duración del ciclo debe ser un número de días razonable.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await crearCiclo(loteId, {
        duracion_dias: dias,
        dias_anticipacion_alerta: anticipacion,
        fecha_ultima_cosecha: fechaUltimaCosecha || undefined,
        observaciones: observaciones.trim(),
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('No se pudo guardar', err?.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.hint}>
        Referencia: palmas jóvenes 7-12 días, palmas adultas 9-15 días. El ciclo puede variar según la época climática.
      </Text>
      <Field
        label="Duración del ciclo (días)"
        keyboardType="numeric"
        value={duracionDias}
        onChangeText={setDuracionDias}
        error={error}
      />
      <Field
        label="Fecha de la última cosecha (AAAA-MM-DD, opcional)"
        placeholder="2026-09-10"
        value={fechaUltimaCosecha}
        onChangeText={setFechaUltimaCosecha}
      />
      <FormPicker
        label="Avisarme con anticipación de (RN03: 1-7 días)"
        value={anticipacion}
        onSelect={setAnticipacion}
        options={[1, 2, 3, 4, 5, 6, 7].map((d) => ({ value: d, label: `${d} día${d > 1 ? 's' : ''}` }))}
      />
      <Field label="Observaciones" value={observaciones} onChangeText={setObservaciones} multiline />
      <PrimaryButton title="Guardar ciclo" onPress={submit} loading={loading} />
    </ScrollView>
  );
}

const styles = {
  hint: { ...typography.subtitle, fontSize: 13, marginBottom: spacing.lg },
};
