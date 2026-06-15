import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goals, Measurement } from './types';

const KEY = 'measurements';
const GOALS_KEY = 'bp_goals';

export const DEFAULT_GOALS: Goals = { systolic: 130, diastolic: 80 };

export async function loadMeasurements(): Promise<Measurement[]> {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : [];
}

export async function saveMeasurements(data: Measurement[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function loadGoals(): Promise<Goals> {
  const json = await AsyncStorage.getItem(GOALS_KEY);
  return json ? JSON.parse(json) : DEFAULT_GOALS;
}

export async function saveGoals(goals: Goals): Promise<void> {
  await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}
