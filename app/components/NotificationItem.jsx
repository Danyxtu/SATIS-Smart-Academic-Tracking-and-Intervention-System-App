import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Bell, CheckCircle } from "lucide-react-native";

export default function NotificationItem({
  notification,
  onPress,
  onMarkRead,
  isHighlighted = false,
}) {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isHighlighted) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    }
  }, [isHighlighted, blinkAnim]);

  const isUnread = !notification.isRead;

  return (
    <Animated.View style={{ opacity: isHighlighted ? blinkAnim : 1 }}>
      <TouchableOpacity
        onPress={() => onPress?.(notification)}
        activeOpacity={0.7}
        style={{
          padding: 14,
          borderRadius: 16,
          backgroundColor: isHighlighted
            ? "#FCE7F3"
            : isUnread
            ? "#FFF5F7"
            : "#FFFFFF",
          marginBottom: 10,
          borderWidth: isHighlighted ? 2 : isUnread ? 1 : 0,
          borderColor: isHighlighted
            ? "#DB2777"
            : isUnread
            ? "#FBCFE8"
            : "transparent",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* Icon */}
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: isUnread ? "#FCE7F3" : "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Bell size={20} color={isUnread ? "#DB2777" : "#6B7280"} />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isUnread ? "700" : "600",
                  color: "#111827",
                  flex: 1,
                  marginRight: 8,
                }}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
              <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                {notification.createdAt}
              </Text>
            </View>

            <Text
              style={{
                color: "#6B7280",
                marginTop: 4,
                fontSize: 13,
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {notification.message}
            </Text>

            <View
              style={{
                marginTop: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                From: {notification.sender}
              </Text>
              {isUnread && (
                <TouchableOpacity
                  onPress={() => onMarkRead?.(notification.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <CheckCircle size={14} color="#DB2777" />
                  <Text
                    style={{
                      color: "#DB2777",
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    Mark read
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
