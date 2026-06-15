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

export function useNumericKeypad<F extends string>(fields: readonly F[], ranges: Record<F, Range>) {
  const emptyValues = () => Object.fromEntries(fields.map((f) => [f, ''])) as Record<F, string>;
  const [values, setValues] = useState<Record<F, string>>(emptyValues);
  const [activeField, setActiveField] = useState<F>(fields[0]);

  function isOutOfRange(field: F, raw: string): boolean {
    if (!raw) return false;
    const val = parseInt(raw, 10);
    return val < ranges[field].min || val > ranges[field].max;
  }

  // active には開始フィールドを指定できる（GoalInputDialog はタップされた行から開始する）。
  function reset(active: F = fields[0]) {
    setValues(emptyValues());
    setActiveField(active);
  }

  function pressKey(key: string) {
    if (values[activeField].length >= MAX_DIGITS) return;
    hapticKeyPress();
    setValues((prev) => ({ ...prev, [activeField]: prev[activeField] + key }));
  }

  function pressDelete() {
    hapticDelete();
    setValues((prev) => ({ ...prev, [activeField]: prev[activeField].slice(0, -1) }));
  }

  function advanceField() {
    const i = fields.indexOf(activeField);
    if (i < fields.length - 1) setActiveField(fields[i + 1]);
  }

  const activeIsError = isOutOfRange(activeField, values[activeField]);
  const isLastField = fields.indexOf(activeField) === fields.length - 1;
  const allFieldsValid = fields.every((f) => values[f] !== '' && !isOutOfRange(f, values[f]));

  return {
    values,
    activeField,
    setActiveField,
    isOutOfRange,
    pressKey,
    pressDelete,
    advanceField,
    reset,
    activeIsError,
    isLastField,
    allFieldsValid,
  };
}
