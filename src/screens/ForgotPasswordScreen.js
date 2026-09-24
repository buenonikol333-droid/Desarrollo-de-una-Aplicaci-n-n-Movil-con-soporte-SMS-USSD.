// screens/ForgotPasswordScreen.js
// Recuperación de contraseña en 3 pasos. El código se genera en el backend;
// como todavía no hay proveedor real de SMS/correo conectado, el backend lo
// devuelve como `dev_codigo` (MOCK) para poder probar el flujo completo.

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/theme';
import { Field, PrimaryButton } from '../components/ui';
import { forgotPassword, verifyResetCode, resetPassword } from '../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [devCodigo, setDevCodigo] = useState(null);
  const [error, setError] = useState('');

  const solicitarCodigo = async () => {
    if (!identifier.trim()) {
      setError('Ingresa tu teléfono o correo.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await forgotPassword(identifier.trim());
      setDevCodigo(data.dev_codigo || null);
      setStep(2);
    } catch (err) {
      Alert.alert('No se pudo continuar', err?.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const verificarCodigo = async () => {
    if (!codigo.trim()) {
      setError('Ingresa el código de verificación.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyResetCode(identifier.trim(), codigo.trim());
      setStep(3);
    } catch (err) {
      setError(err?.message || 'Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const cambiarPassword = async () => {
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(identifier.trim(), codigo.trim(), password);
      Alert.alert('¡Listo!', 'Tu contraseña se actualizó correctamente.', [
        { text: 'Iniciar sesión', onPress: () => navigation.replace('Login') },
      ]);
    } catch (err) {
      Alert.alert('No se pudo actualizar', err?.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Ionicons name="lock-open-outline" size={40} color={colors.primary} />
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>
        {step === 1 && 'Ingresa tu teléfono o correo registrado.'}
        {step === 2 && 'Ingresa el código de verificación que recibiste.'}
        {step === 3 && 'Crea tu nueva contraseña.'}
      </Text>

      {step === 1 && (
        <>
          <Field
            label="TELÉFONO O CORREO"
            placeholder="nombre@ejemplo.com"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
            error={error}
          />
          <PrimaryButton title="Enviar código" onPress={solicitarCodigo} loading={loading} />
        </>
      )}

      {step === 2 && (
        <>
          {devCodigo ? (
            <View style={styles.mockBox}>
              <Text style={styles.mockText}>
                MODO DEMO: como todavía no hay un proveedor SMS/correo conectado, tu código es{' '}
                <Text style={{ fontWeight: '800' }}>{devCodigo}</Text>
              </Text>
            </View>
          ) : null}
          <Field
            label="CÓDIGO DE 6 DÍGITOS"
            placeholder="000000"
            keyboardType="number-pad"
            value={codigo}
            onChangeText={setCodigo}
            error={error}
            maxLength={6}
          />
          <PrimaryButton title="Verificar código" onPress={verificarCodigo} loading={loading} />
        </>
      )}

      {step === 3 && (
        <>
          <Field
            label="NUEVA CONTRASEÑA"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Field
            label="CONFIRMAR CONTRASEÑA"
            placeholder="••••••••"
            secureTextEntry
            value={password2}
            onChangeText={setPassword2}
            error={error}
          />
          <PrimaryButton title="Guardar nueva contraseña" onPress={cambiarPassword} loading={loading} />
        </>
      )}

      <PrimaryButton
        title="Volver a iniciar sesión"
        variant="secondary"
        onPress={() => navigation.replace('Login')}
        style={{ marginTop: spacing.md }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl, alignItems: 'stretch' },
  title: { ...typography.h1, marginTop: spacing.md, marginBottom: spacing.xs },
  subtitle: { ...typography.subtitle, marginBottom: spacing.xl },
  mockBox: {
    backgroundColor: '#FBEAD9',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  mockText: { color: colors.accentEarth, fontSize: 14 },
});
