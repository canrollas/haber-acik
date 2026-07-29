# HaberAçık

Türkiye'deki farklı haber kaynaklarını tek bir akışta buluşturan, açık kaynaklı bir mobil haber uygulaması. Expo (React Native) ile yazılmıştır; iOS ve Android'de çalışır.

Haberler ayrı bir servis olan [news-crawler](https://github.com/canrollas/news-crawler) tarafından ~50 kaynaktan toplanıp Supabase (Postgres) veritabanına yazılır; bu uygulama sadece o veriyi bir API üzerinden okur ve gösterir.

## Özellikler

- **Kişiselleştirilmiş akış** — takip ettiğin kaynak ve kategorilere göre ana sayfa akışı.
- **Keşfet** — kategori bazlı haber tarama.
- **Gazeteler** — kaynak listesi ve kaynağa özel haber akışı.
- **Son dakika bildirimleri** — Firebase Cloud Messaging ile push bildirimleri; 2+ kaynakta aynı anda geçen (gerçekten gündem olan) haberler `breaking_alerts` topic'i üzerinden gönderilir.
- **Karanlık mod, metin boyutu ayarı, gizlilik odaklı** (cihazda hiçbir kişisel veri toplanmaz/saklanmaz, tercihler sadece cihazda tutulur).

## Teknoloji

- [Expo](https://expo.dev) SDK 57 / React Native 0.86 / React 19 / TypeScript
- [`@react-native-firebase/messaging`](https://rnfirebase.io) — push bildirimleri (modular API)
- `expo-notifications` — foreground'da yerel bildirim gösterimi, Android bildirim kanalı/ikonu
- `expo-splash-screen`, `expo-build-properties` — native build konfigürasyonu
- Veri kaynağı: Supabase Edge Function API (bkz. `src/services/api.ts`)

## Proje yapısı

```
src/
  screens/       Ana ekranlar (Akış, Keşfet, Gazeteler, Ayarlar, onboarding...)
  components/    Paylaşılan UI bileşenleri (ArticleCard, BottomNavBar, modallar...)
  context/       PreferencesContext (kategori/kaynak/bildirim tercihleri + FCM topic senkronizasyonu)
  services/      api.ts (backend istekleri, timeout+retry), personalizedArticles.ts
  hooks/         usePushNotifications (izin, foreground gösterim, bildirim tıklama yönlendirmesi)
  data/          Sabit kategori tanımları ve backend kategori eşlemesi
  theme/         Renk/tipografi/spacing tema sistemi
plugins/         Native prebuild sırasında uygulanan local Expo config plugin'leri
  withReleaseSigning.js   Android release imzalama (bkz. aşağıda)
```

## Geliştirme

```bash
npm install
npx expo start
```

Native modüller (Firebase, notifications vb.) kullandığı için Expo Go'da tam çalışmaz — bir development build gerekir:

```bash
npx expo run:ios
npx expo run:android
```

`android/` ve `ios/` klasörleri `.gitignore`'da — `expo prebuild` ile `app.json`/`plugins/` konfigürasyonundan otomatik üretilirler. Native tarafta bir şey değiştirmek gerekirse **native dosyaları elle düzenlemeyin**, `app.json`'a config plugin ekleyin; aksi halde bir sonraki `expo prebuild --clean`'de kaybolur.

## Android release build ve imzalama

Play Store'a yüklenebilir imzalı bir `.aab` üretmek için:

```bash
npx expo prebuild --platform android --clean
cd android && ./gradlew bundleRelease
```

Çıktı: `android/app/build/outputs/bundle/release/app-release.aab`

İmzalama, proje kökünde (repoya **hiç girmeyen**, gitignore'lu) `release.jks` + `release.keystore.properties` dosyalarına dayanır. `plugins/withReleaseSigning.js` bunları her `expo prebuild`'de otomatik bulup `android/app/build.gradle`'a işler — dosyalar yoksa release build sessizce debug keystore'a düşer (yerel geliştirme için sorun değil, Play Store'a yüklenemez).

### CI/CD

`.github/workflows/android-release.yml`: `main`'e her push'ta (veya elle tetiklenince) native projeyi prebuild eder, `release.jks`'i GitHub Secrets'tan (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_ALIAS`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_PASSWORD`) yeniden oluşturur, imzalı `.aab`'yi build eder ve Actions run'ının **Artifacts** bölümüne yükler. Play Store'a otomatik gönderim yok — `.aab` indirilip Play Console'a elle yüklenir.

## Bildirimler

- Kategori/kaynak takibi → uygulama içi akış içeriğini belirler, şu an backend'den ayrı bir push tetiklemez.
- `breaking_alerts` → tüm kullanıcıların abone olduğu tek global FCM topic'i; `news-crawler`'daki `trending_topics.py`, 4+ kaynakta aynı anda geçen haberleri bulup çalıştırma başına en fazla 3 tanesini bu topic'e push'lar.

## İlgili depo

Haber toplama, zenginleştirme (LLM ile kategori/etiket/özet) ve bildirim tetikleme mantığı: [news-crawler](https://github.com/canrollas/news-crawler)
