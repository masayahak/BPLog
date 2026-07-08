import { useState } from 'react';
import { hapticKeyPress, hapticDelete } from '../haptics';

// テンキー入力ダイアログ（InputDialog・GoalInputDialog）共通の状態とハンドラ。
// 各フィールドは最大3桁。範囲外判定・フィールド送り・リセットをまとめて提供する。
// 「次へ/保存」の押下時挙動と保存処理は呼び出し側が組み立てる。

export type Range = { min: number; max: number };

export const BP_RANGES: Record<'systolic' | 'diastolic' | 'pulse', Range> = {
  systolic: { min: 60, max: 250 },
  diastolic: { min: 40, max: 150 },
  pulse: { min: 30, max: 220 },
};

const MAX_DIGITS = 3;

export function useNumericKeypad<F extends string>(
  fields: readonly F[],
  ranges: Record<F, Range>,
  opts: { autoAdvance?: boolean } = {}
) {
  const emptyValues = () => Object.fromEntries(fields.map((f) => [f, ''])) as Record<F, string>;
  const emptySelected = () => Object.fromEntries(fields.map((f) => [f, false])) as Record<F, boolean>;
  const [values, setValues] = useState<Record<F, string>>(emptyValues);
  // フィールドが「選択中」＝既存の値がまるごと選択され、次の数字入力で置き換わる状態。
  // フォーカスを戻したときに毎回手動で消す手間をなくすためのもの。
  const [selected, setSelected] = useState<Record<F, boolean>>(emptySelected);
  const [activeField, setActiveFieldRaw] = useState<F>(fields[0]);

  function isOutOfRange(field: F, raw: string): boolean {
    if (!raw) return false;
    const val = parseInt(raw, 10);
    return val < ranges[field].min || val > ranges[field].max;
  }

  // 入力済みかつ範囲内 = 有効値。
  function isValid(field: F, raw: string): boolean {
    return raw !== '' && !isOutOfRange(field, raw);
  }

  // フィールド切り替え時、既存の値があれば「選択中」にする。
  function focusField(field: F) {
    setActiveFieldRaw(field);
    setSelected((prev) => ({ ...prev, [field]: values[field] !== '' }));
  }

  // active には開始フィールドを指定できる（GoalInputDialog はタップされた行から開始する）。
  function reset(active: F = fields[0]) {
    setValues(emptyValues());
    setSelected(emptySelected());
    setActiveFieldRaw(active);
  }

  function pressKey(key: string) {
    const isSelected = selected[activeField];
    const current = isSelected ? '' : values[activeField];
    if (current.length >= MAX_DIGITS) return;
    hapticKeyPress();
    const next = current + key;
    setValues((prev) => ({ ...prev, [activeField]: next }));
    if (isSelected) {
      setSelected((prev) => ({ ...prev, [activeField]: false }));
    }
    // 有効値になったら自動で次のフィールドへ送る（最終フィールドは留まる）。
    if (opts.autoAdvance && isValid(activeField, next)) {
      const i = fields.indexOf(activeField);
      if (i < fields.length - 1) focusField(fields[i + 1]);
    }
  }

  function pressDelete() {
    hapticDelete();
    if (selected[activeField]) {
      setValues((prev) => ({ ...prev, [activeField]: '' }));
      setSelected((prev) => ({ ...prev, [activeField]: false }));
    } else {
      setValues((prev) => ({ ...prev, [activeField]: prev[activeField].slice(0, -1) }));
    }
  }

  function advanceField() {
    const i = fields.indexOf(activeField);
    if (i < fields.length - 1) focusField(fields[i + 1]);
  }

  const activeIsError = isOutOfRange(activeField, values[activeField]);
  const isLastField = fields.indexOf(activeField) === fields.length - 1;
  const allFieldsValid = fields.every((f) => values[f] !== '' && !isOutOfRange(f, values[f]));

  return {
    values,
    selected,
    activeField,
    setActiveField: focusField,
    isOutOfRange,
    isValid,
    pressKey,
    pressDelete,
    advanceField,
    reset,
    activeIsError,
    isLastField,
    allFieldsValid,
  };
}
