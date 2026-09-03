import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet, ScrollView, Dimensions, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../src/components/AppText';
import { LineChart } from 'react-native-gifted-charts';
import { useMeasurements } from '../src/context/MeasurementContext';
import { useLocale } from '../src/context/LocaleContext';
import { loadGoals, saveGoals, DEFAULT_GOALS } from '../src/storage';
import { Goals, Period } from '../src/types';
import { formatMonthHeader, formatLegendDateParts, toDateString } from '../src/utils';
import { hapticKeyPress } from '../src/haptics';
import { useMonthNav } from '../src/hooks/useMonthNav';
import HapticButton from '../src/components/HapticButton';
import GoalInputDialog from '../src/components/GoalInputDialog';
import ChevronIcon from '../src/components/icons/ChevronIcon';
import { colors } from '../src/theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const Y_PADDING = 10;

// チャート横方向のレイアウト定数。LineChart の initialSpacing/spacing と、
// 選択中の縦線・X軸ラベルの絶対座標計算で共有する（ズレ防止）。
const INITIAL_SPACING = 20;     // 左端から最初のデータ点までの距離
const POINT_SPACING = 60;       // データ点間の距離
const CHART_INNER_PADDING = 12; // chartWrapper の左右padding
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

  const CHART_PADDING = 14 + 20 + 36; // wrapper paddingTop(14) + label row(20) + LineChart internal x-axis area(36)
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
          <ChevronIcon direction="left" color={colors.textPrimary} />
        </HapticButton>
        <Text style={styles.monthLabel}>{formatMonthHeader(year, month, locale)}</Text>
        <HapticButton style={styles.navBtn} onPress={nextMonth} disabled={!canGoNext}>
          <ChevronIcon direction="right" color={canGoNext ? colors.textPrimary : colors.infoBorder} />
        </HapticButton>
      </View>

      <View style={styles.goalBar}>
        <HapticButton style={styles.goalBarBtn} onPress={() => openDialog('systolic')}>
          <Text style={styles.goalBarBtnText}>{t('target')}</Text>
        </HapticButton>
        <View style={styles.goalItem}>
          <Text style={styles.goalItemLabel}>{t('upper_short')}</Text>
          <Text style={styles.goalValue}>{goals.systolic}</Text>
        </View>
        <View style={styles.goalItem}>
          <Text style={styles.goalItemLabel}>{t('lower_short')}</Text>
          <Text style={styles.goalValue}>{goals.diastolic}</Text>
        </View>
      </View>

      <Animated.View style={[styles.legend, { opacity: fadeAnim }]}>
        {legendData ? (
          <>
            <Text style={styles.legendDateText}>
              {legendDateParts!.prefix}{legendDateParts!.weekday}{` ${legendPeriod}`}
            </Text>
            <View style={styles.legendValueRow}>
              <Text style={[styles.legendValue, { color: colors.systolic }]}>{legendData.sys}</Text>
              <Text style={styles.legendSlash}>/</Text>
              <Text style={[styles.legendValue, { color: colors.diastolic }]}>{legendData.dia}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: colors.systolic }]} />
              <Text style={styles.legendLabel}>{t('upper_long')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: colors.diastolic }]} />
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
                    width: 1.5,
                    height: chartHeight,
                    backgroundColor: colors.textLabel,
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
                color1={colors.systolic}
                color2={colors.diastolic}
                thickness1={3.5}
                thickness2={3.5}
                dataPointsColor1={colors.systolic}
                dataPointsColor2={colors.diastolic}
                dataPointsRadius={7}
                width={Math.max(SCREEN_WIDTH - CHART_INNER_PADDING * 2, monthly.length * POINT_SPACING)}
                height={chartHeight}
                hideYAxisText
                yAxisLabelWidth={0}
                hideRules={false}
                rulesColor={colors.chartGrid}
                yAxisColor={colors.infoBorder}
                xAxisColor={colors.infoBorder}
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
                  color: colors.goalLine,
                  thickness: 1.5,
                  dashWidth: 7,
                  dashGap: 6,
                }}
                showReferenceLine2
                referenceLine2Position={goals.diastolic}
                referenceLine2Config={{
                  color: colors.goalLine,
                  thickness: 1.5,
                  dashWidth: 7,
                  dashGap: 6,
                }}
                pointerConfig={{
                  activatePointersInstantlyOnTouch: true,
                  pointerStripWidth: 0,
                  pointerStripHeight: chartHeight,
                  pointerStripColor: 'transparent',
                  pointer1Color: colors.systolic,
                  pointer2Color: colors.diastolic,
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
                        color: colors.textSecondary,
                        fontSize: 19,
                        fontWeight: '500',
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
  goalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain,
  },
  goalBarBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    borderRadius: 9,
  },
  goalBarBtnText: { fontSize: 17, color: colors.textPrimary, fontWeight: '600' },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  goalItemLabel: { fontSize: 17, color: colors.textLabel, fontWeight: '600' },
  goalValue: { fontSize: 26, color: colors.textSecondary, fontWeight: '600', textAlign: 'right' },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain,
  },
  legendDateText: { fontSize: 21, color: colors.textPrimary, fontWeight: '600' },
  legendValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  legendSlash: { fontSize: 24, fontWeight: '300', color: colors.decoration },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendSwatch: { width: 16, height: 3, borderRadius: 1.5 },
  legendLabel: { fontSize: 19, fontWeight: '600', color: colors.textSecondary },
  legendValue: { fontSize: 32, fontWeight: '700' },
  chartArea: { flex: 1 },
  chartWrapper: {
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 22, color: colors.textPlaceholder },
});
