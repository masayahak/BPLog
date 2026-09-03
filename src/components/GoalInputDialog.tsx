import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { Text } from './AppText';
import { hapticSave, hapticKeyPress } from '../haptics';
import HapticButton from './HapticButton';
import { Goals } from '../types';
import { useLocale } from '../context/LocaleContext';
import { useNumericKeypad, BP_RANGES } from '../hooks/useNumericKeypad';
import Keypad from './Keypad';
import { dialogStyles } from './dialogStyles';
import { colors } from '../theme/colors';

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
    values, selected, activeField, setActiveField, isOutOfRange,
    pressKey, pressDelete, advanceField, reset,
    activeIsError, isLastField,
  } = useNumericKeypad(FIELDS, BP_RANGES, { autoAdvance: true });

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

        <View style={styles.header}>
          <HapticButton style={styles.headerBtn} onPress={onClose}>
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
                <Text style={dialogStyles.prevValue}>{currentGoals[field]}</Text>
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
          style={[dialogStyles.saveButton, activeIsError && dialogStyles.saveButtonDisabled]}
          onPress={pressEnter}
          disabled={activeIsError}
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBtn: { paddingVertical: 10, paddingHorizontal: 6 },
  fieldsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borderMain,
  },
  fieldRowLast: {
    borderBottomColor: colors.borderMain,
  },
});
