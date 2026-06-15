import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type KeypadProps = {
  onKey: (k: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  enterLabel: string;     // t('next') | t('save')
  enterDisabled: boolean; // 保存可否の判定は呼び出し側が行う
};

const NUMBER_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

// テンキー（入力ダイアログ・目標値ダイアログ共通）。
// flex グリッドで画面高に追従する。ハプティクスは呼び出し側ハンドラに含める。
export default function Keypad({ onKey, onDelete, onEnter, enterLabel, enterDisabled }: KeypadProps) {
  return (
    <View style={styles.keypadSection}>
      {NUMBER_ROWS.map((row) => (
        <View key={row[0]} style={styles.keyRow}>
          {row.map((k) => (
            <Pressable
              key={k}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              onPress={() => onKey(k)}
            >
              <Text style={styles.keyText}>{k}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <View style={styles.keyRow}>
        <Pressable
          style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          onPress={onDelete}
        >
          <Text style={styles.keyText}>⌫</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          onPress={() => onKey('0')}
        >
          <Text style={styles.keyText}>0</Text>
        </Pressable>
        <Pressable
          style={[styles.key, styles.keyEnter, enterDisabled && styles.keyEnterDisabled]}
          onPress={onEnter}
          disabled={enterDisabled}
        >
          <Text style={[styles.keyText, styles.keyEnterText]}>{enterLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keypadSection: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 400,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  keyRow: {
    flex: 1,
    flexDirection: 'row',
  },
  key: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  keyPressed: {
    backgroundColor: '#d0d0d0',
  },
  keyEnter: {
    backgroundColor: '#4361ee',
  },
  keyEnterDisabled: {
    backgroundColor: '#b0b0b0',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  keyEnterText: {
    color: '#fff',
    fontSize: 22,
  },
});
