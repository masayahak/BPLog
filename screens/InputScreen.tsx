import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMeasurements } from '../src/context/MeasurementContext';
import { useLocale } from '../src/context/LocaleContext';
import InfoModal from '../src/components/InfoModal';
import { Measurement, Period } from '../src/types';
import { toDateString, toTimeString, getPeriod, getWeekdayIndex, getDateParts, isFuturePeriod } from '../src/utils';
import InputDialog from '../src/components/InputDialog';

export default function InputScreen() {
  const { measurements } = useMeasurements();
  const { t } = useLocale();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<{ date: string; period: Period } | null>(null);
  const [dialogInitial, setDialogInitial] = useState<{ systolic: number; diastolic: number; pulse: number } | undefined>();
  const [infoVisible, setInfoVisible] = useState(false);
  const lastTapRef = useRef<{ key: string; time: number }>({ key: '', time: 0 });
  const insets = useSafeAreaInsets();

  const now = new Date();
  const todayStr = toDateString(now);
  const currentPeriod: Period = getPeriod(toTimeString(now));

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  function getMeasurement(date: string, period: Period): Measurement | undefined {
    return measurements.find((m) => m.date === date && m.period === period);
  }

  function handleCellTap(date: string, period: Period) {
    if (isFuturePeriod(date, period)) return;
    const key = `${date}-${period}`;
    const tapTime = Date.now();
    if (lastTapRef.current.key === key && tapTime - lastTapRef.current.time < 350) {
      const existing = getMeasurement(date, period);
      setDialogTarget({ date, period });
      setDialogInitial(existing ? { systolic: existing.systolic, diastolic: existing.diastolic, pulse: existing.pulse } : undefined);
      setDialogVisible(true);
      lastTapRef.current = { key: '', time: 0 };
    } else {
      lastTapRef.current = { key, time: tapTime };
    }
  }

  function handleAddPress() {
    const existing = getMeasurement(todayStr, currentPeriod);
    setDialogTarget({ date: todayStr, period: currentPeriod });
    setDialogInitial(existing ? { systolic: existing.systolic, diastolic: existing.diastolic, pulse: existing.pulse } : undefined);
    setDialogVisible(true);
  }

  const todayCurrentMeasured = !!getMeasurement(todayStr, currentPeriod);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('screen_input_title')}</Text>
        <TouchableOpacity style={styles.infoBtn} onPress={() => setInfoVisible(true)}>
          <Text style={styles.infoBtnText}>ⓘ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.spacer} />
        <DayCard
          label={t('yesterday')}
          dateStr={yesterdayStr}
          am={getMeasurement(yesterdayStr, 'AM')}
          pm={getMeasurement(yesterdayStr, 'PM')}
          isToday={false}
          showAddPeriod={null}
          onCellTap={handleCellTap}
        />
        <View style={styles.spacer} />
        <DayCard
          label={t('today')}
          dateStr={todayStr}
          am={getMeasurement(todayStr, 'AM')}
          pm={getMeasurement(todayStr, 'PM')}
          isToday
          showAddPeriod={todayCurrentMeasured ? null : currentPeriod}
          onCellTap={handleCellTap}
          onAddPress={handleAddPress}
        />
        <View style={styles.spacer} />
      </View>

      <InputDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        targetDate={dialogTarget?.date}
        targetPeriod={dialogTarget?.period}
        initialValues={dialogInitial}
      />
      <InfoModal visible={infoVisible} onClose={() => setInfoVisible(false)} />
    </View>
  );
}

