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

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function InfoModal({ visible, onClose }: Props) {
  const { t, locale } = useLocale();
  const [shareVisible, setShareVisible] = React.useState(false);
  const contactUrl =
    locale === 'ja'
      ? 'https://bplog.hakamata-soft.com/#contact'
      : 'https://bplog.hakamata-soft.com/en/#contact';

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
            <Text style={styles.closeBtnText}>{t('close')}</Text>
          </HapticButton>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

          <Section icon="💰" title={t('info_free_title')}>
            <Text style={styles.body}>{t('info_free_body')}</Text>
          </Section>

          <Section icon="🔒" title={t('info_privacy_title')}>
            <Text style={styles.body}>{t('info_privacy_body')}</Text>
          </Section>

          <View style={styles.actions}>
            <HapticButton
              style={styles.actionBtn}
              onPress={() => setShareVisible(true)}
            >
              <Text style={styles.actionBtnIcon}>👥</Text>
              <Text style={styles.actionBtnText}>{t('info_share_btn')}</Text>
            </HapticButton>

            <HapticButton
              style={styles.actionBtn}
              onPress={handleReview}
            >
              <Text style={styles.actionBtnIcon}>⭐</Text>
              <Text style={styles.actionBtnText}>{t('info_review_btn')}</Text>
            </HapticButton>

            <HapticButton
              style={styles.actionBtn}
              onPress={() => Linking.openURL(contactUrl)}
            >
              <Text style={styles.actionBtnIcon}>✉️</Text>
              <Text style={styles.actionBtnText}>{t('info_contact_btn')}</Text>
            </HapticButton>
          </View>

        </ScrollView>
      </SafeAreaView>

      <ShareModal visible={shareVisible} onClose={() => setShareVisible(false)} />
    </Modal>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#2e2e4a',
    borderRadius: 8,
  },
  closeBtnText: { fontSize: 18, color: '#ccc', fontWeight: '600' },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16 },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIcon: { fontSize: 26 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e' },
  body: { fontSize: 19, color: '#444', lineHeight: 29 },

  actions: { gap: 12, marginTop: 4 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  actionBtnIcon: { fontSize: 26 },
  actionBtnText: { fontSize: 20, fontWeight: '600', color: '#1a1a2e' },
});
