import { Redirect } from 'expo-router';

export default function Index() {
  // El _layout.tsx se encargará de redirigir según el estado de auth
  return <Redirect href="/(tabs)" />;
}
