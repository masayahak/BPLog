import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Measurement, Period } from '../types';
import { loadMeasurements, saveMeasurements } from '../storage';
import { getPeriod, toDateString, toTimeString } from '../utils';

type State = { measurements: Measurement[] };

type Action =
  | { type: 'LOAD'; payload: Measurement[] }
  | { type: 'UPSERT'; payload: Measurement };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { measurements: action.payload };
    case 'UPSERT': {
      const m = action.payload;
      const existing = state.measurements.findIndex(
        (x) => x.date === m.date && x.period === m.period
      );
      if (existing >= 0) {
        const updated = [...state.measurements];
        updated[existing] = m;
        return { measurements: updated };
      }
      return { measurements: [...state.measurements, m] };
    }
  }
}

type ContextType = {
  measurements: Measurement[];
  addMeasurement: (systolic: number, diastolic: number, pulse: number) => void;
  addMeasurementForDate: (date: string, period: Period, systolic: number, diastolic: number, pulse: number) => void;
};

const MeasurementContext = createContext<ContextType>({} as ContextType);

export function MeasurementProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { measurements: [] });

  useEffect(() => {
    loadMeasurements().then((data) => dispatch({ type: 'LOAD', payload: data }));
  }, []);

  useEffect(() => {
    saveMeasurements(state.measurements);
  }, [state.measurements]);

  function addMeasurement(systolic: number, diastolic: number, pulse: number) {
    const now = new Date();
    const time = toTimeString(now);
    const period: Period = getPeriod(time);
    const entry: Measurement = {
      id: now.getTime().toString(),
      date: toDateString(now),
      time,
      period,
      systolic,
      diastolic,
      pulse,
    };
    dispatch({ type: 'UPSERT', payload: entry });
  }

  function addMeasurementForDate(date: string, period: Period, systolic: number, diastolic: number, pulse: number) {
    const entry: Measurement = {
      id: Date.now().toString(),
      date,
      time: '',
      period,
      systolic,
      diastolic,
      pulse,
    };
    dispatch({ type: 'UPSERT', payload: entry });
  }

  return (
    <MeasurementContext.Provider value={{ measurements: state.measurements, addMeasurement, addMeasurementForDate }}>
      {children}
    </MeasurementContext.Provider>
  );
}

export function useMeasurements() {
  return useContext(MeasurementContext);
}
