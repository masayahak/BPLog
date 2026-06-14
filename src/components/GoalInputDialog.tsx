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
import { hapticKeyPress, hapticDelete, hapticSave } from '../haptics';
import { Goals } from '../types';
import { useLocale } from '../context/LocaleContext';

type Field = 'systolic' | 'diastolic';

const FIELD_RANGES: Record<Field, { min: number; max: number }> = {
  systolic: { min: 60, max: 250 },
  diastolic: { min: 40, max: 150 },
};

const FIELDS: Field[] = ['systolic', 'diastolic'];

type Props = {
  visible: boolean;
  initialField: Field;
  currentGoals: Goals;
  onSave: (goals: Goals) => void;
  onClose: () => void;
};

function isOutOfRange(field: Field, raw: string): boolean {
  if (!raw) return false;
  const val = parseInt(raw, 10);
  const { min, max } = FIELD_RANGES[field];
  return val < min || val > max;
}

export default function GoalInputDialog({ visible, initialField, currentGoals, onSave, onClose }: Props) {
  const { t } = useLocale();
  const [values, setValues] = useState<Record<Field, string>>({ systolic: '', diastolic: '' });
  const [activeField, setActiveField] = useState<Field>(initialField);

  const fieldLabels: Record<Field, string> = {
    systolic: t('field_systolic'),
    diastolic: t('field_diastolic'),
  };

  useEffect(() => {
    if (visible) {
      setValues({ systolic: '', diastolic: '' });
      setActiveField(initialField);
    }
  }, [visible, initialField]);

  const activeIsError = isOutOfRange(activeField, values[activeField]);

  function pressKey(key: string) {
    if (values[activeField].length >= 3) return;
    hapticKeyPress();
    setValues((prev) => ({ ...prev, [activeField]: prev[activeField] + key }));
  }

  function pressDelete() {
    hapticDelete();
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
    onSave({
      systolic: !isNaN(sys) && !isOutOfRange('systolic', values.systolic) ? sys : currentGoals.systolic,
      diastolic: !isNaN(dia) && !isOutOfRange('diastolic', values.diastolic) ? dia : currentGoals.diastolic,
    });
    hapticSave();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>

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
              <Text style={styles.fieldLabel}>{fieldLabels[field]}</Text>
              <Text style={styles.prevValue}>{currentGoals[field]}</Text>
              <Text style={[styles.fieldValue, isOutOfRange(field, values[field]) && styles.fieldValueError]}>
                {values[field] || '---'}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.recordedLabel}>{t('current_target')}</Text>
        </View>

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
                {activeField === 'diastolic' ? t('save') : t('next')}
              </Text>
            </Pressable>
          </View>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>{t('close')}</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
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
  fieldLabel: { fontSize: 22, color: '#555', fontWeight: '600' },
  prevValue: {
    fontSize: 22,
    color: '#999',
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a2e',
    minWidth: 80,
    textAlign: 'right',
  },
  fieldValueError: { color: '#e63946' },
  recordedLabel: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  keypadSection: { paddingHorizontal: 16, paddingBottom: 8 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
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
  keyPressed: { backgroundColor: '#d0d0d0' },
  keyEnter: { backgroundColor: '#4361ee' },
  keyEnterDisabled: { backgroundColor: '#b0b0b0' },
  keyText: { fontSize: 28, fontWeight: '600', color: '#1a1a2e' },
  keyEnterText: { color: '#fff', fontSize: 22 },
  closeBtn: {
    margin: 16,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  closeText: { fontSize: 22, color: '#555', fontWeight: '600' },
});
