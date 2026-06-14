import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Period } from '../types';
import { useMeasurements } from '../context/MeasurementContext';

type Field = 'systolic' | 'diastolic' | 'pulse';

const FIELD_LABELS: Record<Field, string> = {
  systolic: '上の血圧',
  diastolic: '下の血圧',
  pulse: '脈拍',
};

const FIELD_RANGES: Record<Field, { min: number; max: number }> = {
  systolic: { min: 60, max: 250 },
  diastolic: { min: 40, max: 150 },
  pulse: { min: 30, max: 220 },
};

const FIELDS: Field[] = ['systolic', 'diastolic', 'pulse'];

type InitialValues = { systolic: number; diastolic: number; pulse: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  targetDate?: string;
  targetPeriod?: Period;
  initialValues?: InitialValues;
};

function isOutOfRange(field: Field, raw: string): boolean {
  if (!raw) return false;
  const val = parseInt(raw, 10);
  const { min, max } = FIELD_RANGES[field];
  return val < min || val > max;
}

export default function InputDialog({ visible, onClose, targetDate, targetPeriod, initialValues }: Props) {
  const { addMeasurement, addMeasurementForDate } = useMeasurements();
  const [values, setValues] = useState<Record<Field, string>>({ systolic: '', diastolic: '', pulse: '' });
  const [activeField, setActiveField] = useState<Field>('systolic');

  useEffect(() => {
    if (visible) {
      setValues({ systolic: '', diastolic: '', pulse: '' });
      setActiveField('systolic');
    }
  }, [visible]);

  const activeIsError = isOutOfRange(activeField, values[activeField]);

  function pressKey(key: string) {
    if (values[activeField].length < 3) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setValues((prev) => {
      const current = prev[activeField];
      if (current.length >= 3) return prev;
      return { ...prev, [activeField]: current + key };
    });
  }

  function pressDelete() {
    setValues((prev) => ({
      ...prev,
      [activeField]: prev[activeField].slice(0, -1),
    }));
  }

  function pressEnter() {
    if (activeIsError) return;
    const currentIdx = FIELDS.indexOf(activeField);
    if (currentIdx < FIELDS.length - 1) {
      setActiveField(FIELDS[currentIdx + 1]);
    } else {
      handleSave();
    }
  }

  function handleSave() {
    const sys = parseInt(values.systolic, 10);
    const dia = parseInt(values.diastolic, 10);
    const pul = parseInt(values.pulse, 10);
    if (!sys || !dia || !pul) return;
    if (targetDate && targetPeriod) {
      addMeasurementForDate(targetDate, targetPeriod, sys, dia, pul);
    } else {
      addMeasurement(sys, dia, pul);
    }
    handleClose();
  }

  function handleClose() {
    setValues({ systolic: '', diastolic: '', pulse: '' });
    setActiveField('systolic');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>

        {/* 表示部 */}
        <View style={styles.fieldsSection}>
          {FIELDS.map((field) => (
            <TouchableOpacity
              key={field}
              style={[
                styles.fieldRow,
                activeField === field && styles.fieldRowActive,
                isOutOfRange(field, values[field]) && styles.fieldRowError,
              ]}
              onPress={() => setActiveField(field)}
            >
              <Text style={styles.fieldLabel}>{FIELD_LABELS[field]}</Text>
              {initialValues != null && (
                <Text style={styles.prevValue}>{initialValues[field]}</Text>
              )}
              <Text style={[styles.fieldValue, isOutOfRange(field, values[field]) && styles.fieldValueError]}>
                {values[field] || '---'}
              </Text>
            </TouchableOpacity>
          ))}
          {initialValues != null && (
            <Text style={styles.recordedLabel}>記録済みの値</Text>
          )}
        </View>

        {/* 数値入力部 */}
        <View style={styles.keypadSection}>
          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
              <Pressable
                key={k}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                onPress={() => pressKey(k)}
              >
                <Text style={styles.keyText}>{k}</Text>
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              onPress={pressDelete}
            >
              <Text style={styles.keyText}>⌫</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              onPress={() => pressKey('0')}
            >
              <Text style={styles.keyText}>0</Text>
            </Pressable>
            <Pressable
              style={[styles.key, styles.keyEnter, activeIsError && styles.keyEnterDisabled]}
              onPress={pressEnter}
              disabled={activeIsError}
            >
              <Text style={[styles.keyText, styles.keyEnterText]}>
                {activeField === 'pulse' ? '保存' : '次へ'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 閉じるボタン */}
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeText}>閉じる</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fieldsSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
    gap: 10,
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
  prevValue: {
    fontSize: 22,
    color: '#999',
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  recordedLabel: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  keypadSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  key: {
    width: '30%',
    aspectRatio: 1.6,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
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
  closeBtn: {
    margin: 16,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 22,
    color: '#555',
    fontWeight: '600',
  },
});
