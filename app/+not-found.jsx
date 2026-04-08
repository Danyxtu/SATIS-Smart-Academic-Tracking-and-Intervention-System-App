import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View>
        <Text>Screen not found</Text>
        <Link href="/">Go home</Link>
      </View>
    </>
  );
}
