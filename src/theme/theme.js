// theme.js
// Paleta e identidad visual de la app "Cosecha Palma de Aceite"
// Diseñada para alto contraste / accesibilidad (adulto mayor, sector rural)

export const colors = {
  background: '#FBF3E7',      // crema/arena
  surface: '#F5E6D3',         // campos de texto / tarjetas
  primary: '#1B4D3E',         // verde oscuro táctil (botones principales)
  primaryDark: '#123A2E',
  primaryLight: '#2E6B57',
  accentOrange: '#E07A2C',    // madurez del fruto / alertas
  accentEarth: '#8B5E34',     // tonos tierra
  textPrimary: '#1F2A24',
  textSecondary: '#6B6155',
  placeholder: '#A79A86',
  border: '#D8C7AE',
  white: '#FFFFFF',
  danger: '#B23A2E',
  success: '#3E7A4D',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  label: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, letterSpacing: 0.3 },
  body: { fontSize: 17, color: colors.textPrimary },
  subtitle: { fontSize: 15, color: colors.textSecondary },
  button: { fontSize: 18, fontWeight: '700', color: colors.white },
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

// Tamaño mínimo táctil recomendado (accesibilidad)
export const MIN_TOUCH_TARGET = 56;
