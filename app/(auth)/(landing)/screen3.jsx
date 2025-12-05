// This file is kept for backwards compatibility.
// The actual Screen3 content is now rendered inline in index.jsx
// You can safely delete this file if not referenced elsewhere.

import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Screen3 = () => (
  <View style={styles.container}>
    <Text>Screen 3 - Use index.jsx instead</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Screen3;
