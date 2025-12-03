import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";

export default function RootIndex() {
  const { user, loading } = useAuth();

  // If auth is loading, you might want to show a spinner,
  // but for now, we just wait or let the layout handle it.

  // If the user is logged in, the _layout.jsx logic will usually handle
  // the redirect, but to be safe, we default to the landing page
  // if no other logic intervenes.

  return <Redirect href="/(auth)/(landing)" />;
}
