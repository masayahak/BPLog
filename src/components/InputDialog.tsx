import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticKeyPress, hapticSave } from '../haptics';
import { Period } from '../types';
import { useMeasurements } from '../context/MeasurementContext';
import { useLocale } from '../context/LocaleContext';
import { useNumericKeypad, BP_RANGES } from '../hooks/useNumericKeypad';
import Keypad from './Keypad';
import HapticButton from './HapticButton';
import { dialogStyles } from './dialogStyles';

type Field = 'systolic' | 'diastolic' | 'pulse';

const FIELDS: Field[] = ['systolic', 'diastolic', 'pulse'];

type InitialValues = { systolic: number; diastolic: number; pulse: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  targetDate?: string;
  targetPeriod?: Period;
  initialValues?: InitialValues;
};

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
  const { addMeasurementForDate, deleteMeasurement } = useMeasurements();
  const { t } = useLocale();
  const {
    values, activeField, setActiveField, isOutOfRange,
    pressKey, pressDelete, advanceField, reset,
    activeIsError, isLastField, allFieldsValid,
  } = useNumericKeypad(FIELDS, BP_RANGES, { autoAdvance: true });

  const fieldLabels: Record<Field, string> = {
    systolic: t('field_systolic'),
    diastolic: t('field_diastolic'),
    pulse: t('field_pulse'),
  };

  useEffect(() => {
    if (visible) reset();
  }, [visible]);

  // 最終フィールド(保存)では全フィールドの妥当性で判定。範囲外/空の非アクティブ値の保存を防ぐ。
  const enterDisabled = isLastField ? !allFieldsValid : activeIsError;

  function pressEnter() {
    if (enterDisabled) return;
    if (isLastField) {
      handleSave();
    } else {
      hapticKeyPress();
      advanceField();
    }
  }

  function handleSave() {
    if (!targetDate || !targetPeriod) return;
    addMeasurementForDate(
      targetDate,
      targetPeriod,
      parseInt(values.systolic, 10),
      parseInt(values.diastolic, 10),
      parseInt(values.pulse, 10)
    );
    hapticSave();
    handleClose();
  }

  function handleClose() {
    reset();
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
                <HapticButton
                  style={styles.deleteBtn}
                  onPress={handleDelete}
                  accessibilityRole="button"
                  accessibilityLabel={t('delete_record')}
                >
                  <TrashIcon size={24} color="#fff" />
                </HapticButton>
              )}
              <Text style={dialogStyles.recordedLabelTop}>{t('recorded_value')}</Text>
            </>
          )}
        </View>

        <View style={styles.fieldsSection}>
          {FIELDS.map((field) => (
            <HapticButton
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
            </HapticButton>
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

        <HapticButton style={styles.closeBtn} onPress={handleClose}>
          <Text style={dialogStyles.closeText}>{t('close')}</Text>
        </HapticButton>

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
