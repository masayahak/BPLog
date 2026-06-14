import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import * as Haptics from 'expo-haptics';
import { useMeasurements } from '../src/context/MeasurementContext';
import { useLocale } from '../src/context/LocaleContext';
import { loadGoals, saveGoals } from '../src/storage';
import { Goals, Period } from '../src/types';
import { formatMonthHeader, formatGraphLabel, formatLegendDay } from '../src/utils';
import GoalInputDialog from '../src/components/GoalInputDialog';

const SCREEN_WIDTH = Dimensions.get('window').width;
const Y_PADDING = 10;

type GoalField = 'systolic' | 'diastolic';

type LegendData = {
  date: string;
  period: Period;
  sys: number;
  dia: number;
};

function calcYAxis(values: number[], goals: Goals) {
  const all = [...values, goals.systolic, goals.diastolic];
  const rawMin = Math.min(...all);
  const rawMax = Math.max(...all);
  const minValue = Math.floor((rawMin - Y_PADDING) / 10) * 10;
  const maxValue = Math.ceil((rawMax + Y_PADDING) / 10) * 10;
  const noOfSections = Math.round((maxValue - minValue) / 10);
  return { minValue, maxValue, noOfSections };
}

export default function GraphScreen() {
  const { measurements } = useMeasurements();
  const { locale, t } = useLocale();
  const insets = useSafeAreaInsets();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [goals, setGoals] = useState<Goals>({ systolic: 130, diastolic: 80 });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogInitialField, setDialogInitialField] = useState<GoalField>('systolic');
  const [chartAreaHeight, setChartAreaHeight] = useState(0);
  const [legendData, setLegendData] = useState<LegendData | null>(null);
  const hScrollRef = useRef<ScrollView>(null);
  const lastTappedIndexRef = useRef<number>(-1);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isFirstLegendRender = useRef(true);

  useEffect(() => {
    loadGoals().then(setGoals);
  }, []);

  const ym = `${year}-${String(month).padStart(2, '0')}`;
  const monthly = measurements
    .filter((m) => m.date.startsWith(ym))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.period === 'AM' ? -1 : 1;
    });

  useEffect(() => {
    lastTappedIndexRef.current = -1;
    isFirstLegendRender.current = true;
    if (monthly.length > 0) {
      const last = monthly[monthly.length - 1];
      setLegendData({ date: last.date, period: last.period, sys: last.systolic, dia: last.diastolic });
    } else {
      setLegendData(null);
    }
  }, [ym, measurements]);

  useEffect(() => {
    if (isFirstLegendRender.current) {
      isFirstLegendRender.current = false;
      return;
    }
    fadeAnim.setValue(0.2);
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [legendData]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    const ny = now.getFullYear();
    const nm = now.getMonth() + 1;
    if (year > ny || (year === ny && month >= nm)) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const canGoNext = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);

  const systolicData = monthly.map((m, i) => ({ value: m.systolic, dataPointIndex: i }));
  const diastolicData = monthly.map((m) => ({ value: m.diastolic }));

  const labels = monthly.map((m) => {
    const day = parseInt(m.date.split('-')[2], 10);
    return formatGraphLabel(day, m.period, locale);
  });

  const hasData = monthly.length > 0;

  const allValues = monthly.flatMap((m) => [m.systolic, m.diastolic]);
  const { minValue, maxValue, noOfSections } = hasData
    ? calcYAxis(allValues, goals)
    : { minValue: 60, maxValue: 180, noOfSections: 12 };

  const CHART_PADDING = 32;
  const X_LABEL_HEIGHT = 48;
  const chartHeight = chartAreaHeight > 0 ? Math.max(chartAreaHeight - CHART_PADDING - X_LABEL_HEIGHT, 160) : 260;

  function onChartAreaLayout(e: LayoutChangeEvent) {
    setChartAreaHeight(e.nativeEvent.layout.height);
  }

  useEffect(() => {
    if (!hasData || chartAreaHeight === 0) return;
    const today = now.toISOString().slice(0, 10);
    let targetIndex = monthly.length - 1;
    for (let i = monthly.length - 1; i >= 0; i--) {
      if (monthly[i].date === today) { targetIndex = i; break; }
    }
    const pointX = 20 + targetIndex * 60;
    const scrollX = Math.max(0, pointX - SCREEN_WIDTH + 120);
    setTimeout(() => {
      hScrollRef.current?.scrollTo({ x: scrollX, animated: false });
    }, 0);
  }, [chartAreaHeight, ym, monthly.length]);

  function openDialog(field: GoalField) {
    setDialogInitialField(field);
    setDialogVisible(true);
  }

  async function handleGoalSave(newGoals: Goals) {
    setGoals(newGoals);
    await saveGoals(newGoals);
  }

  const legendDay = legendData ? parseInt(legendData.date.split('-')[2], 10) : null;
  const legendPeriod = legendData?.period === 'AM' ? t('am') : t('pm');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
          <Text style={styles.navText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonthHeader(year, month, locale)}</Text>
        <TouchableOpacity
          style={[styles.navBtn, !canGoNext && styles.navBtnDisabled]}
          onPress={nextMonth}
          disabled={!canGoNext}
        >
          <Text style={[styles.navText, !canGoNext && styles.navTextDisabled]}>▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.goalBar}>
        <Text style={styles.goalBarLabel}>{t('target')}</Text>
        <TouchableOpacity style={styles.goalItem} onPress={() => openDialog('systolic')}>
          <View style={[styles.goalDot, { backgroundColor: '#e63946' }]} />
          <Text style={styles.goalItemLabel}>{t('upper_short')}</Text>
          <Text style={styles.goalValue}>{goals.systolic}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.goalItem} onPress={() => openDialog('diastolic')}>
          <View style={[styles.goalDot, { backgroundColor: '#4361ee' }]} />
          <Text style={styles.goalItemLabel}>{t('lower_short')}</Text>
          <Text style={styles.goalValue}>{goals.diastolic}</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.legend, { opacity: fadeAnim }]}>
        {legendData ? (
          <>
            <View style={styles.legendDate}>
              <Text style={styles.legendDateText}>{formatLegendDay(legendDay!, locale)}</Text>
              <Text style={styles.legendPeriodText}>{legendPeriod}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#e63946' }]} />
              <Text style={styles.legendLabel}>{t('upper_short')}</Text>
              <Text style={[styles.legendValue, { color: '#e63946' }]}>{legendData.sys}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4361ee' }]} />
              <Text style={styles.legendLabel}>{t('lower_short')}</Text>
              <Text style={[styles.legendValue, { color: '#4361ee' }]}>{legendData.dia}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#e63946' }]} />
              <Text style={styles.legendLabel}>{t('upper_long')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4361ee' }]} />
              <Text style={styles.legendLabel}>{t('lower_long')}</Text>
            </View>
          </>
        )}
      </Animated.View>

      <View style={styles.chartArea} onLayout={onChartAreaLayout}>
        {!hasData ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('no_data')}</Text>
          </View>
        ) : chartAreaHeight > 0 ? (
          <ScrollView ref={hScrollRef} horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chartWrapper}>
              <LineChart
                data={systolicData}
                data2={diastolicData}
                color1="#e63946"
                color2="#4361ee"
                thickness1={3}
                thickness2={3}
                dataPointsColor1="#e63946"
                dataPointsColor2="#4361ee"
                dataPointsRadius={6}
                width={Math.max(SCREEN_WIDTH - 32, monthly.length * 60)}
                height={chartHeight}
                hideYAxisText
                yAxisLabelWidth={0}
                xAxisLabelTexts={labels}
                xAxisLabelTextStyle={styles.xLabel}
                xAxisLabelsHeight={40}
                hideRules={false}
                rulesColor="#e0e0e0"
                yAxisColor="#ccc"
                xAxisColor="#ccc"
                curved
                isAnimated
                initialSpacing={20}
                spacing={60}
                noOfSections={noOfSections}
                maxValue={maxValue}
                minValue={minValue}
                showReferenceLine1
                referenceLine1Position={goals.systolic}
                referenceLine1Config={{
                  color: '#e63946',
                  thickness: 2,
                  dashWidth: 6,
                  dashGap: 4,
                  labelText: `${t('goal_prefix')} ${goals.systolic}`,
                  labelTextStyle: { color: '#e63946', fontSize: 12, fontWeight: '600' },
                }}
                showReferenceLine2
                referenceLine2Position={goals.diastolic}
                referenceLine2Config={{
                  color: '#4361ee',
                  thickness: 2,
                  dashWidth: 6,
                  dashGap: 4,
                  labelText: `${t('goal_prefix')} ${goals.diastolic}`,
                  labelTextStyle: { color: '#4361ee', fontSize: 12, fontWeight: '600' },
                }}
                pointerConfig={{
                  activatePointersInstantlyOnTouch: true,
                  pointerStripWidth: 1,
                  pointerStripHeight: chartHeight,
                  pointerStripColor: '#99999966',
                  pointer1Color: '#e63946',
                  pointer2Color: '#4361ee',
                  pointerLabelWidth: 1,
                  pointerLabelHeight: 1,
                  pointerLabelComponent: (items: any[]) => {
                    const idx = items[0]?.dataPointIndex ?? -1;
                    if (idx >= 0 && idx !== lastTappedIndexRef.current) {
                      lastTappedIndexRef.current = idx;
                      const m = monthly[idx];
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      requestAnimationFrame(() =>
                        setLegendData({ date: m.date, period: m.period, sys: m.systolic, dia: m.diastolic })
                      );
                    }
                    return <View />;
                  },
                  onTouchEnd: () => { lastTappedIndexRef.current = -1; },
                }}
              />
            </View>
          </ScrollView>
        ) : null}
      </View>

      <GoalInputDialog
        visible={dialogVisible}
        initialField={dialogInitialField}
        currentGoals={goals}
        onSave={handleGoalSave}
        onClose={() => setDialogVisible(false)}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  monthLabel: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4361ee',
    borderRadius: 8,
  },
  navBtnDisabled: { backgroundColor: '#555' },
  navText: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  navTextDisabled: { color: '#aaa' },
  goalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  goalBarLabel: { fontSize: 16, color: '#aaa', fontWeight: '600', marginRight: 4 },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2e2e4a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  goalDot: { width: 12, height: 12, borderRadius: 6 },
  goalItemLabel: { fontSize: 16, color: '#ccc', fontWeight: '600' },
  goalValue: { fontSize: 22, color: '#fff', fontWeight: 'bold', minWidth: 36, textAlign: 'right' },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  legendDate: { alignItems: 'center', marginRight: 4 },
  legendDateText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  legendPeriodText: { fontSize: 14, color: '#666' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 7 },
  legendLabel: { fontSize: 17, color: '#555', fontWeight: '600' },
  legendValue: { fontSize: 26, fontWeight: 'bold', minWidth: 44 },
  chartArea: { flex: 1, padding: 16 },
  chartWrapper: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  xLabel: { fontSize: 15, color: '#555', width: 52, textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 22, color: '#aaa' },
});
