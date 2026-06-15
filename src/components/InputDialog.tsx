import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticKeyPress, hapticDelete, hapticSave } from '../haptics';
import { Period } from '../types';
import { useMeasurements } from '../context/MeasurementContext';
import { useLocale } from '../context/LocaleContext';
import Keypad from './Keypad';
import { dialogStyles } from './dialogStyles';

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
  const allFieldsValid = FIELDS.every((f) => values[f] !== '' && !isOutOfRange(f, values[f]));
  const isLastField = FIELDS.indexOf(activeField) === FIELDS.length - 1;
  // 最終フィールド(保存)では全フィールドの妥当性で判定。範囲外/空の非アクティブ値の保存を防ぐ。
  const enterDisabled = isLastField ? !allFieldsValid : activeIsError;

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
    if (enterDisabled) return;
    if (isLastField) {
      handleSave();
    } else {
      setActiveField(FIELDS[FIELDS.indexOf(activeField) + 1]);
    }
  }

  function handleSave() {
    const sys = parseInt(values.systolic, 10);
    const dia = parseInt(values.diastolic, 10);
    const pul = parseInt(values.pulse, 10);
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
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SafeAreaView style={dialogStyles.container}>

        <View style={dialogStyles.dialogHeader}>
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
              <Text style={dialogStyles.recordedLabelTop}>{t('recorded_value')}</Text>
            </>
          )}
        </View>

        <View style={styles.fieldsSection}>
          {FIELDS.map((field) => (
            <TouchableOpacity
              key={field}
              style={[
                dialogStyles.fieldRow,
                activeField === field && dialogStyles.fieldRowActive,
                isOutOfRange(field, values[field]) && dialogStyles.fieldRowError,
              ]}
              onPress={() => setActiveField(field)}
            >
              <Text style={dialogStyles.fieldLabel}>{fieldLabels[field]}</Text>
              {initialValues != null && (
                <Text style={dialogStyles.prevValue}>{initialValues[field]}</Text>
              )}
              <Text style={[dialogStyles.fieldValue, isOutOfRange(field, values[field]) && dialogStyles.fieldValueError]}>
                {values[field] || '---'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={dialogStyles.keypadFiller} />

        <Keypad
          onKey={pressKey}
          onDelete={pressDelete}
          onEnter={pressEnter}
          enterLabel={isLastField ? t('save') : t('next')}
          enterDisabled={enterDisabled}
        />

        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={dialogStyles.closeText}>{t('close')}</Text>
        </TouchableOpacity>

      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  closeBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
});
