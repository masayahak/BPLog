import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// 入力ダイアログ（InputDialog）と目標値ダイアログ（GoalInputDialog）で共通のスタイル。
// テンキー本体のスタイルは Keypad コンポーネント側に置く。
export const dialogStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSub,
  },
  fieldRowActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.textPrimary,
  },
  fieldRowError: {
    borderBottomColor: colors.systolic,
  },
  fieldLabel: {
    fontSize: 21,
    color: colors.textLabel,
    fontWeight: '600',
  },
  fieldLabelActive: {
    color: colors.textPrimary,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  fieldValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 80,
    textAlign: 'right',
    letterSpacing: -1,
  },
  fieldValueError: {
    color: colors.systolic,
  },
  fieldValuePending: {
    // 「選択中＝次の打鍵で全置換」を示す。面を使わず文字色だけで表現する。
    color: colors.textSecondary,
  },
  caret: {
    width: 3,
    height: 34,
    backgroundColor: colors.textPrimary,
  },
  prevValue: {
    fontSize: 21,
    color: colors.textPlaceholder,
    flex: 1,
    textAlign: 'right',
    marginRight: 16,
    fontWeight: '600',
  },
  keypadFiller: {
    flexGrow: 1,
  },
  saveButton: {
    height: 64,
    backgroundColor: colors.buttonBg,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: colors.decoration,
  },
  saveButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.buttonText,
  },
  closeText: {
    fontSize: 19,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
