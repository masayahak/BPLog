import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticKeyPress, hapticDelete, hapticSave } from '../haptics';
import { Period } from '../types';
import { useMeasurements } from '../context/MeasurementContext';
import { useLocale } from '../context/LocaleContext';

type Field = 'systolic' | 'diastolic' | 'pulse';

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

function TrashIcon({ size = 26, color = '#e63946' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
        fill={color}
      />
    </Svg>
  );
}

export default function InputDialog({ visible, onClose, targetDate, targetPeriod, initialValues }: Props) {
  const { addMeasurement, addMeasurementForDate, deleteMeasurement } = useMeasurements();
  const { t } = useLocale();
  const [values, setValues] = useState<Record<Field, string>>({ systolic: '', diastolic: '', pulse: '' });
  const [activeField, setActiveField] = useState<Field>('systolic');

  const fieldLabels: Record<Field, string> = {
    systolic: t('field_systolic'),
    diastolic: t('field_diastolic'),
    pulse: t('field_pulse'),
  };

  useEffect(() => {
    if (visible) {
      setValues({ systolic: '', diastolic: '', pulse: '' });
      setActiveField('systolic');
    }
  }, [visible]);

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
    const pul = parseInt(values.pulse, 10);
    if (!sys || !dia || !pul) return;
    if (targetDate && targetPeriod) {
      addMeasurementForDate(targetDate, targetPeriod, sys, dia, pul);
    } else {
      addMeasurement(sys, dia, pul);
    }
    hapticSave();
    handleClose();
  }

  function handleClose() {
    setValues({ systolic: '', diastolic: '', pulse: '' });
    setActiveField('systolic');
    onClose();
  }

  function handleDelete() {
    if (!targetDate || !targetPeriod) return;
    Alert.alert('', t('delete_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete_record'),
        style: 'destructive',
        onPress: () => {
          deleteMeasurement(targetDate, targetPeriod);
          hapticKeyPress();
          handleClose();
        },
      },
    ]);
  }

  const canDelete = initialValues != null && !!targetDate && !!targetPeriod;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>

        <View style={styles.dialogHeader}>
          {initialValues != null && (
            <>
              {canDelete && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={handleDelete}
                  accessibilityRole="button"
                  accessibilityLabel={t('delete_record')}
                >
                  <TrashIcon size={24} color="#fff" />
                </TouchableOpacity>
              )}
              <Text style={styles.recordedLabelTop}>{t('recorded_value')}</Text>
            </>
          )}
        </View>

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
              {initialValues != null && (
                <Text style={styles.prevValue}>{initialValues[field]}</Text>
              )}
              <Text style={[styles.fieldValue, isOutOfRange(field, values[field]) && styles.fieldValueError]}>
                {values[field] || '---'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.keypadFiller} />

        <View style={styles.keypadSection}>
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row) => (
            <View key={row[0]} style={styles.keyRow}>
              {row.map((k) => (
                <Pressable
                  key={k}
                  style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                  onPress={() => pressKey(k)}
                >
                  <Text style={styles.keyText}>{k}</Text>
                </Pressable>
              ))}
            </View>
          ))}
          <View style={styles.keyRow}>
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
                {activeField === 'pulse' ? t('save') : t('next')}
              </Text>
            </Pressable>
          </View>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeText}>{t('close')}</Text>
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
  dialogHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  deleteBtn: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e63946',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 8,
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
  closeBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 16,
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
