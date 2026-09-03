// モノクロ基調デザインの共通カラーパレット。
// 値は .personal/改善0903/README.md の「デザイントークン」を基準に、背景色のみユーザー指示で明るく調整。
export const colors = {
  background: '#FAFAF8',
  borderMain: '#D3CEC1',
  borderSub: '#DCD7CA',
  textPrimary: '#0A0A0A',
  textSecondary: '#6B6963',
  textLabel: '#8B8982',
  textPlaceholder: '#AAA69D',
  decoration: '#BDB8AA',
  infoBorder: '#C2BDAF',
  systolic: '#C81E2B',
  diastolic: '#1D4ED8',
  buttonBg: '#0A0A0A',
  buttonText: '#FFFFFF',
  // グラフ画面固有
  goalLine: '#A8A49B',
  chartGrid: '#D8D3C6',
} as const;
