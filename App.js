// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PalmicultorDashboard from './src/screens/PalmicultorDashboard';
import PlaceholderScreen from './src/screens/common/PlaceholderScreen';
import { colors } from './src/theme/theme';

const Stack = createNativeStackNavigator();

// Rutas que aún son placeholder (se construyen en la siguiente fase).
// Todas usan la misma pantalla genérica, pasando el título por params.
const PLACEHOLDER_ROUTES = [
  { name: 'ForgotPassword', title: 'Recuperar contraseña' },
  { name: 'CompradorDashboard', title: 'Panel del Comprador' },
  { name: 'TransportadorDashboard', title: 'Panel del Transportador' },
  { name: 'AdminDashboard', title: 'Panel del Administrador' },
  { name: 'PublicarProducto', title: 'Publicar mi producto' },
  { name: 'Compradores', title: 'Compradores en la zona' },
  { name: 'CompradorDetalle', title: 'Detalle del comprador' },
  { name: 'Transporte', title: 'Rutas de transporte' },
  { name: 'EstadoVias', title: 'Estado de vías' },
  { name: 'HistorialDespachos', title: 'Historial de despachos' },
  { name: 'Lotes', title: 'Mis lotes' },
  { name: 'Produccion', title: 'Registro de producción' },
  { name: 'Pronosticos', title: 'Pronósticos de producción' },
  { name: 'Alertas', title: 'Alertas de cosecha' },
];

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="PalmicultorDashboard"
          component={PalmicultorDashboard}
          options={{ headerShown: false }}
        />

        {PLACEHOLDER_ROUTES.map(({ name, title }) => (
          <Stack.Screen
            key={name}
            name={name}
            component={PlaceholderScreen}
            initialParams={{ title }}
            options={{ title }}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
