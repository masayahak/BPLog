import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMeasurements } from '../src/context/MeasurementContext';
import { useLocale } from '../src/context/LocaleContext';
import { Measurement } from '../src/types';
import { toDateString } from '../src/utils';
import { TranslationKey } from '../src/i18n/translations';

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
  const todayStr = toDateString(new Date());

  const stats7 = computeStats(measurements, 7, todayStr);
  const stats30 = computeStats(measurements, 30, todayStr);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tab_trends')}</Text>
      </View>
      <View style={styles.content}>
        <TrendCard title={t('period_7days')} stats={stats7} t={t} />
        <TrendCard title={t('period_30days')} stats={stats30} t={t} />
      </View>
    </View>
  );
}

function TrendCard({
  title,
  stats,
  t,
}: {
  title: string;
  stats: PeriodStats | null;
  t: (key: TranslationKey) => string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.labelCell} />
          <View style={styles.valueCell}>
            <Text style={[styles.colHeaderText, styles.systolicColor]}>{t('trend_bp_upper')}</Text>
          </View>
          <View style={styles.valueCell}>
            <Text style={[styles.colHeaderText, styles.diastolicColor]}>{t('trend_bp_lower')}</Text>
          </View>
          <View style={styles.valueCell}>
            <Text style={styles.colHeaderText}>{t('field_pulse')}</Text>
          </View>
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
}: {
  rowLabel: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  emphasize?: boolean;
}) {
  const valueStyle = emphasize ? styles.valueTextEmphasis : styles.valueText;
  return (
    <View style={[styles.tableRow, emphasize && styles.tableRowEmphasis]}>
      <View style={styles.labelCell}>
        <Text style={[styles.labelText, emphasize && styles.labelTextEmphasis]}>{rowLabel}</Text>
      </View>
      <View style={styles.valueCell}>
        <Text style={[valueStyle, styles.systolicColor]}>{systolic ?? '—'}</Text>
      </View>
      <View style={styles.valueCell}>
        <Text style={[valueStyle, styles.diastolicColor]}>{diastolic ?? '—'}</Text>
      </View>
      <View style={styles.valueCell}>
        <Text style={valueStyle}>{pulse ?? '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, paddingHorizontal: 16, justifyContent: 'space-evenly' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  table: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ddd' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  tableRowEmphasis: {
    backgroundColor: '#eef2ff',
    paddingVertical: 14,
  },
  labelCell: { width: 80, justifyContent: 'center' },
  labelText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  labelTextEmphasis: { fontSize: 24, color: '#1a1a2e' },
  valueCell: { flex: 1, alignItems: 'center' },
  colHeaderText: { fontSize: 22, color: '#555', fontWeight: '700' },
  valueText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  valueTextEmphasis: { fontSize: 28, fontWeight: '800', color: '#333' },
  systolicColor: { color: '#e63946' },
  diastolicColor: { color: '#4361ee' },
});
