# Deep Sleep — 개인정보 처리방침 (Privacy Policy)

> **최종 수정일**: 2026-04-13  
> **시행일**: 2026-04-13  
> **앱 이름**: Deep Sleep  
> **개발자**: Deep Sleep Team  
> **연락처**: deepsleep.app.contact@gmail.com

---

## 1. 수집하는 개인정보 항목

Deep Sleep 앱은 사용자의 개인정보를 최소한으로 수집합니다.

### 1.1 자동 수집 항목

| 항목 | 수집 목적 | 보관 기간 |
|------|----------|----------|
| 기기 가속도계 데이터 | 수면 추적 (수면/각성 판별) | 기기 내 로컬 저장, 365일 후 자동 삭제 |
| 마이크 오디오 데이터 | 코골이 감지 (선택 기능) | 분석 즉시 삭제, 코골이 이벤트 메타데이터만 로컬 저장 |
| 앱 사용 패턴 | 수면 기록, 알람 설정, 프리셋 사용 | 기기 내 로컬 저장 |

### 1.2 선택 수집 항목

| 항목 | 수집 목적 | 보관 기간 |
|------|----------|----------|
| 아침 설문 응답 | 수면 품질 분석 | 기기 내 로컬 저장 |
| AI 추천 입력 텍스트 | 사운드 추천 생성 | Google Gemini API로 전송, 응답 후 미보관 |

### 1.3 수집하지 않는 항목

- 이름, 이메일, 전화번호 등 개인 식별 정보
- 위치 정보 (GPS)
- 연락처, 사진, 파일 등 기기 내 다른 데이터
- 오디오 원본 녹음 (코골이 감지 기능은 분석 후 즉시 삭제)

---

## 2. 개인정보의 처리 목적

수집된 정보는 다음 목적으로만 사용됩니다:

1. **수면 추적 및 분석**: 가속도계 데이터를 활용한 수면/각성 판별, 수면 점수 산출
2. **코골이 감지**: 마이크 데이터를 로컬에서 분석하여 코골이 이벤트 감지 (사용자 동의 시에만)
3. **AI 사운드 추천**: 사용자 입력 텍스트를 Google Gemini API로 전송하여 맞춤 사운드 조합 생성
4. **구독 관리**: RevenueCat 서비스를 통한 구독 상태 확인 (Google Play 계정 기반)
5. **광고 표시**: Google AdMob을 통한 배너 광고 (무료 사용자)

---

## 3. 개인정보의 제3자 제공

### 3.1 제3자 서비스

| 서비스 | 제공 데이터 | 목적 |
|--------|-----------|------|
| Google Gemini API | AI 추천 입력 텍스트 | 사운드 추천 생성 |
| RevenueCat | 익명 사용자 ID, 구매 영수증 | 구독 상태 관리 |
| Google AdMob | 광고 식별자 (GAID) | 광고 표시 및 최적화 |

### 3.2 제공하지 않는 경우

위 서비스를 제외하고 사용자의 개인정보를 제3자에게 판매, 대여, 공유하지 않습니다.

---

## 4. 개인정보의 보관 및 파기

### 4.1 보관 방식

- 모든 수면 기록, 설정, 프리셋 데이터는 **사용자 기기 내부(AsyncStorage)**에만 저장됩니다.
- 별도의 서버나 클라우드에 사용자 데이터를 전송하거나 저장하지 않습니다.

### 4.2 파기

- 앱 삭제 시 기기에 저장된 모든 데이터가 자동으로 삭제됩니다.
- Android 설정 → 앱 → Deep Sleep → 저장소 삭제를 통해 수동 삭제할 수 있습니다.
- 수면 기록은 365일 경과 후 자동 삭제됩니다.

---

## 5. 이용자의 권리

사용자는 다음의 권리를 행사할 수 있습니다:

1. **데이터 열람**: 앱 내 'My' 탭에서 모든 수면 기록을 확인할 수 있습니다.
2. **데이터 삭제**: 앱 내에서 개별 수면 기록을 삭제하거나, 앱 데이터 전체를 초기화할 수 있습니다.
3. **기능 비활성화**: 수면 추적, 코골이 감지 등 데이터 수집 기능을 개별적으로 비활성화할 수 있습니다.
4. **구독 관리**: Google Play 구독 관리에서 구독을 취소할 수 있습니다.
5. **광고 개인화 거부**: 기기 설정에서 광고 ID를 재설정하거나 개인화 광고를 비활성화할 수 있습니다.

---

## 6. 아동의 개인정보 보호

Deep Sleep은 만 14세 미만 아동을 대상으로 하지 않으며, 의도적으로 아동의 개인정보를 수집하지 않습니다. 만 14세 미만 아동의 개인정보가 수집된 것을 발견할 경우, 즉시 해당 정보를 삭제합니다.

---

## 7. 개인정보 보호를 위한 기술적 조치

