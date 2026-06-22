import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { hapticSave, hapticKeyPress } from '../haptics';
import HapticButton from './HapticButton';
import { Goals } from '../types';
import { useLocale } from '../context/LocaleContext';
import { useNumericKeypad, BP_RANGES } from '../hooks/useNumericKeypad';
import Keypad from './Keypad';
import { dialogStyles } from './dialogStyles';

type Field = 'systolic' | 'diastolic';

const FIELDS: Field[] = ['systolic', 'diastolic'];

type Props = {
  visible: boolean;
  initialField: Field;
  currentGoals: Goals;
  onSave: (goals: Goals) => void;
  onClose: () => void;
};

export default function GoalInputDialog({ visible, initialField, currentGoals, onSave, onClose }: Props) {
  const { t } = useLocale();
  const {
    values, activeField, setActiveField, isOutOfRange,
    pressKey, pressDelete, advanceField, reset,
    activeIsError, isLastField,
  } = useNumericKeypad(FIELDS, BP_RANGES);

  const fieldLabels: Record<Field, string> = {
    systolic: t('field_systolic'),
    diastolic: t('field_diastolic'),
  };

  useEffect(() => {
    if (visible) reset(initialField);
  }, [visible, initialField]);

  function pressEnter() {
    if (activeIsError) return;
    if (isLastField) {
      handleSave();
    } else {
      hapticKeyPress();
      advanceField();
    }
  }

  function handleSave() {
    const sys = parseInt(values.systolic, 10);
    const dia = parseInt(values.diastolic, 10);
    // 未入力・範囲外フィールドは現在値を維持する。
    onSave({
      systolic: !isNaN(sys) && !isOutOfRange('systolic', values.systolic) ? sys : currentGoals.systolic,
      diastolic: !isNaN(dia) && !isOutOfRange('diastolic', values.diastolic) ? dia : currentGoals.diastolic,
    });
    hapticSave();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SafeAreaView style={dialogStyles.container}>

        <View style={dialogStyles.dialogHeader}>
          <Text style={dialogStyles.recordedLabelTop}>{t('current_target')}</Text>
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
              <Text style={dialogStyles.prevValue}>{currentGoals[field]}</Text>
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
          enterDisabled={activeIsError}
        />

        <HapticButton style={styles.closeBtn} onPress={onClose}>
          <Text style={dialogStyles.closeText}>{t('close')}</Text>
        </HapticButton>

      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fieldsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 10,
  },
  closeBtn: {
    margin: 16,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
});
