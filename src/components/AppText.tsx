import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

// OS側の文字サイズ拡大設定に関わらず、アプリが定めたfontSizeで固定表示する。
export function Text({ allowFontScaling = false, ...props }: TextProps) {
  return <RNText allowFontScaling={allowFontScaling} {...props} />;
}
