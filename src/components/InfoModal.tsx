import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as StoreReview from 'expo-store-review';
import { useLocale } from '../context/LocaleContext';
import HapticButton from './HapticButton';

const PORTFOLIO_URL = 'https://www.hakamata-soft.com/';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function InfoModal({ visible, onClose }: Props) {
  const { t } = useLocale();

  async function handleReview() {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
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
              onPress={() => Linking.openURL(PORTFOLIO_URL)}
            >
              <Text style={styles.actionBtnIcon}>🌐</Text>
              <Text style={styles.actionBtnText}>{t('info_developer_site')}</Text>
            </HapticButton>

            <HapticButton
              style={[styles.actionBtn, styles.reviewBtn]}
              onPress={handleReview}
            >
              <Text style={styles.actionBtnIcon}>⭐</Text>
              <Text style={[styles.actionBtnText, styles.reviewBtnText]}>{t('info_review_btn')}</Text>
            </HapticButton>
          </View>

        </ScrollView>
      </SafeAreaView>
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#2e2e4a',
    borderRadius: 8,
  },
  closeBtnText: { fontSize: 16, color: '#ccc', fontWeight: '600' },

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
  sectionIcon: { fontSize: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  body: { fontSize: 17, color: '#444', lineHeight: 26 },

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
  reviewBtn: {
    backgroundColor: '#4361ee',
  },
  actionBtnIcon: { fontSize: 24 },
  actionBtnText: { fontSize: 18, fontWeight: '600', color: '#1a1a2e' },
  reviewBtnText: { color: '#fff' },
});
