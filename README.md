# MediClear 🏥

**Medical Information Clarity Platform** — A React Native app that transforms complex medical documents into patient-friendly, multilingual explanations.

> *Built for the Healthcare Hackathon — Turning medical jargon into health stories.*

## ✨ Key Features

- 🔒 **Scan & Sanitize** — AI detects and masks personal information (PII) before analysis
- 🚦 **Traffic Light Gauges** — Color-coded visual dials for each test result (green/yellow/red)
- 🌐 **Multilingual** — Full support for English, Assamese (অসমীয়া), and Hindi (हिन्दी)
- 🔊 **Voice Playback** — Text-to-speech for accessibility and low-literacy users
- 📋 **Doctor's Note Prep** — AI-generated "Questions for Your Doctor" list
- 🚨 **Critical Value Safety** — Emergency call button for dangerous medical values
- 💬 **Follow-Up Chat** — Ask questions about your report in plain language
- ⚕️ **Medical Disclaimers** — Persistent, clear disclaimers throughout the app

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 (React Native) |
| Navigation | Expo Router |
| AI Engine | Google Gemini 2.0 Flash |
| Translation | Bhashini API (Indian Govt) + Gemini |
| TTS | Expo Speech + Bhashini |
| Gauges | react-native-svg |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the dev server
npx expo start

# Run on web
npx expo start --web

# Run on mobile (scan QR with Expo Go)
npx expo start
```

## 🔑 API Keys (Optional)

For real document analysis, create a `.env.local` file:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_BHASHINI_API_KEY=your_bhashini_key_here
EXPO_PUBLIC_BHASHINI_USER_ID=your_bhashini_user_id_here
```

> **Note**: The app works fully without API keys using pre-loaded sample reports for demo.

## 📱 Demo Flow

1. Open app → see landing page with features
2. Tap **"Try a Sample Report"** → instant results (no API needed)
3. View traffic-light gauges animating in
4. Toggle language → see Assamese/Hindi labels
5. Tap 🔊 → hear voice playback
6. Tap **"Questions for Your Doctor"** section
7. Tap **"Ask About This Report"** → follow-up chat

## 📂 Project Structure

```
├── app/                    # Expo Router screens
│   ├── _layout.js          # Root navigation
│   ├── index.js            # Landing page
│   ├── upload.js           # Document upload
│   ├── analyzing.js        # Loading animation
│   ├── results.js          # Results dashboard
│   └── chat.js             # Follow-up chat
├── src/
│   ├── components/         # Reusable UI components
│   ├── services/           # Gemini, Bhashini, Speech APIs
│   ├── context/            # App state management
│   ├── constants/          # Colors, languages, prompts
│   └── data/               # Sample report datasets
```

## ⚖️ Medical Disclaimer

This application is **not a medical diagnostic tool**. It is designed to help patients understand their medical reports in simpler language. Users should always consult their healthcare provider for clinical decisions.

## 🏆 Hackathon Differentiators

1. **Privacy-by-Design** — PII sanitization shows healthcare compliance awareness
2. **Regional Language Bridge** — True Assamese support via Bhashini (Indian Govt API)
3. **Audio-First Accessibility** — Built for low-literacy users
4. **Non-Diagnostic Safety** — Critical value → "Call Doctor" shortcut, never explanations
5. **"Doctor's Note Prep"** — Unique feature that bridges patient-doctor communication gap