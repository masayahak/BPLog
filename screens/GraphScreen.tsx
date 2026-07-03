import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { useMeasurements } from '../src/context/MeasurementContext';
import { useLocale } from '../src/context/LocaleContext';
import { loadGoals, saveGoals, DEFAULT_GOALS } from '../src/storage';
import { Goals, Period } from '../src/types';
import { formatMonthHeader, formatLegendDateParts, toDateString } from '../src/utils';
import { hapticKeyPress } from '../src/haptics';
import { useMonthNav } from '../src/hooks/useMonthNav';
import { useDoubleTap } from '../src/hooks/useDoubleTap';
import HapticButton from '../src/components/HapticButton';
import GoalInputDialog from '../src/components/GoalInputDialog';

const SCREEN_WIDTH = Dimensions.get('window').width;
const Y_PADDING = 10;

// チャート横方向のレイアウト定数。LineChart の initialSpacing/spacing と、
// 選択中の縦線・X軸ラベルの絶対座標計算で共有する（ズレ防止）。
const INITIAL_SPACING = 20;     // 左端から最初のデータ点までの距離
const POINT_SPACING = 60;       // データ点間の距離
const CHART_INNER_PADDING = 16; // chartWrapper の padding
const X_LABEL_WIDTH = 40;       // X軸日付ラベルの幅（中央寄せ用）

// データ点 index の X 座標（chartWrapper 内ローカル座標）。
function pointX(index: number): number {
  return INITIAL_SPACING + index * POINT_SPACING;
}

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
  const axisMin = Math.floor((rawMin - Y_PADDING) / 10) * 10;
  const axisMax = Math.ceil((rawMax + Y_PADDING) / 10) * 10;
  const noOfSections = Math.round((axisMax - axisMin) / 10);
  // gifted-charts は yAxisOffset を Y軸下限に取り、データ・目標線を offset 分シフトして描画する。
  // maxValue にはオフセット適用後（ゼロ基準）の上限を渡す。
  return { yAxisOffset: axisMin, maxValue: axisMax - axisMin, noOfSections };
}

