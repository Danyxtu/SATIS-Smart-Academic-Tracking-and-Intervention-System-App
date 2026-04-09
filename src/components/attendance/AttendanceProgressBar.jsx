import React from "react";
import { View, StyleSheet } from "react-native";

const AttendanceProgressBar = ({ rate }) => {
  let barColor = "#10B981"; // green
  if (rate < 90) barColor = "#F59E0B"; // yellow
  if (rate < 80) barColor = "#EF4444"; // red

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.fill,
          {
            width: `${rate}%`,
            backgroundColor: barColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});

export default AttendanceProgressBar;
