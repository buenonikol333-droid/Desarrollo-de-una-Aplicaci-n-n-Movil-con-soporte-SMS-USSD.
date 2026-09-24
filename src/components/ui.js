// components/ui.js
// Primitivas visuales compartidas — alto contraste, campos y botones grandes
// (accesibilidad para adulto mayor / uso rural), reutilizando theme.js.

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, MIN_TOUCH_TARGET } from '../theme/theme';

export function ScreenContainer({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function PrimaryButton({ title, onPress, loading, disabled, icon, style, variant = 'primary' }) {
  const variantStyle = variant === 'danger' ? styles.buttonDanger : variant === 'secondary' ? styles.buttonSecondary : styles.buttonPrimary;
  const textColor = variant === 'secondary' ? colors.primary : colors.white;
  return (
    <TouchableOpacity
      style={[styles.button, variantStyle, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color={textColor} style={{ marginRight: 8 }} /> : null}
          <Text style={[typography.button, { color: textColor }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function Field({ label, error, icon, containerStyle, ...inputProps }) {
  return (
    <View style={[{ marginBottom: spacing.lg }, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {icon ? <Ionicons name={icon} size={20} color={colors.textSecondary} style={{ marginRight: 8 }} /> : null}
        <TextInput style={styles.input} placeholderTextColor={colors.placeholder} {...inputProps} />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Badge({ text, tone = 'neutral' }) {
  const toneStyle = {
    neutral: { bg: colors.surface, fg: colors.textSecondary },
    success: { bg: '#E4F1E7', fg: colors.success },
    warning: { bg: '#FBEAD9', fg: colors.accentOrange },
    danger: { bg: '#F6E1DE', fg: colors.danger },
    primary: { bg: '#E1EAE6', fg: colors.primary },
  }[tone] || { bg: colors.surface, fg: colors.textSecondary };

  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.bg }]}>
      <Text style={[styles.badgeText, { color: toneStyle.fg }]}>{text}</Text>
    </View>
  );
}

export function EmptyState({ icon = 'leaf-outline', title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={40} color={colors.border} />
      {title ? <Text style={styles.emptyTitle}>{title}</Text> : null}
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function LoadingView({ label }) {
  return (
    <View style={styles.loadingView}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text style={styles.loadingLabel}>{label}</Text> : null}
    </View>
  );
}

export function IconRow({ icon, label, value }) {
  return (
    <View style={styles.iconRow}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
      <Text style={styles.iconRowLabel}>{label}</Text>
      <Text style={styles.iconRowValue}>{value}</Text>
    </View>
  );
}

export function TopBar({ title, onBack, right }) {
  return (
    <View style={styles.topBar}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.topBarBack}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.topBarBack} />
      )}
      <Text style={styles.topBarTitle} numberOfLines={1}>{title}</Text>
      <View style={styles.topBarRight}>{right}</View>
    </View>
  );
}

export function FormPicker({ label, value, options, onSelect, error }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.pickerRow}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              style={[styles.pickerChip, selected && styles.pickerChipSelected]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pickerChipText, selected && styles.pickerChipTextSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function OfflineBanner({ visible, text = 'Sin conexión — mostrando datos guardados en este dispositivo.' }) {
  if (!visible) return null;
  return (
    <View style={styles.offlineBanner}>
      <Ionicons name="cloud-offline-outline" size={16} color={colors.white} />
      <Text style={styles.offlineBannerText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2, fontSize: 19, marginTop: spacing.lg, marginBottom: spacing.sm },
  button: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary },
  buttonDanger: { backgroundColor: colors.danger },
  buttonDisabled: { opacity: 0.6 },
  label: { ...typography.label, marginBottom: spacing.sm, textTransform: 'uppercase' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inputWrapperError: { borderBottomColor: colors.danger, borderBottomWidth: 2 },
  input: { flex: 1, ...typography.body, paddingVertical: spacing.md },
  errorText: { color: colors.danger, marginTop: 4, fontSize: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  emptyTitle: { ...typography.label, textTransform: 'none', marginTop: spacing.md, textAlign: 'center' },
  emptySubtitle: { ...typography.subtitle, marginTop: spacing.xs, textAlign: 'center' },
  loadingView: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingLabel: { ...typography.subtitle, marginTop: spacing.md },
  iconRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  iconRowLabel: { ...typography.subtitle, marginRight: 6 },
  iconRowValue: { ...typography.body, fontWeight: '600', flexShrink: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  topBarBack: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  topBarTitle: { ...typography.h2, fontSize: 19, flex: 1, textAlign: 'center' },
  topBarRight: { width: 40, alignItems: 'flex-end' },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pickerChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickerChipText: { color: colors.textPrimary, fontWeight: '600' },
  pickerChipTextSelected: { color: colors.white },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentEarth,
    paddingVertical: 8,
    gap: 6,
  },
  offlineBannerText: { color: colors.white, fontSize: 13, fontWeight: '600' },
});
