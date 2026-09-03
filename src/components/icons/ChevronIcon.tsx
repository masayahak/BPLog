import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = { direction: 'left' | 'right'; color: string; size?: number };

// 月送りヘッダー用の単線chevron。
export default function ChevronIcon({ direction, color, size = 30 }: Props) {
  const d = direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}
