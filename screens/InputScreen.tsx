import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMeasurements } from "../src/context/MeasurementContext";
import { useLocale } from "../src/context/LocaleContext";
import InfoModal from "../src/components/InfoModal";
import { Measurement, Period } from "../src/types";
import {
  toDateString,
  toTimeString,
  getPeriod,
  getDateParts,
  isFuturePeriod,
} from "../src/utils";
import { useDoubleTap } from "../src/hooks/useDoubleTap";
import { useNow } from "../src/hooks/useNow";
import { hapticKeyPress } from "../src/haptics";
import HapticButton from "../src/components/HapticButton";
import InputDialog from "../src/components/InputDialog";
import { colors } from "../src/theme/colors";

const tabularNums: TextStyle = { fontVariant: ["tabular-nums"] };

export default function InputScreen() {
  const { measurements } = useMeasurements();
  const { t, locale } = useLocale();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<{
    date: string;
    period: Period;
  } | null>(null);
  const [dialogInitial, setDialogInitial] = useState<
    { systolic: number; diastolic: number; pulse: number } | undefined
  >();
  const [infoVisible, setInfoVisible] = useState(false);
  const detectDoubleTap = useDoubleTap();
  const insets = useSafeAreaInsets();

  const now = useNow();

  const todayStr = toDateString(now);
  const currentPeriod: Period = getPeriod(toTimeString(now));

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  function getMeasurement(
    date: string,
    period: Period,
  ): Measurement | undefined {
    return measurements.find((m) => m.date === date && m.period === period);
  }

  function handleCellTap(date: string, period: Period) {
    if (isFuturePeriod(date, period)) return;
    if (!detectDoubleTap(`${date}-${period}`)) return;
    hapticKeyPress();
    const existing = getMeasurement(date, period);
    setDialogTarget({ date, period });
    setDialogInitial(
      existing
        ? {
            systolic: existing.systolic,
            diastolic: existing.diastolic,
            pulse: existing.pulse,
          }
        : undefined,
    );
    setDialogVisible(true);
  }

  function handleAddPress() {
    const existing = getMeasurement(todayStr, currentPeriod);
    setDialogTarget({ date: todayStr, period: currentPeriod });
    setDialogInitial(
      existing
        ? {
            systolic: existing.systolic,
            diastolic: existing.diastolic,
            pulse: existing.pulse,
          }
        : undefined,
    );
    setDialogVisible(true);
  }

  const todayCurrentMeasured = !!getMeasurement(todayStr, currentPeriod);
  const todayShowAddPeriod: Period | null = todayCurrentMeasured
    ? null
    : currentPeriod;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("screen_input_title")}</Text>
        <HapticButton
          style={styles.infoBtn}
          onPress={() => setInfoVisible(true)}
        >
          <Text style={styles.infoBtnText}>i</Text>
        </HapticButton>
      </View>

      <View style={styles.content}>
        <View style={styles.todayBlock}>
          <View style={styles.todayHeadingRow}>
            <Text style={styles.todayLabel}>{t("today")}</Text>
            <Text style={styles.todayDate}>{formatDate(todayStr, locale)}</Text>
          </View>
          <View style={styles.todayRows}>
            <PeriodRow
              size="today"
              label={t("am")}
              data={getMeasurement(todayStr, "AM")}
              showAdd={todayShowAddPeriod === "AM"}
              isFuture={isFuturePeriod(todayStr, "AM")}
              pulseLabel={t("pulse_label")}
              notRecordedLabel={t("not_recorded")}
              recordLabel={t("record_action")}
              onPress={() => handleCellTap(todayStr, "AM")}
              onAddPress={handleAddPress}
              borderBottom
            />
            <PeriodRow
              size="today"
              label={t("pm")}
              data={getMeasurement(todayStr, "PM")}
              showAdd={todayShowAddPeriod === "PM"}
              isFuture={isFuturePeriod(todayStr, "PM")}
              pulseLabel={t("pulse_label")}
              notRecordedLabel={t("not_recorded")}
              recordLabel={t("record_action")}
              onPress={() => handleCellTap(todayStr, "PM")}
              onAddPress={handleAddPress}
            />
          </View>
          <View style={styles.todaySpacer} />
        </View>

        <View style={styles.yesterdayBlock}>
          <View style={styles.yesterdayHeadingRow}>
            <Text style={styles.yesterdayLabel}>{t("yesterday")}</Text>
            <Text style={styles.yesterdayDate}>
              {formatDate(yesterdayStr, locale)}
            </Text>
          </View>
          <View style={styles.yesterdayPanel}>
            <PeriodRow
              size="yesterday"
              label={t("am")}
              data={getMeasurement(yesterdayStr, "AM")}
              showAdd={false}
              isFuture={false}
              pulseLabel={t("pulse_label")}
              notRecordedLabel={t("not_recorded")}
              onPress={() => handleCellTap(yesterdayStr, "AM")}
              borderBottom
            />
            <PeriodRow
              size="yesterday"
              label={t("pm")}
              data={getMeasurement(yesterdayStr, "PM")}
              showAdd={false}
              isFuture={false}
              pulseLabel={t("pulse_label")}
              notRecordedLabel={t("not_recorded")}
              onPress={() => handleCellTap(yesterdayStr, "PM")}
            />
          </View>
        </View>
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