1. **로컬 저장**: 모든 사용자 데이터는 기기 내부에만 저장됩니다.
2. **최소 수집**: 서비스에 필요한 최소한의 데이터만 수집합니다.
3. **즉시 삭제**: 멜 분석용 오디오 데이터는 분석 후 즉시 삭제됩니다.
4. **API 키 보안**: 서비스 API 키는 환경 변수와 EAS Secrets를 통해 관리됩니다.
5. **암호화 통신**: 제3자 서비스와의 통신은 HTTPS/TLS를 통해 암호화됩니다.

---

## 8. 쿠키 및 추적 기술

Deep Sleep 앱은 웹 쿠키를 사용하지 않습니다. Google AdMob에서 광고 식별자(GAID)를 사용할 수 있으며, 이는 기기 설정에서 관리할 수 있습니다.

---

## 9. 개인정보 처리방침의 변경

이 개인정보 처리방침은 관련 법령 변경이나 서비스 변경 시 수정될 수 있습니다. 변경 시 앱 내 공지 또는 본 페이지를 통해 안내합니다.

---

## 10. 문의처

개인정보 관련 문의사항이 있으시면 아래로 연락해주세요:

- **이메일**: deepsleep.app.contact@gmail.com
- **GitHub**: [https://github.com/your-repo/deep-sleep](https://github.com/your-repo/deep-sleep)

---

# Deep Sleep — Privacy Policy (English)

> **Last Updated**: April 13, 2026  
> **Effective Date**: April 13, 2026  
> **App Name**: Deep Sleep  
> **Developer**: Deep Sleep Team  
> **Contact**: deepsleep.app.contact@gmail.com

---

## 1. Information We Collect

### 1.1 Automatically Collected

| Data | Purpose | Retention |
|------|---------|-----------|
| Device accelerometer data | Sleep tracking (sleep/wake classification) | Stored locally on device, auto-deleted after 365 days |
| Microphone audio data | Snoring detection (optional feature) | Deleted immediately after analysis; only snoring event metadata stored locally |
| App usage patterns | Sleep records, alarm settings, preset usage | Stored locally on device |

### 1.2 Optionally Collected

| Data | Purpose | Retention |
|------|---------|-----------|
| Morning survey responses | Sleep quality analysis | Stored locally on device |
| AI recommendation input text | Sound recommendation generation | Sent to Google Gemini API, not retained after response |

### 1.3 Information We Do NOT Collect

- Personal identification information (name, email, phone number)
- Location data (GPS)
- Contacts, photos, files, or other device data
- Raw audio recordings (snoring detection analyzes and immediately discards audio)

---

## 2. How We Use Information

1. **Sleep Tracking & Analysis**: Accelerometer-based sleep/wake classification and sleep score calculation
2. **Snoring Detection**: Local on-device audio analysis for snoring events (user consent required)
3. **AI Sound Recommendations**: User input text sent to Google Gemini API for personalized sound combinations
4. **Subscription Management**: Via RevenueCat service using Google Play account
5. **Advertising**: Google AdMob banner ads (free users only)

---

## 3. Third-Party Services

| Service | Data Shared | Purpose |
|---------|------------|---------|
| Google Gemini API | AI recommendation input text | Sound recommendation generation |
| RevenueCat | Anonymous user ID, purchase receipts | Subscription state management |
| Google AdMob | Advertising identifier (GAID) | Ad display and optimization |

We do not sell, rent, or share your personal information with any other third parties.

---

## 4. Data Storage & Deletion

- All sleep records, settings, and preset data are stored **only on your device** (AsyncStorage).
- No user data is transmitted to or stored on external servers.
- Uninstalling the app automatically deletes all stored data.
- Sleep records are automatically deleted after 365 days.

---

## 5. Your Rights

1. **Access**: View all sleep records in the 'My' tab within the app.
2. **Deletion**: Delete individual sleep records or reset all app data.
3. **Opt-out**: Disable sleep tracking, snoring detection, and other data collection features individually.
4. **Subscription**: Cancel subscriptions via Google Play subscription management.
5. **Ad Personalization**: Reset advertising ID or disable personalized ads in device settings.

---

## 6. Children's Privacy

Deep Sleep is not directed at children under 14. We do not knowingly collect personal information from children under 14.

---

## 7. Security Measures

1. **Local Storage**: All user data stored only on the device.
2. **Minimal Collection**: Only data necessary for service operation is collected.
3. **Immediate Deletion**: Audio data for analysis is deleted immediately after processing.
4. **API Key Security**: Service API keys managed via environment variables and EAS Secrets.
5. **Encrypted Communication**: All third-party service communication uses HTTPS/TLS.

---

## 8. Changes to This Policy

This privacy policy may be updated to reflect changes in laws or services. Changes will be communicated through in-app notifications or this page.

---

## 9. Contact Us

For privacy-related inquiries:

- **Email**: deepsleep.app.contact@gmail.com
