import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'terms' | 'privacy';
}

export function TermsModal({ visible, onClose, mode = 'terms' }: TermsModalProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 220, friction: 22, useNativeDriver: true }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.92, duration: 150, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  }, [onClose, fadeAnim, scaleAnim]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: themeColors.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          padding: layout.screenPaddingH,
        },
        sheet: {
          width: '100%',
          backgroundColor: themeColors.bgSecondary,
          borderRadius: layout.borderRadiusLg,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
          maxHeight: '85%',
          paddingBottom: spacing['2xl'],
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: layout.cardPadding,
          paddingVertical: spacing.base,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.glassBorder,
        },
        title: { ...typography.h3, color: themeColors.textPrimary, flex: 1 },
        closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
        closeText: { color: themeColors.textMuted, fontSize: 18 },
        scroll: { flex: 1 },
        scrollContent: { padding: layout.cardPadding },
        content: { ...typography.body, color: themeColors.textSecondary, lineHeight: 22 },
        confirmBtn: {
          marginHorizontal: layout.cardPadding,
          marginTop: spacing.md,
          backgroundColor: themeColors.accent1,
          borderRadius: layout.borderRadiusMd,
          paddingVertical: spacing.md,
          alignItems: 'center',
        },
        confirmText: { ...typography.bodyMedium, color: '#ffffff' },
      }),
    [themeColors],
  );

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={[styles.sheet, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{mode === 'privacy' ? t('settings.privacyTitle') : t('settings.termsTitle')}</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.content}>{mode === 'privacy' ? t('settings.privacyContent') : t('settings.termsContent')}</Text>
          </ScrollView>
          <Pressable style={styles.confirmBtn} onPress={handleClose}>
            <Text style={styles.confirmText}>{t('common.ok')}</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
