export type Locale = "ja" | "en";

type Translations = {
  tab_input: string;
  tab_list: string;
  tab_trends: string;
  tab_graph: string;
  screen_input_title: string;
  today: string;
  yesterday: string;
  am: string;
  pm: string;
  not_recorded: string;
  pulse_label: string;
  target: string;
  upper_short: string;
  lower_short: string;
  upper_long: string;
  lower_long: string;
  no_data: string;
  period_7days: string;
  period_30days: string;
  stat_avg: string;
  stat_max: string;
  stat_min: string;
  trend_bp_upper: string;
  trend_bp_lower: string;
  field_systolic: string;
  field_diastolic: string;
  field_pulse: string;
  recorded_value: string;
  current_target: string;
  next: string;
  save: string;
  close: string;
  delete_record: string;
  delete_confirm: string;
  cancel: string;
  // Info modal
  info_title: string;
  info_free_title: string;
  info_free_body: string;
  info_privacy_title: string;
  info_privacy_body: string;
  info_developer_site: string;
  info_review_btn: string;
  info_review_unavailable: string;
  info_share_btn: string;
  // Share modal
  share_title: string;
  share_intro: string;
  share_link_btn: string;
};

export type TranslationKey = keyof Translations;

const ja: Translations = {
  tab_input: "入力",
  tab_list: "一覧",
  tab_trends: "傾向",
  tab_graph: "グラフ",
  screen_input_title: "血圧入力",
  today: "今日",
  yesterday: "昨日",
  am: "午前",
  pm: "午後",
  not_recorded: "未測定",
  pulse_label: "脈",
  target: "目標値",
  upper_short: "上",
  lower_short: "下",
  upper_long: "上(収縮期)",
  lower_long: "下(拡張期)",
  no_data: "この月のデータはありません",
  period_7days: "直近7日間",
  period_30days: "直近30日間",
  stat_avg: "平均",
  stat_max: "最大",
  stat_min: "最小",
  trend_bp_upper: "血圧上",
  trend_bp_lower: "血圧下",
  field_systolic: "上の血圧",
  field_diastolic: "下の血圧",
  field_pulse: "脈拍",
  recorded_value: "記録済みの値",
  current_target: "目標の現在値",
  next: "次へ",
  save: "保存",
  close: "閉じる",
  delete_record: "削除",
  delete_confirm: "この記録を削除しますか？",
  cancel: "キャンセル",
  info_title: "アプリについて",
  info_free_title: "完全無料",
  info_free_body:
    "広告・課金・サブスクなし。シニアエンジニアが自分のために作ったアプリです。",
  info_privacy_title: "プライバシー",
  info_privacy_body:
    "データは端末内のみに保存。外部への送信は一切ありません。",
  info_developer_site: "開発者のウェブサイト",
  info_review_btn: "App Store でレビューを書く",
  info_review_unavailable: "レビューは App Store 版でご利用いただけます",
  info_share_btn: "友達にシェア",
  share_title: "友達にシェア",
  share_intro: "血圧が気になる方へ。\nこのQRコードをApp Storeへどうぞ。",
  share_link_btn: "リンクを送る",
};

const en: Translations = {
  tab_input: "Input",
  tab_list: "List",
  tab_trends: "Trends",
  tab_graph: "Graph",
  screen_input_title: "Blood Pressure",
  today: "Today",
  yesterday: "Yesterday",
  am: "AM",
  pm: "PM",
  not_recorded: "Not recorded",
  pulse_label: "P",
  target: "Target",
  upper_short: "Sys",
  lower_short: "Dia",
  upper_long: "Systolic",
  lower_long: "Diastolic",
  no_data: "No data for this month",
  period_7days: "Last 7 Days",
  period_30days: "Last 30 Days",
  stat_avg: "Avg",
  stat_max: "Max",
  stat_min: "Min",
  trend_bp_upper: "Sys",
  trend_bp_lower: "Dia",
  field_systolic: "Systolic",
  field_diastolic: "Diastolic",
  field_pulse: "Pulse",
  recorded_value: "Recorded value",
  current_target: "Current target",
  next: "Next",
  save: "Save",
  close: "Close",
  delete_record: "Delete",
  delete_confirm: "Delete this record?",
  cancel: "Cancel",
  info_title: "About",
  info_free_title: "Completely Free",
  info_free_body:
    "No ads, no subscriptions, no purchases. Built by a senior engineer for himself.",
  info_privacy_title: "Privacy",
  info_privacy_body:
    "All data stays on your device. Nothing is ever transmitted.",
  info_developer_site: "Developer's Website",
  info_review_btn: "Write a Review on App Store",
  info_review_unavailable: "Reviews are available on the App Store build",
  info_share_btn: "Share with a Friend",
  share_title: "Share with a Friend",
  share_intro: "Know someone who should track\ntheir blood pressure? Share this QR code.",
  share_link_btn: "Send Link",
};

export const translationsMap: Record<Locale, Translations> = { ja, en };
