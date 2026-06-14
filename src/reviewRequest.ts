import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toDateString } from './utils';

const FIRST_LAUNCH_KEY = 'bp_first_launch';
const REVIEW_STATUS_KEY = 'bp_review_status';

type ReviewStatus = 'pending' | 'requested_once' | 'done';

export async function initFirstLaunch(): Promise<void> {
  const existing = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
  if (!existing) {
    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, toDateString(new Date()));
  }
}

export async function checkAndRequestReview(measurementCount: number): Promise<void> {
  const rawStatus = await AsyncStorage.getItem(REVIEW_STATUS_KEY);
  const status: ReviewStatus = (rawStatus as ReviewStatus) ?? 'pending';
  if (status === 'done') return;

  const firstLaunch = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
  if (!firstLaunch) return;

  const daysSince = Math.floor(
    (Date.now() - new Date(firstLaunch + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)
  );

  const canReview = await StoreReview.isAvailableAsync();
  if (!canReview) return;

  if (status === 'pending' && measurementCount >= 10 && daysSince >= 5) {
    await StoreReview.requestReview();
    await AsyncStorage.setItem(REVIEW_STATUS_KEY, 'requested_once');
  } else if (status === 'requested_once' && measurementCount >= 20) {
    await StoreReview.requestReview();
    await AsyncStorage.setItem(REVIEW_STATUS_KEY, 'done');
  }
}
