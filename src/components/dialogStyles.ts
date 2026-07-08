import { StyleSheet } from 'react-native';

// 入力ダイアログ（InputDialog）と目標値ダイアログ（GoalInputDialog）で共通のスタイル。
// テンキー本体のスタイルは Keypad コンポーネント側に置く。
export const dialogStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  dialogHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fieldRowActive: {
    borderColor: '#4361ee',
    backgroundColor: '#eef0ff',
  },
  fieldRowError: {
    borderColor: '#e63946',
    backgroundColor: '#fff0f1',
  },
  fieldLabel: {
    fontSize: 22,
    color: '#555',
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a2e',
    minWidth: 80,
    textAlign: 'right',
  },
  fieldValueError: {
    color: '#e63946',
  },
  fieldValueSelected: {
    backgroundColor: '#cdd6ff',
    borderRadius: 6,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  prevValue: {
    fontSize: 22,
    color: '#999',
    flex: 1,
    textAlign: 'right',
    marginRight: 16,
    fontWeight: '600',
  },
  recordedLabelTop: {
    flex: 1,
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
    textAlign: 'right',
    marginRight: 96,
  },
  keypadFiller: {
    flexGrow: 1,
  },
  closeText: {
    fontSize: 22,
    color: '#555',
    fontWeight: '600',
  },
});
