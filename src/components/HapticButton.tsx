import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, GestureResponderEvent } from 'react-native';
import { hapticKeyPress } from '../haptics';

// 触覚フィードバック付きのボタン。アプリ内の全ボタンで使う。
// disabled 時は TouchableOpacity が onPress を呼ばないため、触覚も鳴らない。
export default function HapticButton({ onPress, ...rest }: TouchableOpacityProps) {
  function handlePress(e: GestureResponderEvent) {
    hapticKeyPress();
    onPress?.(e);
  }
  return <TouchableOpacity {...rest} onPress={handlePress} />;
}
