import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Pressable, StyleSheet, BackHandler, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useThemeColors, layout } from '@/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightPct?: number; // 0–1, default 0.6
}

export function BottomSheet({
  visible,
  onClose,
  children,
  maxHeightPct = 0.6,
}: BottomSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const maxHeight = screenHeight * maxHeightPct;
  const translateY = useSharedValue(maxHeight);
  const overlayOpacity = useSharedValue(0);
  const themeColors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
        sheet: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#11151f',
          borderTopLeftRadius: layout.borderRadiusLg,
          borderTopRightRadius: layout.borderRadiusLg,
          paddingHorizontal: layout.screenPaddingH,
          paddingBottom: 32,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: 'rgba(255,255,255,0.15)',
        },
        handleBar: {
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.3)',
          alignSelf: 'center',
          marginTop: 12,
          marginBottom: 20,
        },
      }),
    [themeColors],
  );

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 180 });
      overlayOpacity.value = withTiming(1, { duration: 150 });
    } else {
      translateY.value = withTiming(maxHeight, { duration: 180 });
      overlayOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, maxHeight]);

  // Android용 back button 인터셉
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > maxHeight * 0.3 || e.velocityY > 500) {
        translateY.value = withTiming(maxHeight, { duration: 180 });
        overlayOpacity.value = withTiming(0, { duration: 180 });
        runOnJS(handleClose)();
      } else {
        translateY.value = withTiming(0, { duration: 180 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Overlay */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.sheet, { maxHeight }, sheetStyle]}>
          <View style={styles.handleBar} />
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
