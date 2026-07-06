import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle, StyleProp } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: "#e2e8f0",
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export default Skeleton;
