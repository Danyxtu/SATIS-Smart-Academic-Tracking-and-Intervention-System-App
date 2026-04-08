import { Redirect } from "expo-router";

export default function RootIndex() {
  // The root _layout.jsx handles auth-based redirects.
  // This just ensures the app starts at the auth/landing screen.
  return <Redirect href="/(auth)" />;
}