function DayCard({
  label,
  dateStr,
  am,
  pm,
  isToday,
  showAddPeriod,
  onCellTap,
  onAddPress,
}: {
  label: string;
  dateStr: string;
  am?: Measurement;
  pm?: Measurement;
  isToday: boolean;
  showAddPeriod: Period | null;
  onCellTap: (date: string, period: Period) => void;
  onAddPress?: () => void;
}) {
  const { t } = useLocale();
  return (
    <View style={[styles.card, isToday ? styles.cardToday : styles.cardYesterday]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.dayLabel, isToday ? styles.dayLabelToday : styles.dayLabelYesterday]}>{label}</Text>
        <DateWithWeekday dateStr={dateStr} isToday={isToday} />
      </View>
      <View style={styles.cells}>
        <TouchableOpacity style={styles.cellTouchable} onPress={() => onCellTap(dateStr, 'AM')}>
          <MeasurementCell
            label={t('am')}
            data={am}
            period="AM"
            showAdd={showAddPeriod === 'AM'}
            isFuture={isFuturePeriod(dateStr, 'AM')}
            isToday={isToday}
            onAddPress={onAddPress}
          />
        </TouchableOpacity>
        <View style={styles.cellDivider} />
        <TouchableOpacity style={styles.cellTouchable} onPress={() => onCellTap(dateStr, 'PM')}>
          <MeasurementCell
            label={t('pm')}
            data={pm}
            period="PM"
            showAdd={showAddPeriod === 'PM'}
            isFuture={isFuturePeriod(dateStr, 'PM')}
            isToday={isToday}
            onAddPress={onAddPress}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DateWithWeekday({ dateStr, isToday }: { dateStr: string; isToday: boolean }) {
  const { locale } = useLocale();
  const { prefix, weekday, suffix } = getDateParts(dateStr, locale);
  const dayIdx = getWeekdayIndex(dateStr);
  const weekdayColor = dayIdx === 6 ? '#4361ee' : dayIdx === 0 ? '#e63946' : '#555';
  return (
    <Text style={isToday ? styles.dateText : styles.dateTextSmall}>
      {prefix}<Text style={{ color: weekdayColor }}>{weekday}</Text>{suffix}
    </Text>
  );
}

function MeasurementCell({
  label,
  data,
  period,
  showAdd,
  isFuture,
  isToday,
  onAddPress,
}: {
  label: string;
  data?: Measurement;
  period: Period;
  showAdd: boolean;
  isFuture: boolean;
  isToday: boolean;
  onAddPress?: () => void;
}) {
  const { t } = useLocale();
  const s = isToday ? styles : smallStyles;
  const cellBg = period === 'AM' ? '#f2f2f2' : '#e8e8e8';
  return (
    <View style={[styles.cell, !isToday && styles.cellSmall, { backgroundColor: cellBg }]}>
      <Text style={s.periodLabel}>{label}</Text>
      {data ? (
        <>
          <Text style={s.timeText}>{data.time}</Text>
          <Text style={s.bpText}>
            <Text style={styles.systolicText}>{data.systolic}</Text>
            <Text style={styles.bpSep}> / </Text>
            <Text style={styles.diastolicText}>{data.diastolic}</Text>
          </Text>
          <Text style={s.pulseText}>{t('pulse_label')} {data.pulse}</Text>
        </>
      ) : showAdd ? (
        <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      ) : isFuture ? (
        <Text style={styles.emptyText}>—</Text>
      ) : (
        <Text style={styles.emptyText}>{t('not_recorded')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  header: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  infoBtn: { position: 'absolute', right: 20 },
  infoBtnText: { fontSize: 26, color: '#aaa' },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  spacer: { flex: 1 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardToday: {
    borderWidth: 2,
    borderColor: '#4361ee',
  },
  cardYesterday: {
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 14,
  },
  dayLabel: { fontSize: 28, fontWeight: 'bold', color: '#888' },
  dayLabelToday: { color: '#4361ee' },
  dayLabelYesterday: { fontSize: 24, color: '#444' },
  dateText: { fontSize: 28, color: '#555' },
  dateTextSmall: { fontSize: 24, color: '#444' },

  cells: { flexDirection: 'row' },
  cellDivider: { width: 1, backgroundColor: '#e0e0e0', marginHorizontal: 8 },
  cellTouchable: { flex: 1 },
  cell: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
cellSmall: { paddingVertical: 6 },
  periodLabel: { fontSize: 24, color: '#333', fontWeight: '600', marginBottom: 6 },
  timeText: { fontSize: 16, color: '#999', marginBottom: 4 },
  bpText: { fontSize: 28, fontWeight: 'bold', marginBottom: 2 },
  systolicText: { color: '#e63946' },
  bpSep: { color: '#888' },
  diastolicText: { color: '#4361ee' },
  pulseText: { fontSize: 22, color: '#333', fontWeight: '600' },
  emptyText: { fontSize: 15, color: '#333', marginTop: 16 },

  addBtn: {
    marginTop: 8,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e63946',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addBtnText: { fontSize: 32, color: '#fff', lineHeight: 36 },
});

const smallStyles = {
  periodLabel: { fontSize: 20, color: '#333', fontWeight: '600' as const, marginBottom: 6 },
  timeText: { fontSize: 14, color: '#bbb', marginBottom: 4 },
  bpText: { fontSize: 24, fontWeight: 'bold' as const, marginBottom: 2 },
  pulseText: { fontSize: 18, color: '#555', fontWeight: '600' as const },
};
