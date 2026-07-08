import React from 'react';
import { Modal, View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useLocale } from '../context/LocaleContext';
import HapticButton from './HapticButton';

const APP_STORE_URL = 'https://apps.apple.com/app/id6780784285';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ShareModal({ visible, onClose }: Props) {
  const { t } = useLocale();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('share_title')}</Text>
          <HapticButton style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>{t('close')}</Text>
          </HapticButton>
        </View>

        <View style={styles.content}>
          <View style={styles.qrBox}>
            <QRCode value={APP_STORE_URL} size={220} />
          </View>
          <Text style={styles.intro}>{t('share_intro')}</Text>
          <Image source={require('../../assets/icon.png')} style={styles.icon} />
        </View>
      </SafeAreaView>
    </Modal>
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
    color: '#444',
    lineHeight: 28,
    textAlign: 'center',
  },
  qrBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
});
