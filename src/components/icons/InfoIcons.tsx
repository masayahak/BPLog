import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { color: string; size?: number };

const STROKE_WIDTH = 1.7;

export function MoneyIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={8} />
      <Path d="M12 7.5v9M9.7 9.3c0-1 1-1.6 2.3-1.6s2.3.6 2.3 1.5-1 1.2-2.3 1.4-2.3.6-2.3 1.6 1 1.6 2.3 1.6 2.3-.6 2.3-1.6" />
    </Svg>
  );
}

export function LockIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={5} y={11} width={14} height={9} rx={2} />
      <Path d="M8 11V7.5a4 4 0 018 0V11" />
      <Path d="M12 14.7v2" />
    </Svg>
  );
}

export function PeopleIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={9} cy={8} r={3} />
      <Path d="M4 19c0-3 2.2-5 5-5s5 2 5 5" />
      <Path d="M15 6.3a3 3 0 010 5.8" />
      <Path d="M17 14c2 .3 3.5 2.2 3.5 5" />
    </Svg>
  );
}

export function StarIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinejoin="round">
      <Path d="M12 4l2.2 5.2 5.6.5-4.3 3.7 1.3 5.5L12 16l-4.8 2.9 1.3-5.5-4.3-3.7 5.6-.5z" />
    </Svg>
  );
}

export function MailIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={4} y={6} width={16} height={12} rx={2} />
      <Path d="M4 7.5l8 6 8-6" />
    </Svg>
  );
}

export function LinkIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9.5 14.5l5-5" />
      <Path d="M8 12.5a3 3 0 010-4.2l2-2a3 3 0 014.2 4.2l-1 1" />
      <Path d="M16 11.5a3 3 0 010 4.2l-2 2a3 3 0 01-4.2-4.2l1-1" />
    </Svg>
  );
}
