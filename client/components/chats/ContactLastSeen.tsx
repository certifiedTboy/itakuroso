import { Colors } from "@/constants/Colors";
import { formatDate } from "@/helpers/chat-helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Icon from "../ui/Icon";

const ContactLastSeen = ({
  isOnline,
  lastSeenTime,
}: {
  isOnline?: boolean;
  lastSeenTime?: string;
}) => {
  const [showLastSeen, setShowLastSeen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const chatScreenTitleColor = useThemeColor(
    { light: "#000", dark: "#fff" },
    "text"
  );

  useEffect(() => {
    if (!isOnline) {
      // Show last seen for 3 seconds, then hide for 2 seconds
      const showTimer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        setShowLastSeen(true);
      }, 1000);

      const hideTimer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowLastSeen(false);
        });
      }, 4000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    } else {
      // If online, make sure it's hidden
      fadeAnim.setValue(0);
      setShowLastSeen(false);
    }
  }, [isOnline, fadeAnim]);

  return (
    <View style={styles.container}>
      {isOnline ? (
        <View
          style={{
            flexDirection: "row",
            // marginLeft: 20,
            alignItems: "center",
            gap: 5,
            marginTop: 5,
          }}
        >
          <Text
            style={{
              color: chatScreenTitleColor,
              fontWeight: "500",
              fontSize: 12,
              opacity: 0.8,
              marginBottom: 3,
            }}
          >
            Online
          </Text>
          <Icon name="ellipse" color={Colors.dark.btnBgc} size={12} />
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          {showLastSeen && (
            <Text
              style={{
                color: chatScreenTitleColor,
                fontWeight: "500",
                fontSize: 13,
                marginTop: 4,
                opacity: 0.8,
              }}
            >
              Last Seen
              {lastSeenTime &&
                ` ${new Date(lastSeenTime).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
              {" - "}
              {formatDate(lastSeenTime ? String(lastSeenTime) : "")}
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 20, // Fixed height to prevent layout shift
  },
  onlineText: {
    color: "green",
    fontSize: 12,
  },
  lastSeenText: {
    color: "gray",
    fontSize: 12,
  },
});

export default ContactLastSeen;