function formatDate(dateStr: string, locale: string): string {
  const { prefix, weekday, suffix } = getDateParts(dateStr, locale);
  return `${prefix}${weekday}${suffix}`;
}

type Size = "today" | "yesterday";

function PeriodRow({
  size,
  label,
  data,
  showAdd,
  isFuture,
  pulseLabel,
  notRecordedLabel,
  recordLabel,
  onPress,
  onAddPress,
  borderBottom,
}: {
  size: Size;
  label: string;
  data?: Measurement;
  showAdd: boolean;
  isFuture: boolean;
  pulseLabel: string;
  notRecordedLabel: string;
  recordLabel?: string;
  onPress: () => void;
  onAddPress?: () => void;
  borderBottom?: boolean;
}) {
  const isToday = size === "today";
  const rowStyle = [
    isToday ? styles.todayRow : styles.yesterdayRow,
    borderBottom && styles.rowDivider,
  ];

  // data の有無を最優先で判定する（showAdd は対象期間が未測定のときだけ true になるため、
  // 実際には data と showAdd が同時に成立することはないが、既存ロジックの優先順位を踏襲する）。
  if (data) {
    return (
      <TouchableOpacity style={rowStyle} activeOpacity={0.7} onPress={onPress}>
        <Text style={isToday ? styles.todayRowLabel : styles.yesterdayRowLabel}>
          {label}
        </Text>
        <View style={styles.valueGroup}>
          <Text
            style={[
              isToday ? styles.todaySystolic : styles.yesterdaySystolic,
              tabularNums,
            ]}
          >
            {data.systolic}
          </Text>
          <Text style={isToday ? styles.todaySlash : styles.yesterdaySlash}>
            {" "}
            /{" "}
          </Text>
          <Text
            style={[
              isToday ? styles.todayDiastolic : styles.yesterdayDiastolic,
              tabularNums,
            ]}
          >
            {data.diastolic}
          </Text>
        </View>
        <Text
          style={[
            isToday ? styles.todayPulse : styles.yesterdayPulse,
            tabularNums,
          ]}
        >
          {pulseLabel} {data.pulse}
        </Text>
      </TouchableOpacity>
    );
  }

  if (showAdd) {
    return (
      <View style={rowStyle}>
        <Text style={isToday ? styles.todayRowLabel : styles.yesterdayRowLabel}>
          {label}
        </Text>
        <View style={styles.centerSlot}>
          <HapticButton style={styles.recordBtn} onPress={onAddPress}>
            <Text style={styles.recordBtnText}>{recordLabel}</Text>
          </HapticButton>
        </View>
      </View>
    );
  }

  if (isFuture) {
    return (
      <View style={rowStyle}>
        <Text style={isToday ? styles.todayRowLabel : styles.yesterdayRowLabel}>
          {label}
        </Text>
        <View style={styles.centerSlot}>
          <View style={[styles.recordBtn, styles.recordBtnDisabled]}>
            <Text style={styles.recordBtnText}>{recordLabel}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={rowStyle} activeOpacity={0.7} onPress={onPress}>
      <Text style={isToday ? styles.todayRowLabel : styles.yesterdayRowLabel}>
        {label}
      </Text>
      <View style={styles.centerSlot}>
        <Text
          style={
            isToday ? styles.todayPlaceholder : styles.yesterdayPlaceholder
          }
        >
          {notRecordedLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: 22,
    paddingTop: 2,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  infoBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.infoBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBtnText: {
    fontSize: 19,
    fontWeight: "600",
    color: colors.textSecondary,
    fontFamily: "Georgia",
  },

  content: { flex: 1, flexDirection: "column", paddingBottom: 24 },

  todayBlock: { flex: 1.85, flexDirection: "column", minHeight: 0 },
  todayHeadingRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    paddingTop: 34,
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  todayLabel: { fontSize: 25, fontWeight: "600", color: colors.textLabel },
  todayDate: { fontSize: 26, fontWeight: "700", color: colors.textPrimary },
  todayRows: {
    flexDirection: "column",
    borderTopWidth: 1,
    borderTopColor: colors.borderMain,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain,
  },
  todaySpacer: { flex: 1 },
  todayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 22,
    paddingVertical: 25,
  },
  todayRowLabel: {
    width: 44,
    fontSize: 23,
    fontWeight: "600",
    color: colors.textLabel,
  },

  yesterdayBlock: {
    flex: 0.82,
    flexDirection: "column",
    minHeight: 0,
    paddingTop: 12,
    paddingHorizontal: 22,
    paddingVertical: 6,
  },
  yesterdayHeadingRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    paddingBottom: 20,
  },
  yesterdayLabel: { fontSize: 19, fontWeight: "600", color: colors.textLabel },
  yesterdayDate: {
    fontSize: 19,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  yesterdayPanel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderMain,
    borderRadius: 14,
    flexDirection: "column",
    minHeight: 0,
  },
  yesterdayRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
  },
  yesterdayRowLabel: {
    width: 34,
    fontSize: 17,
    fontWeight: "600",
    color: colors.textLabel,
  },

  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSub },

  centerSlot: { flex: 1, alignItems: "center" },
  recordBtn: {
    paddingVertical: 18,
    paddingHorizontal: 34,
    backgroundColor: colors.buttonBg,
    borderRadius: 9,
  },
  recordBtnDisabled: { backgroundColor: colors.decoration },
  recordBtnText: { fontSize: 21, fontWeight: "700", color: colors.buttonText },

  valueGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },

  todaySystolic: {
    fontSize: 52,
    fontWeight: "700",
    color: colors.systolic,
    letterSpacing: -2,
  },
  todaySlash: { fontSize: 38, fontWeight: "300", color: colors.decoration },
  todayDiastolic: {
    fontSize: 52,
    fontWeight: "700",
    color: colors.diastolic,
    letterSpacing: -2,
  },
  todayPulse: { fontSize: 19, fontWeight: "600", color: colors.textPrimary },
  todayPlaceholder: {
    fontSize: 22,
    fontWeight: "500",
    color: colors.textPlaceholder,
  },

  yesterdaySystolic: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.systolic,
    letterSpacing: -1,
  },
  yesterdaySlash: { fontSize: 22, fontWeight: "300", color: colors.decoration },
  yesterdayDiastolic: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.diastolic,
    letterSpacing: -1,
  },
  yesterdayPulse: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  yesterdayPlaceholder: {
    fontSize: 20,
    fontWeight: "500",
    color: colors.textPlaceholder,
  },
});
