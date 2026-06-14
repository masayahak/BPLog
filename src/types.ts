export type Period = 'AM' | 'PM';

export type Measurement = {
  id: string;
  date: string;   // 'YYYY-MM-DD'
  time: string;   // 'HH:mm'
  period: Period;
  systolic: number;
  diastolic: number;
  pulse: number;
};

export type Goals = {
  systolic: number;
  diastolic: number;
};
