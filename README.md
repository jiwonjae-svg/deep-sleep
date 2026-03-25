<div align="center">

# 🌙 Deep Sleep

**Your Intelligent Sleep Sound Companion**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/jiwonjae-svg/deep-sleep)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2052-black.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76.6-61DAFB.svg)](https://reactnative.dev)
[![Platform](https://img.shields.io/badge/platform-Android-3DDC84.svg)](https://www.android.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

*100 natural sounds, intelligent AI mixing, and smart alarms — all designed for perfect sleep.*

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Building](#-building) • [Contributing](#-contributing)

---

</div>

## 🎯 What is Deep Sleep?

Deep Sleep is a **mobile application designed for better sleep** through **scientifically-inspired ambient soundscapes**. Mix up to 10 simultaneous natural sounds, set smart alarms, and let AI recommend the perfect composition for your sleep needs.

Perfect for:
- 😴 **Light sleepers** masking environmental noise
- 🧘 **Meditators** creating immersive focus environments
- 👶 **Parents** soothing children with white noise
- 🎧 **Remote workers** drowning out office distractions
- 🌙 **Anyone** building a consistent sleep routine

## ✨ Features

### 🎵 Sound Mixer
- **100 Natural Sounds**: Rain, ocean, forest, fire, urban, and more across 10 categories
- **Simultaneous Playback**: Mix up to 10 sounds at once with individual volume control
- **Perlin Noise Animation**: Organic, breathing volume oscillation simulates real nature
- **Intermittent Sounds**: Rare sounds play at realistic intervals (occasional thunder, bird calls)
- **Tag Filtering**: Browse sounds by category with a horizontal tab bar
- **Weighted Shuffle**: Priority playback based on custom frequency settings

### 🎛️ Preset System
- **10 Built-in Presets**: Curated sound combinations ready to use
- **Custom Presets**: Save your own mixes with names and descriptions
- **One-tap Application**: Instantly switch between saved soundscapes
- **Premium Unlimited Saves**: Free users get 5 preset slots

### ⏰ Smart Alarm
- **Fade-in Start**: Gradual volume increase for gentle wake-up
- **Math Problem Dismiss**: Solve arithmetic to disable — no more sleeping through it
- **Three Difficulty Levels**: Easy (addition), Medium (multiplication), Hard (mixed multi-step)
- **Weekly Scheduling**: Set different alarms for each day of the week
- **Snooze Control**: Configurable snooze duration (3, 5, or 10 minutes)

### 🤖 AI Sound Recommendation *(Premium)*
- **Gemini 2.0 Flash**: Describe your mood and get a personalized sound mix
- **Smart Validation**: 6-point AI output checking ensures playable results
- **20 Daily Calls**: Generous free-tier usage for premium subscribers
- **Save & Apply**: Convert AI recommendations directly into custom presets

### 🌙 Sleep Mode
- **Pure Black Screen**: OLED-friendly zero-light display
- **Tap to Reveal**: Clock and controls appear briefly on tap, fade back to black
- **Long-Press Stop**: Prevents accidental playback interruption
- **Timer Integration**: Auto-fade and stop at your scheduled time

### ⚙️ User Experience
- **Multi-language**: Korean and English interfaces
- **Dark Theme**: Deep navy glass-morphism design optimized for night use
- **Sleep Timer**: 15 / 30 / 45 / 60 / 120 minute presets
- **Master Volume**: Global volume control independent of individual sound levels
- **Subscription Management**: RevenueCat-powered monthly, yearly, and lifetime plans

## 📦 Installation

### Option 1: Download APK (Recommended)
1. Download `DeepSleep.apk` from [Releases](https://github.com/jiwonjae-svg/deep-sleep/releases)
2. Enable "Install from unknown sources" in Android settings
3. Install and start sleeping better

### Option 2: Run from Source

**Requirements:**
- Node.js 18 or higher
- Expo CLI (`npm install -g expo-cli`)
- Android device or emulator

**Quick Start:**
```powershell
# Clone the repository
git clone https://github.com/jiwonjae-svg/deep-sleep.git
cd deep-sleep

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your API keys in .env

# Start Expo
npx expo start
```

## 🚀 Usage

### Mixing Sounds

1. **Open Mixer Tab**: Tap the music note icon
2. **Browse Categories**: Swipe through Rain, Ocean, Forest, Fire, and more
3. **Add Sounds**: Tap any sound card to activate (up to 10 at once)
4. **Fine-tune**: Long-press an active sound to adjust volume range, frequency, and pan
5. **Play**: Tap the play button in the bottom bar or Home tab

### Creating a Preset

1. **Build your mix** in the Mixer tab
2. **Open Presets Tab**: Tap the albums icon
3. **Tap + button**: Appears when you have active sounds
4. **Name and save**: Add a name and optional description

### Setting an Alarm

1. **Open Alarms Tab**: Tap the alarm icon
2. **Tap + button** in the top right
3. **Set time**: Use the up/down arrows to set hour/minute
4. **Choose days**: Toggle which days of the week to repeat
5. **Configure options**:
   - Fade-in duration (1, 3, or 5 minutes)
   - Snooze duration (3, 5, or 10 minutes)
   - Math dismiss (Easy / Medium / Hard)
6. **Save**

### Getting AI Recommendations *(Premium)*

1. **Tap ✨ button** on the Home screen
2. **Describe your vibe**: e.g. *"rainy café atmosphere, slightly melancholic but cozy"*
3. **Tap Recommend**: Wait for Gemini to craft your mix
4. **Preview and apply**: Listen to the AI suggestion, then apply or save as preset

### Keyboard / Gesture Reference (Sleep Mode)

| Gesture | Action |
|---------|--------|
| Tap anywhere | Show clock and controls for 3 seconds |
| Long-press stop button | Stop playback and exit sleep mode |
| Swipe (Alarm dismiss) | Dismiss alarm without math problem |

## 📁 Project Structure

```
deep-sleep/
│
├── 📄 app.config.ts                     # Expo configuration
├── 📄 package.json                      # Dependencies
├── 📄 tsconfig.json                     # TypeScript config
├── 📄 babel.config.js                   # Babel transpiler config
├── 📄 metro.config.js                   # Metro bundler config
├── 📄 eas.json                          # EAS Build profiles
├── 📄 .env.example                      # Environment variable template
│
├── 📁 app/                              # Expo Router screens
│   ├── _layout.tsx                      # Root layout + bootstrap
│   ├── onboarding.tsx                   # Onboarding flow (4 slides)
│   ├── playing.tsx                      # Sleep mode (pure black)
│   ├── alarm-dismiss.tsx                # Alarm dismiss (swipe/math)
│   ├── subscription.tsx                 # Premium subscription modal
│   ├── 📁 (tabs)/                       # Main tab navigator
│   │   ├── _layout.tsx                  # Tab bar configuration
│   │   ├── index.tsx                    # Home screen
│   │   ├── mixer.tsx                    # Sound mixer
│   │   ├── presets.tsx                  # Preset manager
│   │   ├── alarms.tsx                   # Alarm list
│   │   └── settings.tsx                 # Settings
│   ├── 📁 alarms/
│   │   └── edit.tsx                     # Add/edit alarm
│   └── 📁 presets/
│       └── save.tsx                     # Save current mix as preset
│
├── 📁 components/                       # 27 reusable components
│   ├── 📁 ui/                           # Base UI (Button, Card, Slider…)
│   ├── 📁 sound/                        # Sound cards, grid, category tabs
│   ├── 📁 alarm/                        # Alarm card, time picker, math
│   ├── 📁 preset/                       # Preset card and list
│   ├── 📁 subscription/                 # Plan card, benefit list
│   ├── 📁 ai/                           # AI input, result, recommend button
│   ├── 📁 common/                       # Mascot, ad banner, loading
│   └── 📁 onboarding/                   # Onboarding slide
│
├── 📁 stores/                           # Zustand state management (7 stores)
│   ├── useAudioStore.ts                 # Active sounds, playback state
│   ├── usePresetStore.ts                # Default + custom presets
│   ├── useAlarmStore.ts                 # Alarm list
│   ├── useSettingsStore.ts              # App preferences
│   ├── useSubscriptionStore.ts          # Premium status
│   ├── useTimerStore.ts                 # Sleep timer
│   └── useAIStore.ts                    # AI usage tracking
│
├── 📁 services/                         # Business logic services
│   ├── AudioService.ts                  # expo-av playback + Perlin noise
│   ├── AlarmService.ts                  # expo-notifications scheduling
│   ├── AdService.ts                     # AdMob frequency cap logic
│   ├── BillingService.ts                # RevenueCat subscription
│   └── AIService.ts                     # Gemini 2.0 Flash API
│
├── 📁 hooks/                            # Custom React hooks (5 hooks)
│   ├── useAudio.ts                      # Audio playback integration
│   ├── useAlarm.ts                      # Alarm CRUD + scheduling
│   ├── useSubscription.ts               # Purchase + restore flow
│   ├── usePermissions.ts                # Notification permission
│   └── useAI.ts                         # AI recommendation with rate limit
│
├── 📁 data/                             # Static data
│   ├── sounds.ts                        # 100 sound definitions
│   ├── categories.ts                    # 10 category definitions
│   └── defaultPresets.ts                # 10 built-in presets
│
├── 📁 types/                            # TypeScript type definitions
│   └── index.ts                         # All shared types and enums
│
├── 📁 theme/                            # Design system
│   ├── colors.ts                        # Color palette (glassmorphism)
│   ├── typography.ts                    # Text styles (10 variants)
│   ├── spacing.ts                       # Spacing scale and layout constants
│   └── index.ts                         # Re-exports
│
├── 📁 utils/                            # Utilities
│   ├── perlinNoise.ts                   # 1D Perlin noise for volume animation
│   ├── mathProblem.ts                   # Alarm math problem generator
│   ├── formatTime.ts                    # Time / duration formatting
│   └── constants.ts                     # Global app constants
│
├── 📁 i18n/                             # Internationalization
│   └── index.ts                         # i18next configuration
│
└── 📁 locales/                          # Translation files
    ├── ko.json                          # Korean (primary)
    └── en.json                          # English
```

## 🏗️ Architecture

Deep Sleep follows a **clean layered architecture** with strict separation of concerns:

```
┌──────────────────────────────────────────┐
│         Screen Layer (Expo Router)       │  ← User navigation & display
├──────────────────────────────────────────┤
│      Component Layer (27 Components)     │  ← Reusable UI building blocks
├──────────────────────────────────────────┤
│         Hook Layer (5 Custom Hooks)      │  ← Store + Service integration
├──────────────────────────────────────────┤
│    State Layer (7 Zustand Stores)        │  ← Reactive app-wide state
├──────────────────────────────────────────┤
│      Service Layer (5 Services)          │  ← Audio, Alarms, AI, Ads, Billing
├──────────────────────────────────────────┤
│        Data Layer (Static + AsyncStorage)│  ← Sounds, presets, user data
└──────────────────────────────────────────┘
```

### Key Components

#### 🔊 AudioService
- **Simultaneous Playback**: Up to 10 expo-av `Sound` instances managed in a pool
- **Perlin Noise Volume**: Organic breathing volume oscillation at 10fps per sound
- **Intermittent Scheduling**: Frequency-aware playback (frequent: 5–15s, occasional: 20–60s, rare: 60–180s)
- **Fade-out Timer**: Smooth volume reduction before sleep timer expiry

#### 🔮 AIService
- **Model**: Gemini 2.0 Flash via REST API
- **System Prompt**: All 100 sound IDs embedded for accurate suggestions
- **Validation Pipeline**: 6-point checking (JSON parse → count → valid IDs → volume order → clamping → frequency)
- **Timeout**: 10-second AbortController cutoff prevents hanging

#### 📊 Stores (Zustand)
- **Persistence**: AsyncStorage-backed audio, preset, alarm, and settings data
- **Selectors**: Fine-grained subscriptions to prevent unnecessary re-renders
- **getState()**: Service-layer access without React dependency

#### 🎨 Design System (Glassmorphism)
- **Base Colors**: Deep navy `#0A0E2A` background with layered glass panels
- **Accent**: Purple `#6C63FF` (primary) + Teal `#4ECDC4` (secondary)
- **Typography**: 10 text styles from `display` (40px/700) to `caption` (11px/400)
- **Animations**: react-native-reanimated 3 for 60fps spring and gesture animations

## 🔧 Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Expo SDK 52 + React Native 0.76.6 | Cross-platform mobile |
| **Language** | TypeScript 5.x (strict mode) | Type-safe development |
| **Navigation** | expo-router 4.x (file-based) | Screen routing |
| **State** | Zustand 5.x | Global reactive state |
| **Audio** | expo-av 15.x | Multi-track sound playback |
| **Animations** | react-native-reanimated 3.16 | 60fps gesture animations |
| **Gestures** | react-native-gesture-handler 2.20 | Swipe and drag interactions |
| **AI** | Google Gemini 2.0 Flash (REST) | Sound recommendations |
| **Ads** | react-native-google-mobile-ads 14.x | AdMob banner + interstitial |
| **Billing** | react-native-purchases 8.x | RevenueCat subscriptions |
| **i18n** | i18next 24.x + react-i18next 15.x | Korean/English localization |
| **Storage** | AsyncStorage 1.23.1 | Local data persistence |
| **Build** | EAS Build | Cloud Android build |

## 🛡️ Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```env
# Google Gemini API key (for AI recommendations)
GEMINI_API_KEY=your_gemini_api_key

# RevenueCat API key (for subscription management)
REVENUECAT_API_KEY=your_revenuecat_api_key

# AdMob App ID - the ~ format from AdMob dashboard
ADMOB_APP_ID=ca-app-pub-xxxxxxxx~xxxxxxxx

# AdMob Interstitial Ad Unit ID - the / format from AdMob dashboard
ADMOB_INTERSTITIAL_ID=ca-app-pub-xxxxxxxx/xxxxxxxx

# EAS Project ID
EAS_PROJECT_ID=your_eas_project_id
```

> **Note on AdMob IDs**: There are two distinct IDs in the AdMob console:
> - The **App ID** (`ca-app-pub-xxx~xxx` with `~`) goes into `ADMOB_APP_ID` and `app.config.ts`
> - The **Ad Unit ID** (`ca-app-pub-xxx/xxx` with `/`) goes into `ADMOB_INTERSTITIAL_ID` and is used in ad display code

## 🚀 Building

### Development Build
```powershell
# Local Android development build
npm run build:dev
```

### Preview Build (APK)
```powershell
# Local preview APK
npm run build:preview
```

### Production Build (AAB)
```powershell
# Local production AAB for Play Store
npm run build:prod
```

### EAS Cloud Build
```powershell
# Submit to EAS for cloud build
eas build --platform android --profile production
```

### Build Profiles (eas.json)

| Profile | Format | Use Case |
|---------|--------|----------|
| `development` | APK | Local testing with dev client |
| `preview` | APK | Internal distribution / testing |
| `production` | AAB | Google Play Store submission |

## ⚡ Performance

- **Startup Time**: <2 seconds to main screen
- **Audio Latency**: <200ms per sound load
- **Memory Footprint**: ~120MB RAM (10 simultaneous sound streams)
- **Battery Impact**: Background audio with `FOREGROUND_SERVICE_MEDIA_PLAYBACK`
- **OLED Optimization**: Pure `#000000` sleep mode, dimming system brightness

Optimizations:
- Lazy-loaded expo-av Sound pool (load on first use)
- Perlin noise computed at 10fps (not per-frame) to minimize CPU
- Zustand fine-grained selectors prevent unnecessary re-renders
- AdMob frequency cap (60s minimum interval, 20/day max) reduces load

## ⚙️ Configuration

### Sound Files

Place OGG audio files in `assets/sounds/`:
```
assets/sounds/
├── rain-light.ogg
├── rain-heavy.ogg
├── ocean-waves.ogg
...
```

File names correspond to each sound's `fileName` property in `data/sounds.ts`.

### Adding a New Sound

1. Add OGG file to `assets/sounds/`
2. Add entry to `data/sounds.ts`:
```typescript
{
  id: 'my-new-sound',
  name: '새 소리',
  category: 'forest-nature',
  type: SoundType.Continuous,
  isPremium: false,
  iconEmoji: '🌿',
  fileName: 'my-new-sound.ogg',
}
```
3. That's it — the sound appears in the Mixer automatically

### Adding a Translation Key

Edit `locales/ko.json` and `locales/en.json`:
```json
{
  "mySection": {
    "myKey": "내 텍스트"
  }
}
```

## 🐛 Troubleshooting

### App Won't Start
1. **Node version**: Requires Node.js 18+
2. **Dependencies**: Run `npm install`
3. **Expo CLI**: Run `npx expo install`
4. **Missing .env**: Copy `.env.example` to `.env`

### Audio Not Playing
1. **File missing**: Ensure OGG files exist in `assets/sounds/`
2. **Android permissions**: Check `WAKE_LOCK` and `FOREGROUND_SERVICE` in `app.config.ts`
3. **Background mode**: `AudioMode` must be initialized (done in `_layout.tsx` bootstrap)

### Alarms Not Triggering
1. **Notification permission**: Accept notification prompt on first launch
2. **Exact alarm permission**: `SCHEDULE_EXACT_ALARM` required on Android 12+
3. **Battery optimization**: Disable battery optimization for Deep Sleep in Android settings

### AI Recommendations Failing
1. **API key**: Verify `GEMINI_API_KEY` in `.env`
2. **Network**: Check internet connectivity
3. **Rate limit**: 20 calls per day per user

### Build Failing
1. **Assets missing**: `icon.png`, `splash.png`, `adaptive-icon.png` must exist in `assets/`
2. **EAS login**: Run `eas login` before building
3. **AdMob App ID**: Must be set in `.env` before Android build

## 📜 Subscription Plans

| Plan | Price | Duration |
|------|-------|----------|
| Monthly | ₩3,900 | Per month |
| Yearly | ₩29,900 | Per year (recommended) |
| Lifetime | ₩79,900 | One-time |

**Premium Benefits:**
- Unlock all 100 sounds (free: 60 sounds)
- Remove all ads (banner + interstitial)
- AI-powered sound recommendations
- Unlimited preset saves (free: 5)
- High-quality audio mode

## 📜 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome!

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
4. **Push** to your branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup
```powershell
git clone https://github.com/jiwonjae-svg/deep-sleep.git
cd deep-sleep
npm install
cp .env.example .env
npx expo start
```

### Code Style
- TypeScript strict mode throughout
- Functional components with hooks only
- Zustand for all shared state — no prop drilling
- Keep services pure (no React imports)

## 🎯 Roadmap

### Upcoming Features
- [ ] Audio file bundling (OGG assets included in APK)
- [ ] Google Play Store release
- [ ] Widget (Android home screen timer + play button)
- [ ] iCloud/Google Drive preset backup
- [ ] Sleep quality tracking (motion sensor integration)
- [ ] Spotify-style "sleep mix of the day" from AI

### Under Consideration
- [ ] iOS support (iPad ambient display)
- [ ] WearOS companion (alarm dismiss on watch)
- [ ] Community preset sharing
- [ ] White noise / binaural beats generator

## 🙏 Acknowledgments

Built with these amazing open-source projects:
- [Expo](https://expo.dev) — Managed React Native workflow
- [Zustand](https://zustand-demo.pmnd.rs) — Lightweight state management
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) — Smooth animations
- [RevenueCat](https://www.revenuecat.com) — Subscription infrastructure
- [Google Gemini](https://ai.google.dev) — AI recommendations

---

<div align="center">

**Deep Sleep** — Sleep Smarter, Rest Deeper 🌙

Made with ❤️ for better nights

[⬆ Back to Top](#-deep-sleep)

</div>
