import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const ROW_HEIGHT = 82;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMeasurements } from '../src/context/MeasurementContext';
import { useLocale } from '../src/context/LocaleContext';
import { Measurement, Period } from '../src/types';
import { getMonthDates, getWeekdayIndex, getWeekdayLabel, getWeekdayColor, formatMonthHeader, isFuturePeriod } from '../src/utils';
import { useMonthNav } from '../src/hooks/useMonthNav';
import { useDoubleTap } from '../src/hooks/useDoubleTap';
import { hapticKeyPress } from '../src/haptics';
import HapticButton from '../src/components/HapticButton';
import InputDialog from '../src/components/InputDialog';

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
    const dayIdx = getWeekdayIndex(item.date);
    const w = getWeekdayLabel(item.date, locale);
    const mm = item.date.slice(5, 7);
    const dd = item.date.slice(8, 10);

    return (
      <View style={styles.row}>
        <View style={styles.dateCol}>
          {locale === 'en' ? (
            <>
              <Text style={[styles.dateWeek, { color: getWeekdayColor(dayIdx) }]}>{w}</Text>
              <Text style={styles.dateMain}>{dd}</Text>
            </>
          ) : (
            <>
              <Text style={styles.dateMain}>{mm}/{dd}</Text>
              <Text style={[styles.dateWeek, { color: getWeekdayColor(dayIdx) }]}>{w}</Text>
            </>
          )}
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
          <Text style={styles.navText}>◀</Text>
        </HapticButton>
        <Text style={styles.monthLabel}>{formatMonthHeader(year, month, locale)}</Text>
        <HapticButton
          style={[styles.navBtn, !canGoNext && styles.navBtnDisabled]}
          onPress={nextMonth}
          disabled={!canGoNext}
        >
          <Text style={[styles.navText, !canGoNext && styles.navTextDisabled]}>▶</Text>
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
    <View style={[styles.dataCell, !data && styles.dataCellEmpty]}>
      {data ? (
        <>
          {data.time ? <Text style={styles.timeText}>{data.time}</Text> : null}
          <Text style={styles.bpText}>
            <Text style={styles.systolicText}>{data.systolic}</Text>
            <Text style={styles.bpSep}>/</Text>
            <Text style={styles.diastolicText}>{data.diastolic}</Text>
          </Text>
          <Text style={styles.pulseText}>{pulseLabel}{data.pulse}</Text>
        </>
      ) : (
        <Text style={styles.emptyDash}>—</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  monthLabel: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  navBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#4361ee',
    borderRadius: 8,
  },
  navBtnDisabled: { backgroundColor: '#444' },
  navText: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  navTextDisabled: { color: '#888' },

  colHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dateCol: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#444',
  },
  periodHeader: { flex: 1, alignItems: 'center' },
  periodHeaderText: { fontSize: 20, color: '#333', fontWeight: '600', letterSpacing: 2 },

  list: { flex: 1 },

  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    height: ROW_HEIGHT,
  },

  dateMain: { fontSize: 19, fontWeight: 'bold', color: '#333' },
  dateWeek: { fontSize: 20, fontWeight: 'bold' },

  cellTouchable: { flex: 1 },

  dataCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#e0e0e0',
    paddingVertical: 8,
  },
  dataCellEmpty: { backgroundColor: '#fafafa' },
  timeText: { fontSize: 16, color: '#888', marginBottom: 2 },
  bpText: { fontSize: 24, fontWeight: 'bold' },
  systolicText: { color: '#e63946' },
  bpSep: { color: '#888' },
  diastolicText: { color: '#4361ee' },
  pulseText: { fontSize: 20, color: '#333', fontWeight: '600', marginTop: 2 },
  emptyDash: { fontSize: 26, color: '#ddd' },
});
