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

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'terms' | 'privacy';
}

const TERMS_CONTENT = `제1조 (목적)
본 이용약관은 Deep Sleep(이하 "앱")이 제공하는 서비스의 이용에 관한 조건과 절차를 규정함을 목적으로 합니다.

제2조 (서비스 이용)
앱은 사용자에게 수면 사운드 믹싱, 알람, AI 수면 추천 등의 기능을 제공합니다. 사용자는 본 약관에 동의함으로써 서비스를 이용할 수 있습니다.

제3조 (구독 및 결제)
• 유료 구독(월간, 연간, 평생)을 통해 프리미엄 기능을 이용할 수 있습니다.
• 구독은 선택한 기간이 종료되기 24시간 전까지 취소하지 않으면 자동으로 갱신됩니다.
• 결제는 Google Play 계정을 통해 처리됩니다.
• 구독을 취소하려면 Google Play 스토어 > 구독 메뉴에서 직접 취소해야 합니다.

제4조 (환불 정책)
환불은 Google Play 스토어의 환불 정책에 따릅니다. 앱 내에서 직접 환불을 처리할 수 없으며, Google Play 고객센터를 통해 환불을 요청할 수 있습니다.

제5조 (개인정보 보호)
앱은 사용자의 개인정보를 소중히 여기며, 개인정보 처리방침에 따라 처리합니다. 앱이 수집하는 정보는 앱 사용 통계 및 서비스 개선 목적으로만 사용됩니다.

제6조 (서비스 변경 및 중단)
앱은 서비스의 내용을 변경하거나 일시적으로 중단할 수 있습니다. 서비스 중단 시 사용자에게 사전 공지합니다.

제7조 (면책 조항)
앱은 사용자의 부주의로 인한 손해, 제3자의 침해 행위로 인한 손해, 천재지변으로 인한 서비스 중단에 대해 책임을 지지 않습니다.

제8조 (준거법 및 관할)
본 약관은 대한민국 법률에 따라 해석되며, 분쟁 발생 시 서울중앙지방법원을 전속 관할 법원으로 합니다.

시행일: 2026년 3월 1일`;

const PRIVACY_CONTENT = `Deep Sleep(이하 "앱")은 사용자의 개인정보를 중요하게 생각하며, 아래와 같이 개인정보를 처리하고 있습니다.

1. 수집하는 개인정보
앱은 서비스 제공 및 개선을 위해 다음과 같은 정보를 수집할 수 있습니다.
• 기기 정보: 기기 모델, 운영체제 버전, 앱 버전
• 사용 통계: 앱 사용 패턴, 기능 사용 빈도 (비식별화된 형태)
• 구독 정보: 결제 상태 (Google Play를 통해 처리)

2. 개인정보의 이용 목적
수집된 정보는 다음 목적으로 이용됩니다.
• 앱 서비스 제공 및 유지
• 앱 성능 개선 및 버그 수정
• 구독 상태 관리
• 사용자 경험 개선을 위한 분석

3. 개인정보의 보관 및 파기
• 앱 삭제 시 기기에 저장된 모든 데이터가 삭제됩니다.
• 서버에 저장된 비식별 통계 데이터는 수집일로부터 1년 후 자동 삭제됩니다.

4. 개인정보의 제3자 제공
앱은 사용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 법률에 따라 요구되는 경우에는 예외로 합니다.

5. 광고
무료 사용자에게 Google AdMob을 통해 광고가 표시될 수 있습니다. Google의 개인정보 처리방침은 Google의 약관을 따릅니다.

6. 사용자의 권리
사용자는 언제든지 앱 데이터를 삭제하거나, 앱을 삭제하여 개인정보 처리를 중단할 수 있습니다.

7. 문의
개인정보 관련 문의는 아래 이메일로 연락 부탁드립니다.
이메일: support@deepsleep.app

시행일: 2026년 3월 1일`;

export function TermsModal({ visible, onClose, mode = 'terms' }: TermsModalProps) {
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
            <Text style={styles.title}>{mode === 'privacy' ? '개인정보 처리방침' : '이용약관'}</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.content}>{mode === 'privacy' ? PRIVACY_CONTENT : TERMS_CONTENT}</Text>
          </ScrollView>
          <Pressable style={styles.confirmBtn} onPress={handleClose}>
            <Text style={styles.confirmText}>확인</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
