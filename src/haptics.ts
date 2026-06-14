// Haptic feedback must not be removed — it is a core UX requirement for the keypad.
import * as Haptics from 'expo-haptics';

export function hapticKeyPress() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticDelete() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticSave() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
