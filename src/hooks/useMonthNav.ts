import { useState, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// 月送りナビゲーション（一覧画面・グラフ画面で共通）。
// 当月より未来へは進めない。
export function useMonthNav() {
  const [now, setNow] = useState(() => new Date());
  const [year, setYear] = useState(() => now.getFullYear());
  const [month, setMonth] = useState(() => now.getMonth() + 1);

  // フォーカス時の判定用に最新値を保持する（リスナーを張り直さないため ref で参照）。
  const stateRef = useRef({ now, year, month });
  stateRef.current = { now, year, month };

  // アプリを終了せず放置すると、now / year / month が起動時の値で固定される。
  // フォアグラウンド復帰時（画面ロック解除など）に「今」へ戻し、当月を初期表示する。
  // タブ切り替えでは発火しないため、セッション中の月送り操作は維持される。
  useFocusEffect(
    useCallback(() => {
      // AppState イベントはフォーカス中の画面にしか届かないため、
      // 裏に居た画面の now は古いまま（= canGoNext が false のまま）になる。
      // フォーカス時にも now を最新化し、旧「当月」を表示していた場合だけ新しい当月へ追従する。
      const n = new Date();
      const prev = stateRef.current;
      const wasCurrentMonth =
        prev.year === prev.now.getFullYear() && prev.month === prev.now.getMonth() + 1;
      setNow(n);
      if (wasCurrentMonth) {
        setYear(n.getFullYear());
        setMonth(n.getMonth() + 1);
      }

      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          const n = new Date();
          setNow(n);
          setYear(n.getFullYear());
          setMonth(n.getMonth() + 1);
        }
      });
      return () => sub.remove();
    }, [])
  );

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (!canGoNext) return;
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const canGoNext =
    year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);

  return { now, year, month, prevMonth, nextMonth, canGoNext };
}
