import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '../context/LocaleContext';
import HapticButton from './HapticButton';
import ShareModal from './ShareModal';
import { colors } from '../theme/colors';
import { dialogStyles } from './dialogStyles';
import { MoneyIcon, LockIcon, PeopleIcon, StarIcon, MailIcon } from './icons/InfoIcons';
import ChevronIcon from './icons/ChevronIcon';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function InfoModal({ visible, onClose }: Props) {
  const { t, locale } = useLocale();
  const [shareVisible, setShareVisible] = React.useState(false);
  const contactUrl =
    locale === 'ja'
      ? 'https://bplog.hakamata-soft.com/jp/#contact'
      : 'https://bplog.hakamata-soft.com/#contact';

  async function handleReview() {
    // 明示的な「評価する」ボタンは App Store のレビュー画面を直接開く。
    // requestReview() は本番でAppleに無言で抑制されるため、ボタンには使わない。
    const url = Platform.select({
      ios: 'https://apps.apple.com/app/id6780784285?action=write-review',
      android: 'market://details?id=com.hakamatasoft.bplog',
      default: '',
    });
    const canOpen = url ? await Linking.canOpenURL(url) : false;
    if (canOpen && url) {
      await Linking.openURL(url);
    } else {
      Alert.alert('', t('info_review_unavailable'));
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.title}>{t('info_title')}</Text>
          <HapticButton style={styles.closeBtn} onPress={onClose}>
            <Text style={dialogStyles.closeText}>{t('close')}</Text>
          </HapticButton>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

          <Section icon={<MoneyIcon color={colors.textPrimary} />} title={t('info_free_title')}>
            <Text style={styles.body}>{t('info_free_body')}</Text>
          </Section>

          <Section icon={<LockIcon color={colors.textPrimary} />} title={t('info_privacy_title')}>
            <Text style={styles.body}>{t('info_privacy_body')}</Text>
          </Section>

          <View style={styles.actions}>
            <HapticButton
              style={styles.actionRow}
              onPress={() => setShareVisible(true)}
            >
              <PeopleIcon color={colors.textPrimary} />
              <Text style={styles.actionRowText}>{t('info_share_btn')}</Text>
              <ChevronIcon direction="right" color={colors.decoration} size={20} />
            </HapticButton>

            <HapticButton
              style={styles.actionRow}
              onPress={handleReview}
            >
              <StarIcon color={colors.textPrimary} />
              <Text style={styles.actionRowText}>{t('info_review_btn')}</Text>
              <ChevronIcon direction="right" color={colors.decoration} size={20} />
            </HapticButton>

            <HapticButton
              style={[styles.actionRow, styles.actionRowLast]}
              onPress={() => Linking.openURL(contactUrl)}
            >
              <MailIcon color={colors.textPrimary} />
              <Text style={styles.actionRowText}>{t('info_contact_btn')}</Text>
              <ChevronIcon direction="right" color={colors.decoration} size={20} />
            </HapticButton>
          </View>

        </ScrollView>
      </SafeAreaView>

      <ShareModal visible={shareVisible} onClose={() => setShareVisible(false)} />
    </Modal>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
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

  scroll: { flex: 1 },
  scrollContent: { padding: 22 },

  section: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSub,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 17, color: colors.textSecondary, lineHeight: 25 },

  actions: { marginTop: 4 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSub,
  },
  actionRowLast: { borderBottomWidth: 0 },
  actionRowText: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.textPrimary },
});
