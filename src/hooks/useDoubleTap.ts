import { useRef } from 'react';

// ダブルタップ検出（入力画面・一覧画面のセル編集で共通）。
// 同じ key を delay(ms) 以内に2回タップしたら true を返す。
// 誤タップで編集ダイアログが開くのを防ぐためシングルタップには何も割り当てない。
export function useDoubleTap(delay = 350) {
  const lastTapRef = useRef<{ key: string; time: number }>({ key: '', time: 0 });

  return function detectDoubleTap(key: string): boolean {
    const now = Date.now();
    if (lastTapRef.current.key === key && now - lastTapRef.current.time < delay) {
      lastTapRef.current = { key: '', time: 0 };
      return true;
    }
    lastTapRef.current = { key, time: now };
    return false;
  };
}
