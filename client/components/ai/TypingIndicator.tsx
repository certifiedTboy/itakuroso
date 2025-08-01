import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  interface CreateAnimation {
    (animatedValue: Animated.Value, delay: number): Animated.CompositeAnimation;
  }

  const createAnimation: CreateAnimation = (animatedValue, delay) => {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animatedValue, {
          toValue: -5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    );
  };

  useEffect(() => {
    createAnimation(dot1, 0).start();
    createAnimation(dot2, 100).start();
    createAnimation(dot3, 200).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.dot, { transform: [{ translateY: dot1 }] }]}
      />
      <Animated.View
        style={[styles.dot, { transform: [{ translateY: dot2 }] }]}
      />
      <Animated.View
        style={[styles.dot, { transform: [{ translateY: dot3 }] }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 20,
    padding: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#aaa",
    marginHorizontal: 4,
  },
});

export default TypingIndicator;
