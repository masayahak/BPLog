import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { Text } from './AppText';
import { hapticKeyPress, hapticSave } from '../haptics';
import { Period } from '../types';
import { useMeasurements } from '../context/MeasurementContext';
import { useLocale } from '../context/LocaleContext';
import { useNumericKeypad, BP_RANGES } from '../hooks/useNumericKeypad';
import Keypad from './Keypad';
import HapticButton from './HapticButton';
import { dialogStyles } from './dialogStyles';
import { colors } from '../theme/colors';

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

export default function InputDialog({ visible, onClose, targetDate, targetPeriod, initialValues }: Props) {
  const { addMeasurementForDate, deleteMeasurement } = useMeasurements();
  const { t } = useLocale();
  const {
    values, selected, activeField, setActiveField, isOutOfRange,
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

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {canDelete && (
              <HapticButton style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={dialogStyles.closeText}>{t('delete_record')}</Text>
              </HapticButton>
            )}
          </View>
          <HapticButton style={styles.headerBtn} onPress={handleClose}>
            <Text style={dialogStyles.closeText}>{t('close')}</Text>
          </HapticButton>
        </View>

        <View style={styles.fieldsSection}>
          {FIELDS.map((field, index) => {
            const isActive = activeField === field;
            const isPending = isActive && selected[field];
            const isLastRow = index === FIELDS.length - 1;
            return (
              <HapticButton
                key={field}
                style={[
                  dialogStyles.fieldRow,
                  isLastRow && styles.fieldRowLast,
                  isActive && dialogStyles.fieldRowActive,
                  isOutOfRange(field, values[field]) && dialogStyles.fieldRowError,
                ]}
                onPress={() => setActiveField(field)}
              >
                <Text style={[dialogStyles.fieldLabel, isActive && dialogStyles.fieldLabelActive]}>{fieldLabels[field]}</Text>
                {initialValues != null && (
                  <Text style={dialogStyles.prevValue}>{initialValues[field]}</Text>
                )}
                <View style={dialogStyles.fieldValueRow}>
                  <Text
                    style={[
                      dialogStyles.fieldValue,
                      { color: values[field] ? colors.textPrimary : colors.textPlaceholder },
                      isPending && dialogStyles.fieldValuePending,
                      isOutOfRange(field, values[field]) && dialogStyles.fieldValueError,
                    ]}
                  >
                    {values[field] || '---'}
                  </Text>
                  {isActive && <View style={dialogStyles.caret} />}
                </View>
              </HapticButton>
            );
          })}
        </View>

        <View style={dialogStyles.keypadFiller} />

        <Keypad onKey={pressKey} onDelete={pressDelete} />

        <HapticButton
          style={[dialogStyles.saveButton, enterDisabled && dialogStyles.saveButtonDisabled]}
          onPress={pressEnter}
          disabled={enterDisabled}
        >
          <Text style={dialogStyles.saveButtonText}>{isLastField ? t('save') : t('next')}</Text>
        </HapticButton>

      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerBtn: { paddingVertical: 10, paddingHorizontal: 6 },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.infoBorder,
    borderRadius: 8,
  },
  fieldsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borderMain,
  },
  fieldRowLast: {
    borderBottomColor: colors.borderMain,
  },
});
