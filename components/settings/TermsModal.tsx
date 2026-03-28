import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, layout } from '@/theme';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
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

export function TermsModal({ visible, onClose }: TermsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>이용약관</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.content}>{TERMS_CONTENT}</Text>
          </ScrollView>
          <Pressable style={styles.confirmBtn} onPress={onClose}>
            <Text style={styles.confirmText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: layout.borderRadiusLg,
    borderTopRightRadius: layout.borderRadiusLg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    maxHeight: '85%',
    paddingBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 18,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.cardPadding,
  },
  content: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  confirmBtn: {
    marginHorizontal: layout.cardPadding,
    marginTop: spacing.md,
    backgroundColor: colors.accent1,
    borderRadius: layout.borderRadiusMd,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmText: {
    ...typography.bodyMedium,
    color: colors.white,
  },
});