export default function GraphScreen() {
  const { measurements } = useMeasurements();
  const { locale, t } = useLocale();
  const insets = useSafeAreaInsets();
  const { now, year, month, prevMonth, nextMonth, canGoNext } = useMonthNav();
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogInitialField, setDialogInitialField] = useState<GoalField>('systolic');
  const [chartAreaHeight, setChartAreaHeight] = useState(0);
  const [legendData, setLegendData] = useState<LegendData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const detectDoubleTap = useDoubleTap();
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
      setSelectedIndex(monthly.length - 1);
    } else {
      setLegendData(null);
      setSelectedIndex(null);
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

  const systolicData = monthly.map((m, i) => ({ value: m.systolic, dataPointIndex: i }));
  const diastolicData = monthly.map((m) => ({ value: m.diastolic }));

  const hasData = monthly.length > 0;

  const allValues = monthly.flatMap((m) => [m.systolic, m.diastolic]);
  const { yAxisOffset, maxValue, noOfSections } = hasData
    ? calcYAxis(allValues, goals)
    : { yAxisOffset: 60, maxValue: 120, noOfSections: 12 };

  const CHART_PADDING = 84 + 36; // wrapper padding(32) + chartArea padding(32) + label row(20) + LineChart internal x-axis area(36)
  const chartHeight = chartAreaHeight > 0 ? Math.max(chartAreaHeight - CHART_PADDING, 160) : 260;

  function onChartAreaLayout(e: LayoutChangeEvent) {
    setChartAreaHeight(e.nativeEvent.layout.height);
  }

  useEffect(() => {
    if (!hasData || chartAreaHeight === 0) return;
    const today = toDateString(now);
    let targetIndex = monthly.length - 1;
    for (let i = monthly.length - 1; i >= 0; i--) {
      if (monthly[i].date === today) { targetIndex = i; break; }
    }
    const targetX = pointX(targetIndex);
    const scrollX = Math.max(0, targetX - SCREEN_WIDTH + 120);
    setTimeout(() => {
      hScrollRef.current?.scrollTo({ x: scrollX, animated: false });
    }, 0);
  }, [chartAreaHeight, ym, monthly.length, now]);

  function openDialog(field: GoalField) {
    if (!detectDoubleTap(`goal-${field}`)) return;
    hapticKeyPress();
    setDialogInitialField(field);
    setDialogVisible(true);
  }

  async function handleGoalSave(newGoals: Goals) {
    setGoals(newGoals);
    await saveGoals(newGoals);
  }

  const legendPeriod = legendData?.period === 'AM' ? t('am') : t('pm');
  const legendDateParts = legendData ? formatLegendDateParts(legendData.date, locale) : null;

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
              <Text style={styles.legendDateText}>
                {legendDateParts!.prefix}
                <Text style={{ color: legendDateParts!.weekdayColor }}>{legendDateParts!.weekday}</Text>
                {` ${legendPeriod}`}
              </Text>
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
              {selectedIndex !== null && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: CHART_INNER_PADDING + pointX(selectedIndex) - 1,
                    top: 16,
                    width: 2,
                    height: chartHeight,
                    backgroundColor: '#444',
                    opacity: 0.55,
                    zIndex: 10,
                  }}
                />
              )}
              <LineChart
                // isAnimated の描画クリップ幅はマウント時のデータ数で固定されるため、
                // 月切替・記録追加時は key で再マウントして全点を描画し直す
                key={`${ym}-${monthly.length}`}
                data={systolicData}
                data2={diastolicData}
                color1="#e63946"
                color2="#4361ee"
                thickness1={3}
                thickness2={3}
                dataPointsColor1="#e63946"
                dataPointsColor2="#4361ee"
                dataPointsRadius={6}
                width={Math.max(SCREEN_WIDTH - CHART_INNER_PADDING * 2, monthly.length * POINT_SPACING)}
                height={chartHeight}
                hideYAxisText
                yAxisLabelWidth={0}
                hideRules={false}
                rulesColor="#e0e0e0"
                yAxisColor="#ccc"
                xAxisColor="#ccc"
                curved
                isAnimated
                initialSpacing={INITIAL_SPACING}
                spacing={POINT_SPACING}
                noOfSections={noOfSections}
                maxValue={maxValue}
                yAxisOffset={yAxisOffset}
                showReferenceLine1
                referenceLine1Position={goals.systolic}
                referenceLine1Config={{
                  color: '#e63946',
                  thickness: 2,
                  dashWidth: 6,
                  dashGap: 4,
                }}
                showReferenceLine2
                referenceLine2Position={goals.diastolic}
                referenceLine2Config={{
                  color: '#4361ee',
                  thickness: 2,
                  dashWidth: 6,
                  dashGap: 4,
                }}
                pointerConfig={{
                  activatePointersInstantlyOnTouch: true,
                  pointerStripWidth: 0,
                  pointerStripHeight: chartHeight,
                  pointerStripColor: 'transparent',
                  pointer1Color: '#e63946',
                  pointer2Color: '#4361ee',
                  pointerLabelWidth: 1,
                  pointerLabelHeight: 1,
                  pointerLabelComponent: (items: any[]) => {
                    const idx = items[0]?.dataPointIndex ?? -1;
                    if (idx >= 0 && idx !== lastTappedIndexRef.current) {
                      lastTappedIndexRef.current = idx;
                      const m = monthly[idx];
                      hapticKeyPress();
                      requestAnimationFrame(() => {
                        setSelectedIndex(idx);
                        setLegendData({ date: m.date, period: m.period, sys: m.systolic, dia: m.diastolic });
                      });
                    }
                    return <View />;
                  },
                  onTouchEnd: () => { lastTappedIndexRef.current = -1; },
                }}
              />
              <View style={{ height: 20, position: 'relative' }}>
                {monthly.map((m, i) => {
                  const label = i === 0 || monthly[i - 1].date !== m.date
                    ? String(new Date(m.date).getDate())
                    : '';
                  if (!label) return null;
                  return (
                    <Text
                      key={i}
                      style={{
                        position: 'absolute',
                        left: pointX(i) - X_LABEL_WIDTH / 2,
                        width: X_LABEL_WIDTH,
                        textAlign: 'center',
                        color: '#444',
                        fontSize: 16,
                        fontWeight: '600',
                      }}
                    >
                      {label}
                    </Text>
                  );
                })}
              </View>
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
  goalBarLabel: { fontSize: 16, color: '#aaa', fontWeight: '600', flex: 1, textAlign: 'center' },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2e2e4a',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
  },
  goalDot: { width: 12, height: 12, borderRadius: 6 },
  goalItemLabel: { fontSize: 16, color: '#ccc', fontWeight: '600' },
  goalValue: { fontSize: 22, color: '#fff', fontWeight: 'bold', minWidth: 36, textAlign: 'right' },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  legendDate: { flex: 1 },
  legendDateText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 22, color: '#aaa' },
});
