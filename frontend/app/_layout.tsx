import { Stack } from 'expo-router';
import { LogBox } from 'react-native';

// In dev builds, Expo wraps the app with `useKeepAwake` to keep the screen on.
// On Android there's a race where the native activate() is called before the
// activity is ready, causing an unhandled rejection. This is a known Expo SDK
// issue that doesn't affect functionality — suppress it so it doesn't pollute
// the log output.
LogBox.ignoreLogs(['Unable to activate keep awake']);

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
