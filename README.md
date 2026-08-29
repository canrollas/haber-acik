<div align="center">
  <img src="./assets/icon.png" alt="HaberAçık logo" width="120" />

  <h1>HaberAçık</h1>

  <p><strong>An open-source mobile news app that brings together different Turkish news sources in a single feed.</strong></p>

  <p>
    <img alt="Expo SDK" src="https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo&logoColor=white" />
    <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=black" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" />
    <img alt="Platforms" src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey" />
    <img alt="License" src="https://img.shields.io/badge/license-MIT-green" />
  </p>
</div>

---

Built with Expo (React Native); runs on iOS and Android. News is collected from ~50 sources by a separate service, [news-crawler](https://github.com/canrollas/news-crawler) (You need authorized access to run this service contact me), and written to a Supabase (Postgres) database — this app just reads and displays that data through an API.

## Table of contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Development](#development)
- [Android release build & signing](#android-release-build--signing)
- [iOS release build & signing](#ios-release-build--signing)
- [Notifications](#notifications)
- [Related repo](#related-repo)

## Features

- 🔵 **Personal** — Home feed based on the sources and categories you follow.
- 🔵 **Discover** — Browse news by category.
- 🔵 **Sources** — Source list with per-source news feeds.
- 🔵 **Breaking** — Push notifications via Firebase Cloud Messaging; stories covered by 2+ sources at the same time (i.e. genuinely trending) are sent through the `breaking_alerts` topic.
- 🔵 **Custom** — Visual preferences are stored on-device.
- 🔵 **Privacy** — No personal data is collected or stored on the device — preferences are kept locally only.

## Screenshots

<div align="center">
  <img src="./store-assets/screenshots/phone/01-home.png" alt="Home feed" width="200" />
  <img src="./store-assets/screenshots/phone/02-discover.png" alt="Discover" width="200" />
  <img src="./store-assets/screenshots/phone/03-newspaper-detail.png" alt="Newspaper detail" width="200" />
  <img src="./store-assets/screenshots/phone/04-categories.png" alt="Categories" width="200" />
</div>

## Tech stack

- [Expo](https://expo.dev) SDK 57 / React Native 0.86 / React 19 / TypeScript
- [`@react-native-firebase/messaging`](https://rnfirebase.io) — push notifications (modular API)
- `expo-notifications` — foreground local notification display, Android notification channel/icon
- `expo-splash-screen`, `expo-build-properties` — native build configuration
- Data source: Supabase Edge Function API (see `src/services/api.ts`)

## Project structure

```
src/
  screens/       Main screens (Feed, Discover, Newspapers, Settings, onboarding...)
  components/    Shared UI components (ArticleCard, BottomNavBar, modals...)
  context/       PreferencesContext (category/source/notification preferences + FCM topic sync)
  services/      api.ts (backend requests, timeout+retry), personalizedArticles.ts
  hooks/         usePushNotifications (permissions, foreground display, notification tap routing)
  data/          Static category definitions and backend category mapping
  theme/         Color/typography/spacing theme system
plugins/         Local Expo config plugins applied during native prebuild
  withReleaseSigning.js   Android release signing (see below)
app.config.js    Wraps app.json to inject the Apple Team ID from the
                 gitignored apns.credentials.properties (see below)
```

## Development

```bash
npm install
cp .env.example .env   # fill in your own Supabase project URL + publishable key
npx expo start
```

The app reads its backend config from environment variables (see `src/services/api.ts`) — `.env` is gitignored, so copy `.env.example` and fill in your own values:

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Your Supabase Edge Function base URL. |
| `EXPO_PUBLIC_API_KEY` | Your Supabase **publishable** key (`sb_publishable_...`) — this is the client-safe equivalent of the old anon key, meant to be used from the app and gated by Row Level Security. Never put a `sb_secret_...` service-role key here. |

You'll also need your own Firebase config files at the project root for the Firebase Messaging native module to build — `google-services.json` for Android and `GoogleService-Info.plist` for iOS, both downloaded from the Firebase console. Both are gitignored. The `@react-native-firebase/app` config plugin fails the prebuild outright if the file for the platform you're building is missing.

Because it uses native modules (Firebase, notifications, etc.), it doesn't fully work in Expo Go — a development build is required:

```bash
npx expo run:ios
npx expo run:android
```

> [!NOTE]
> The `android/` and `ios/` folders are in `.gitignore` — they're generated automatically from the `app.json`/`plugins/` configuration via `expo prebuild`. If you need to change something on the native side, **don't edit the native files by hand** — add a config plugin to `app.json` instead, otherwise your changes will be lost on the next `expo prebuild --clean`.

## Android release build & signing

To produce a signed `.aab` ready for the Play Store:

```bash
npx expo prebuild --platform android --clean
cd android && ./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

Signing relies on `release.jks` + `release.keystore.properties` files at the project root (never committed, gitignored). `plugins/withReleaseSigning.js` automatically picks these up on every `expo prebuild` and wires them into `android/app/build.gradle` — if the files are missing, the release build silently falls back to the debug keystore (fine for local development, but it can't be uploaded to the Play Store).

### CI/CD

`.github/workflows/android-release.yml`: run manually from the Actions tab (**workflow_dispatch**), it prebuilds the native project, reconstructs `release.jks` and `google-services.json` from GitHub Secrets and injects the `EXPO_PUBLIC_*` env vars, builds the signed `.aab`, and uploads it to the Actions run's **Artifacts** section. There's no automatic submission to the Play Store — the `.aab` is downloaded and uploaded to Play Console manually.

The workflow sets `android.versionCode` from `github.run_number`, so every run is guaranteed a higher code than the last without editing `app.json`. Re-running a failed run reuses its number — dispatch a fresh run instead.

> [!IMPORTANT]
> `.env`, `google-services.json`, and `release.jks`/`release.keystore.properties` are gitignored and never committed — you need your own copies locally to build. CI reconstructs all of them from the repo's GitHub Secrets (**Settings → Secrets and variables → Actions**):
>
> | Secret | Value |
> |---|---|
> | `ANDROID_KEYSTORE_BASE64` | `base64 -i release.jks \| pbcopy` — your release keystore, base64-encoded |
> | `ANDROID_KEYSTORE_ALIAS` | Key alias from `release.keystore.properties` |
> | `ANDROID_KEYSTORE_PASSWORD` | Store password from `release.keystore.properties` |
> | `ANDROID_KEY_PASSWORD` | Key password from `release.keystore.properties` |
> | `GOOGLE_SERVICES_JSON_BASE64` | `base64 -i google-services.json \| pbcopy` — your Firebase config, base64-encoded |
> | `EXPO_PUBLIC_API_BASE_URL` | Same value as in your local `.env` |
> | `EXPO_PUBLIC_API_KEY` | Same value as in your local `.env` |

## iOS release build & signing

Locally, archive from Xcode:

```bash
npx expo prebuild --platform ios --clean
open ios/HaberAk.xcworkspace
# Any iOS Device (arm64) → Product → Archive → Distribute App → App Store Connect
```

Signing is automatic. `app.config.js` reads `APPLE_TEAM_ID` out of `apns.credentials.properties` at the project root (gitignored, alongside `release.jks`) and hands it to Expo's built-in `withDevelopmentTeam` mod, which writes `DEVELOPMENT_TEAM` into the Xcode project on every prebuild. Without that file the archive has no team and automatic signing can't resolve — pick the team manually in Xcode, or create the file:

```
APPLE_TEAM_ID=XXXXXXXXXX
```

### CI/CD

`.github/workflows/ios-release.yml`: run manually from the Actions tab, it builds on a `macos-26` runner and uploads a signed `.ipa` to the run's **Artifacts** section. Download it and submit with [Transporter](https://apps.apple.com/app/transporter/id1450874784) or `xcrun altool --upload-app`.

Signing uses an **App Store Connect API key** rather than stored certificates: `xcodebuild -allowProvisioningUpdates` with `-authenticationKey*` lets Xcode create and fetch the distribution certificate and provisioning profile itself, so no `.p12` or `.mobileprovision` ever becomes a secret.

> [!IMPORTANT]
> The App Store Connect API key (**Users and Access → Integrations → App Store Connect API**) is *not* the APNs `.p8` used for push. They're separate keys with separate IDs.

> [!NOTE]
> The workflow pins Xcode 26.6. `expo-modules-core`'s `ExpoModulesJSI` build phase resolves a SwiftPM package requiring Swift tools 6.2, so older Xcode versions fail the archive with `package 'apple' is using Swift tools version 6.2.0 but the installed version is 6.1.0`.

Additional secrets on top of the Android ones:

| Secret | Value |
|---|---|
| `APPLE_TEAM_ID` | Your 10-character Apple Developer Team ID |
| `ASC_KEY_ID` | Key ID of the App Store Connect API key |
| `ASC_ISSUER_ID` | Issuer ID shown above the key list |
| `ASC_KEY_P8_BASE64` | `base64 -i AuthKey_XXXXXXXXXX.p8 \| pbcopy` |
| `GOOGLE_SERVICE_INFO_PLIST_BASE64` | `base64 -i GoogleService-Info.plist \| pbcopy` |

### Versioning

`expo.version` in `app.json` is the single user-facing version — it becomes `CFBundleShortVersionString` on iOS and `versionName` on Android, so bumping it once covers both stores. The per-store build counters underneath it (`ios.buildNumber`, `android.versionCode`) are set from `github.run_number` by each workflow and are independent of each other; they don't need to match, and you shouldn't need to touch them.

## Notifications

- Following categories/sources → determines in-app feed content, doesn't currently trigger a separate push from the backend.
- `breaking_alerts` → a single global FCM topic all users are subscribed to; `trending_topics.py` in `news-crawler` finds stories covered by 4+ sources at the same time and pushes up to 3 of them to this topic per run.

On iOS, FCM delivers through APNs, so an APNs auth key (`.p8`, from **developer.apple.com → Keys**) must be uploaded to **Firebase Console → Cloud Messaging → Apple app configuration** along with its Key ID and your Team ID. A registration token can be obtained without it, but nothing will actually be delivered. Because it's an auth key rather than a certificate, the same upload covers both the sandbox and production APNs environments — a development build and a TestFlight build need no separate setup.

Foreground display differs per platform: Android needs the incoming message re-posted as a local notification, whereas on iOS `expo-notifications` is the `UNUserNotificationCenter` delegate and already presents it. `usePushNotifications` therefore only re-posts on Android; doing it on both showed every foreground notification twice.

## Related repo

News collection, enrichment (category/tag/summary via LLM), and notification triggering logic: [news-crawler](https://github.com/canrollas/news-crawler) (You need authorized access to run this service contact me). 

---

<div align="center">
  <sub>Released under the MIT license.</sub>
</div>
