// screens/palmicultor/FincaFormScreen.js
// Crear/editar finca. route.params.fincaId presente = edición.

import React, { useEffect, useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { colors, spacing } from '../../theme/theme';
import { Field, PrimaryButton } from '../../components/ui';
import { crearFinca, editarFinca, obtenerFinca } from '../../services/fincasService';

export default function FincaFormScreen({ navigation, route }) {
  const fincaId = route.params?.fincaId;
  const [nombre, setNombre] = useState('');
  const [municipio, setMunicipio] = useState('Tumaco');
  const [vereda, setVereda] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [areaHectareas, setAreaHectareas] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (fincaId) {
      obtenerFinca(fincaId).then((f) => {
        setNombre(f.nombre || '');
        setMunicipio(f.municipio || 'Tumaco');
        setVereda(f.vereda || '');
        setUbicacion(f.ubicacion || '');
        setAreaHectareas(f.area_hectareas ? String(f.area_hectareas) : '');
      });
    }
  }, [fincaId]);

  const submit = async () => {
    if (!nombre.trim()) {
      setErrors({ nombre: 'El nombre de la finca es obligatorio.' });
      return;
    }
    setErrors({});
    setLoading(true);
    const payload = {
      nombre: nombre.trim(),
      municipio: municipio.trim(),
      vereda: vereda.trim(),
      ubicacion: ubicacion.trim(),
      area_hectareas: areaHectareas ? Number(areaHectareas) : null,
    };
    try {
      if (fincaId) {
        await editarFinca(fincaId, payload);
      } else {
        await crearFinca(payload);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('No se pudo guardar', err?.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <Field label="Nombre de la finca" placeholder="Finca La Esperanza" value={nombre} onChangeText={setNombre} error={errors.nombre} />
      <Field label="Municipio" value={municipio} onChangeText={setMunicipio} />
      <Field label="Vereda" placeholder="El Pital" value={vereda} onChangeText={setVereda} />
      <Field label="Ubicación de referencia" placeholder="Vía Tumaco - Llorente, km 12" value={ubicacion} onChangeText={setUbicacion} />
      <Field label="Área (hectáreas)" placeholder="25" keyboardType="numeric" value={areaHectareas} onChangeText={setAreaHectareas} />
      <PrimaryButton title={fincaId ? 'Guardar cambios' : 'Registrar finca'} onPress={submit} loading={loading} />
    </ScrollView>
  );
}
