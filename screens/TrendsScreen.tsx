import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMeasurements } from '../src/context/MeasurementContext';
import { useLocale } from '../src/context/LocaleContext';
import { Measurement } from '../src/types';
import { toDateString } from '../src/utils';
import { useNow } from '../src/hooks/useNow';
import { TranslationKey } from '../src/i18n/translations';
import { colors } from '../src/theme/colors';

const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

type PeriodStats = {
  systolic: { avg: number; max: number; min: number };
  diastolic: { avg: number; max: number; min: number };
  pulse: { avg: number; max: number; min: number };
};

function stat(values: number[]) {
  return {
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    max: Math.max(...values),
    min: Math.min(...values),
  };
}

function computeStats(measurements: Measurement[], days: number, todayStr: string): PeriodStats | null {
  const start = new Date(todayStr + 'T00:00:00');
  start.setDate(start.getDate() - (days - 1));
  const startStr = toDateString(start);
  const target = measurements.filter((m) => m.date >= startStr && m.date <= todayStr);
  if (target.length === 0) return null;
  return {
    systolic: stat(target.map((m) => m.systolic)),
    diastolic: stat(target.map((m) => m.diastolic)),
    pulse: stat(target.map((m) => m.pulse)),
  };
}

export default function TrendsScreen() {
  const { measurements } = useMeasurements();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const todayStr = toDateString(useNow());

  const stats7 = computeStats(measurements, 7, todayStr);
  const stats30 = computeStats(measurements, 30, todayStr);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tab_trends')}</Text>
      </View>
      <View style={styles.content}>
        <TrendSection title={t('period_7days')} stats={stats7} t={t} topPadding={34} />
        <TrendSection title={t('period_30days')} stats={stats30} t={t} topPadding={30} />
      </View>
    </View>
  );
}

function TrendSection({
  title,
  stats,
  t,
  topPadding,
}: {
  title: string;
  stats: PeriodStats | null;
  t: (key: TranslationKey) => string;
  topPadding: number;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { paddingTop: topPadding }]}>{title}</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.headerRow]}>
          <View style={styles.labelCell} />
          <Text style={[styles.colHeaderText, styles.valueCell]}>{t('trend_bp_upper')}</Text>
          <Text style={[styles.colHeaderText, styles.valueCell]}>{t('trend_bp_lower')}</Text>
          <Text style={[styles.colHeaderText, styles.pulseCell]}>{t('field_pulse')}</Text>
        </View>
        <StatRow
          rowLabel={t('stat_max')}
          systolic={stats?.systolic.max}
          diastolic={stats?.diastolic.max}
          pulse={stats?.pulse.max}
        />
        <StatRow
          rowLabel={t('stat_avg')}
          systolic={stats?.systolic.avg}
          diastolic={stats?.diastolic.avg}
          pulse={stats?.pulse.avg}
          emphasize
        />
        <StatRow
          rowLabel={t('stat_min')}
          systolic={stats?.systolic.min}
          diastolic={stats?.diastolic.min}
          pulse={stats?.pulse.min}
          isLast
        />
      </View>
    </View>
  );
}

function StatRow({
  rowLabel,
  systolic,
  diastolic,
  pulse,
  emphasize,
  isLast,
}: {
  rowLabel: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  emphasize?: boolean;
  isLast?: boolean;
}) {
  const valueStyle = emphasize ? styles.valueTextEmphasis : styles.valueText;
  return (
    <View style={[styles.tableRow, emphasize && styles.tableRowEmphasis, isLast && styles.tableRowLast]}>
      <Text style={[styles.labelText, emphasize && styles.labelTextEmphasis, styles.labelCell]}>{rowLabel}</Text>
      <Text style={[valueStyle, styles.systolicColor, styles.valueCell, tabularNums]}>{systolic ?? '—'}</Text>
      <Text style={[valueStyle, styles.diastolicColor, styles.valueCell, tabularNums]}>{diastolic ?? '—'}</Text>
      <Text style={[valueStyle, styles.textPrimaryColor, styles.pulseCell, tabularNums]}>{pulse ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 22,
    paddingTop: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 34, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  content: { flex: 1, flexDirection: 'column', paddingHorizontal: 22, paddingBottom: 24 },
  section: { flex: 1, flexDirection: 'column', minHeight: 0 },
  sectionTitle: { fontSize: 25, fontWeight: '700', color: colors.textPrimary, paddingBottom: 12 },
  table: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
  },
  headerRow: { paddingVertical: 10 },
  tableRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSub,
  },
  tableRowEmphasis: { flex: 1.25 },
  tableRowLast: { borderBottomWidth: 0 },
  labelCell: { flex: 1 },
  labelText: { fontSize: 21, fontWeight: '500', color: colors.textSecondary },
  labelTextEmphasis: { fontSize: 23, fontWeight: '700', color: colors.textPrimary },
  valueCell: { width: 78, textAlign: 'right' },
  pulseCell: { width: 66, textAlign: 'right' },
  colHeaderText: { fontSize: 19, fontWeight: '600', color: colors.textLabel },
  valueText: { fontSize: 28, fontWeight: '600', color: colors.textPrimary },
  valueTextEmphasis: { fontSize: 36, fontWeight: '700', color: colors.textPrimary, letterSpacing: -1 },
  systolicColor: { color: colors.systolic },
  diastolicColor: { color: colors.diastolic },
  textPrimaryColor: { color: colors.textPrimary },
});
