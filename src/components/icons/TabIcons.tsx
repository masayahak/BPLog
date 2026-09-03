import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

type IconProps = { color: string; size?: number };

const STROKE_WIDTH = 1.7;

export function InputTabIcon({ color, size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round">
      <Rect x={5} y={3.5} width={14} height={17} rx={2.5} />
      <Path d="M9 8.5h6M9 12.5h6M9 16.5h3" />
    </Svg>
  );
}

export function TrendsTabIcon({ color, size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round">
      <Path d="M5 19.5V10M12 19.5V4.5M19 19.5v-6" />
    </Svg>
  );
}

export function ListTabIcon({ color, size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round">
      <Rect x={4} y={5} width={16} height={15} rx={2.5} />
      <Path d="M4 10h16M9 5V3M15 5V3" />
    </Svg>
  );
}

export function GraphTabIcon({ color, size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round">
      <Path d="M4 16l5-5 3.5 3L20 7" />
    </Svg>
  );
}
