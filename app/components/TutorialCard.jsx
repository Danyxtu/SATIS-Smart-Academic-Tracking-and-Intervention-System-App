import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";

/**
 * TutorialCard - A reusable card component for the Learn More page
 *
 * Props:
 * - title: string - Card title
 * - description: string - Card description
 * - icon: Component - Lucide icon component
 * - color: string - Accent color for the card
 * - stepCount: number - Number of tutorial steps
 * - onPress: function - Called when card is pressed
 */
const TutorialCard = ({
  title,
  description,
  icon: IconComponent,
  color = "#DB2777",
  stepCount = 0,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        {IconComponent && (
          <IconComponent size={28} color={color} strokeWidth={1.5} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        {stepCount > 0 && (
          <View style={styles.stepBadge}>
            <Text style={[styles.stepText, { color }]}>
              {stepCount} {stepCount === 1 ? "step" : "steps"}
            </Text>
          </View>
        )}
      </View>

      {/* Arrow */}
      <View style={[styles.arrowContainer, { backgroundColor: `${color}10` }]}>
        <ChevronRight size={20} color={color} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  stepBadge: {
    marginTop: 8,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TutorialCard;
