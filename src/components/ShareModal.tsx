import React from 'react';
import { Modal, View, Text, Image, Share, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useLocale } from '../context/LocaleContext';
import HapticButton from './HapticButton';
import { colors } from '../theme/colors';
import { dialogStyles } from './dialogStyles';
import { LinkIcon } from './icons/InfoIcons';

// OSごとのストアページ。QRコードはスキャンした端末のOSに合わせて出し分ける。
const STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/id6780784285',
  android: 'https://play.google.com/store/apps/details?id=com.hakamatasoft.bplog',
  default: 'https://apps.apple.com/app/id6780784285',
})!;

// LPのOGP設定でリンクプレビュー（タイトル・説明・アイコン）が自動表示されるため、
// メッセージ文言は付けずURLのみ共有する。
const LP_URLS = {
  ja: 'https://bplog.hakamata-soft.com/',
  en: 'https://bplog.hakamata-soft.com/en/',
} as const;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ShareModal({ visible, onClose }: Props) {
  const { t, locale } = useLocale();

  function handleSendLink() {
    Share.share({ message: LP_URLS[locale] });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('share_title')}</Text>
          <HapticButton style={styles.closeBtn} onPress={onClose}>
            <Text style={dialogStyles.closeText}>{t('close')}</Text>
          </HapticButton>
        </View>

        <View style={styles.content}>
          <View style={styles.qrBox}>
            <QRCode value={STORE_URL} size={220} />
          </View>
          <Text style={styles.intro}>{t('share_intro')}</Text>

          <HapticButton style={styles.linkBtn} onPress={handleSendLink}>
            <LinkIcon color={colors.buttonText} size={20} />
            <Text style={styles.linkBtnText}>{t('share_link_btn')}</Text>
          </HapticButton>

          <Image source={require('../../assets/icon.png')} style={styles.icon} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 4 },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 20,
  },
  intro: {
    fontSize: 19,
    color: colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  linkBtnText: { fontSize: 19, fontWeight: '600', color: colors.buttonText },
  qrBox: {
    // QRコードは読み取り精度のため常に白背景が必要（モノクロテーマの地色は使わない例外）。
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderMain,
  },
});
