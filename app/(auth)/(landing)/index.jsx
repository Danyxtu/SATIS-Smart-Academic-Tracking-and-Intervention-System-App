import React from "react";
import { SafeAreaView, StyleSheet, View, Text } from "react-native";
import PagerView from "react-native-pager-view";
import Screen1 from "./screen1";
import Screen2 from "./screen2";
import Screen3 from "./screen3";

const LandingIndex = () => {
  return (
    <SafeAreaView style={styles.container}>
      <PagerView style={styles.pagerView} initialPage={0}>
        <View key="1">
          <Screen1 />
        </View>
        <View key="2">
          <Screen2 />
        </View>
        <View key="3">
          <Screen3 />
        </View>
      </PagerView>
      {/* Simple pagination dots could be added here if desired */}
      <View style={styles.indicatorContainer}>
        <Text style={styles.indicatorText}>• ○ ○</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  pagerView: {
    flex: 1,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorText: {
    fontSize: 30,
    color: "#007AFF",
  },
});

export default LandingIndex;
