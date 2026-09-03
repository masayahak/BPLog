import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = { color: string; size?: number };

// テンキー削除キー用のバックスペースアイコン。
export default function BackspaceIcon({ color, size = 34 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <Path d="M9 5h11v14H9L3 12z" />
      <Path d="M12.5 9.5l5 5M17.5 9.5l-5 5" />
    </Svg>
  );
}
