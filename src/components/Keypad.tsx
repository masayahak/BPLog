import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import BackspaceIcon from './icons/BackspaceIcon';

type KeypadProps = {
  onKey: (k: string) => void;
  onDelete: () => void;
};

const NUMBER_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

// テンキー（入力ダイアログ・目標値ダイアログ共通）。数字と削除のみを持ち、
// 保存/次への操作は呼び出し側がKeypadの外に独立したボタンとして描画する。
export default function Keypad({ onKey, onDelete }: KeypadProps) {
  return (
    <View style={styles.keypadSection}>
      {NUMBER_ROWS.map((row, rowIndex) => (
        <View key={row[0]} style={styles.keyRow}>
          {row.map((k, colIndex) => (
            <Pressable
              key={k}
              style={({ pressed }) => [
                styles.key,
                colIndex < row.length - 1 && styles.keyBorderRight,
                rowIndex < NUMBER_ROWS.length && styles.keyBorderBottom,
                pressed && styles.keyPressed,
              ]}
              onPress={() => onKey(k)}
            >
              <Text style={styles.keyText}>{k}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <View style={styles.keyRow}>
        <Pressable
          style={({ pressed }) => [styles.key, styles.keyBorderRight, pressed && styles.keyPressed]}
          onPress={onDelete}
        >
          <BackspaceIcon color={colors.textSecondary} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.key, styles.keyBorderRight, pressed && styles.keyPressed]}
          onPress={() => onKey('0')}
        >
          <Text style={styles.keyText}>0</Text>
        </Pressable>
        <View style={styles.key} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keypadSection: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 400,
  },
  keyRow: {
    flex: 1,
    flexDirection: 'row',
  },
  key: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBorderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.borderSub,
  },
  keyBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSub,
  },
  keyPressed: {
    backgroundColor: colors.borderSub,
  },
  keyText: {
    fontSize: 34,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});
