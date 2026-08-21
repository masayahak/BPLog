import { useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// 「今」を保持する。アプリを終了せず放置すると、new Date() の結果は
// 再レンダーが起きるまで（＝画面によっては何日でも）古いままになる。
// フォーカス復帰時とフォアグラウンド復帰時に再計算し、日付・時間帯を最新化する。
// AppState イベントはフォーカス中の画面にしか届かないため、両方が必要。
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') setNow(new Date());
      });
      return () => sub.remove();
    }, [])
  );

  return now;
}
