import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, TextStyle } from 'react-native';

const ROW_HEIGHT = 82;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../src/components/AppText';
import { useMeasurements } from '../src/context/MeasurementContext';
import { useLocale } from '../src/context/LocaleContext';
import { Measurement, Period } from '../src/types';
import { getMonthDates, getWeekdayLabel, formatMonthHeader, isFuturePeriod, toDateString } from '../src/utils';
import { useMonthNav } from '../src/hooks/useMonthNav';
import { useDoubleTap } from '../src/hooks/useDoubleTap';
import { useNow } from '../src/hooks/useNow';
import { hapticKeyPress } from '../src/haptics';
import HapticButton from '../src/components/HapticButton';
import InputDialog from '../src/components/InputDialog';
import ChevronIcon from '../src/components/icons/ChevronIcon';
import { colors } from '../src/theme/colors';

const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

export default function MonthlyScreen() {
  const { measurements } = useMeasurements();
  const { locale, t } = useLocale();
  const insets = useSafeAreaInsets();
  const { now, year, month, prevMonth, nextMonth, canGoNext } = useMonthNav();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<{ date: string; period: Period } | null>(null);
  const [dialogInitial, setDialogInitial] = useState<{ systolic: number; diastolic: number; pulse: number } | undefined>();
  const detectDoubleTap = useDoubleTap();
  const flatListRef = useRef<FlatList>(null);
  const todayStr = toDateString(useNow());

  useEffect(() => {
    if (year === now.getFullYear() && month === now.getMonth() + 1) {
      const todayIndex = now.getDate() - 1;
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: todayIndex,
          animated: false,
          viewPosition: 0.5,
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [year, month, now]);

  const dates = getMonthDates(year, month);
  const rows = dates.map((date) => ({
    date,
    am: measurements.find((m) => m.date === date && m.period === 'AM'),
    pm: measurements.find((m) => m.date === date && m.period === 'PM'),
  }));

  type Row = { date: string; am?: Measurement; pm?: Measurement };

  function handleCellTap(date: string, period: Period) {
    if (isFuturePeriod(date, period)) return;
    if (!detectDoubleTap(`${date}-${period}`)) return;
    hapticKeyPress();
    const existing = measurements.find((m) => m.date === date && m.period === period);
    setDialogTarget({ date, period });
    setDialogInitial(existing ? { systolic: existing.systolic, diastolic: existing.diastolic, pulse: existing.pulse } : undefined);
    setDialogVisible(true);
  }

  function renderRow({ item }: { item: Row }) {
    const w = getWeekdayLabel(item.date, locale);
    const dd = String(parseInt(item.date.slice(8, 10), 10));
    const isToday = item.date === todayStr;

    return (
      <View style={styles.row}>
        <View style={styles.dateCol}>
          <Text style={[styles.dateMain, isToday && styles.dateMainToday]}>
            {dd} <Text style={styles.dateWeek}>({w})</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.cellTouchable} onPress={() => handleCellTap(item.date, 'AM')}>
          <DataCell data={item.am} pulseLabel={t('pulse_label')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cellTouchable} onPress={() => handleCellTap(item.date, 'PM')}>
          <DataCell data={item.pm} pulseLabel={t('pulse_label')} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <HapticButton style={styles.navBtn} onPress={prevMonth}>
          <ChevronIcon direction="left" color={colors.textPrimary} />
        </HapticButton>
        <Text style={styles.monthLabel}>{formatMonthHeader(year, month, locale)}</Text>
        <HapticButton style={styles.navBtn} onPress={nextMonth} disabled={!canGoNext}>
          <ChevronIcon direction="right" color={canGoNext ? colors.textPrimary : colors.infoBorder} />
        </HapticButton>
      </View>

      <View style={styles.colHeader}>
        <View style={styles.dateCol} />
        <View style={styles.periodHeader}>
          <Text style={styles.periodHeaderText}>{t('am')}</Text>
        </View>
        <View style={styles.periodHeader}>
          <Text style={styles.periodHeaderText}>{t('pm')}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={rows}
        keyExtractor={(item) => item.date}
        renderItem={renderRow}
        style={styles.list}
        getItemLayout={(_, index) => ({
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * index,
          index,
        })}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index,
              animated: false,
              viewPosition: 0.5,
            });
          }, 200);
        }}
      />

      <InputDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        targetDate={dialogTarget?.date}
        targetPeriod={dialogTarget?.period}
        initialValues={dialogInitial}
      />
    </View>
  );
}

function DataCell({ data, pulseLabel }: { data?: Measurement; pulseLabel: string }) {
  return (
    <View style={styles.dataCell}>
      {data ? (
        <>
          <Text style={styles.bpText}>
            <Text style={[styles.systolicText, tabularNums]}>{data.systolic}</Text>
            <Text style={styles.bpSep}> / </Text>
            <Text style={[styles.diastolicText, tabularNums]}>{data.diastolic}</Text>
          </Text>
          <Text style={[styles.pulseText, tabularNums]}>{pulseLabel} {data.pulse}</Text>
        </>
      ) : (
        <Text style={styles.emptyDash}>—</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 18,
  },
  monthLabel: { fontSize: 27, fontWeight: '700', color: colors.textPrimary },
  navBtn: { padding: 4 },

  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain,
  },
  dateCol: {
    width: 74,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  periodHeader: { flex: 1, alignItems: 'center' },
  periodHeaderText: { fontSize: 18, color: colors.textLabel, fontWeight: '600' },

  list: { flex: 1 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSub,
    height: ROW_HEIGHT,
    paddingHorizontal: 22,
  },

  dateMain: { fontSize: 19, fontWeight: '600', color: colors.textSecondary },
  dateMainToday: { fontWeight: '700', color: colors.textPrimary },
  dateWeek: { fontSize: 16, fontWeight: '600', color: colors.textLabel },

  cellTouchable: { flex: 1 },

  dataCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpText: { fontSize: 27, fontWeight: '600' },
  systolicText: { color: colors.systolic },
  bpSep: { color: colors.decoration, fontWeight: '300', fontSize: 22 },
  diastolicText: { color: colors.diastolic },
  pulseText: { fontSize: 19, color: colors.textPrimary, fontWeight: '500', marginTop: 6 },
  emptyDash: { fontSize: 20, color: colors.decoration, fontWeight: '500' },
});
