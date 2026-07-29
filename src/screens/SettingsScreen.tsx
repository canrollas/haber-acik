import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import TopAppBar from '../components/TopAppBar';
import TextScaleModal from '../components/TextScaleModal';
import ManageSourcesModal from '../components/ManageSourcesModal';
import ManageCategoriesModal from '../components/ManageCategoriesModal';
import InfoModal from '../components/InfoModal';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface SettingsRowProps {
  icon: IoniconName;
  title: string;
  subtitle: string;
  trailing:
    | { type: 'chevron' }
    | { type: 'external' }
    | { type: 'switch'; value: boolean; onValueChange: (value: boolean) => void };
  onPress?: () => void;
  last?: boolean;
}

function SettingsRow({ icon, title, subtitle, trailing, onPress, last }: SettingsRowProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(theme);
  const rowStyle = last ? [styles.row, styles.rowLast] : styles.row;
  const content = (
    <>
      <View style={styles.iconBadge}>
        <Ionicons name={icon} size={17} color={theme.colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {trailing.type === 'chevron' && (
        <Ionicons name="chevron-forward" size={18} color={theme.colors.outline} />
      )}
      {trailing.type === 'external' && (
        <Ionicons name="open-outline" size={18} color={theme.colors.outline} />
      )}
      {trailing.type === 'switch' && (
        <Switch
          value={trailing.value}
          onValueChange={trailing.onValueChange}
          trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
          thumbColor={theme.colors.surfaceContainerLowest}
          ios_backgroundColor={theme.colors.outlineVariant}
        />
      )}
    </>
  );

  if (trailing.type === 'switch') {
    return <View style={rowStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity style={rowStyle} activeOpacity={0.6} onPress={onPress} disabled={!onPress}>
      {content}
    </TouchableOpacity>
  );
}

interface SettingsSectionProps {
  label: string;
  children: React.ReactNode;
}

function SettingsSection({ label, children }: SettingsSectionProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(theme);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const ABOUT_BODY =
  'Merhaba, ben Can Rollas. Bilgisayarlı görü alanında çalışan bir araştırmacı ve makine öğrenmesi mühendisiyim.\n\n' +
  'Yapay zekayla ilgilenenler bilir: Haberler, büyük dil modellerinin (LLM) en büyük veri kaynaklarından biridir. ' +
  'Modellerin dünyayı öğrendiği metinlerin önemli bir kısmı haber içeriklerinden gelir. Ben de bu ilişkiden yola ' +
  'çıkarak, Türkiye\'deki haber kaynaklarını sürekli tarayan ve topladığı haberleri bir veri tabanında düzenleyen ' +
  'bir crawler (haber toplayıcı) sistemi yazdım.\n\n' +
  'Başta bu tamamen kişisel bir projeydi. Sistemi zamanla bir mobil uygulamaya çevirdim ve bir süre sadece kendim ' +
  'kullandım — topladığım haberlerin kalitesini kontrol etmek, kaynakları karşılaştırmak, sistemin ne kadar iyi ' +
  'çalıştığını görmek için. Uygulamayı her gün kullandıkça elimde gerçekten işe yarar bir şey olduğunu fark ettim.\n\n' +
  'Sonra kendime şu soruyu sordum: Madem bu kadar güzel oldu, neden sadece ben kullanıyorum?\n\n' +
  'Haber Açık işte böyle doğdu. Kişisel bir araştırma projesi olarak başlayan bu sistem, bugün herkesin ' +
  'kullanabileceği bir haber uygulamasına dönüştü.\n\n' +
  'İyi okumalar!';

const PRIVACY_POLICY_URL = 'https://canrollas.github.io/haberacik/privacy';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useAppTheme();
  const styles = useStyles(theme);
  const { breakingAlertsEnabled, setBreakingAlertsEnabled } = usePreferences();

  const [textScaleModalOpen, setTextScaleModalOpen] = useState(false);
  const [manageSourcesOpen, setManageSourcesOpen] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Derive switch value from current themeMode
  // If themeMode is 'system', we show it as false in switch (or we could have a 3-way toggle, but simple switch is fine)
  // For this design, let's treat the switch as "Force Dark Mode".
  // If it's forced dark, switch is true. Otherwise false.
  const isDarkMode = themeMode === 'dark';

  const handleThemeChange = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'system');
  };

  return (
    <View style={styles.container}>
      <TopAppBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsSection label="Görünüm">
          <SettingsRow
            icon="moon-outline"
            title="Karanlık Mod"
            subtitle="Düşük ışıklı ortamlar için arayüzü karartır."
            trailing={{ type: 'switch', value: isDarkMode, onValueChange: handleThemeChange }}
          />
          <SettingsRow
            icon="text-outline"
            title="Metin Boyutu"
            subtitle="Makalelerdeki varsayılan yazı tipini ayarlar."
            trailing={{ type: 'chevron' }}
            onPress={() => setTextScaleModalOpen(true)}
            last
          />
        </SettingsSection>

        <SettingsSection label="İçerik Tercihleri">
          <SettingsRow
            icon="reader-outline"
            title="Kaynakları Yönet"
            subtitle="Hangi ajanslardan haber alacağınızı seçin."
            trailing={{ type: 'chevron' }}
            onPress={() => setManageSourcesOpen(true)}
          />
          <SettingsRow
            icon="filter-outline"
            title="İçerik Filtreleri"
            subtitle="Akışınızda öne çıkmasını istediğiniz konuları seçin."
            trailing={{ type: 'chevron' }}
            onPress={() => setManageCategoriesOpen(true)}
            last
          />
        </SettingsSection>

        <SettingsSection label="Bildirimler">
          <SettingsRow
            icon="notifications-outline"
            title="Son Dakika Uyarıları"
            subtitle="Sadece acil ve önemli gelişmeler için."
            trailing={{ type: 'switch', value: breakingAlertsEnabled, onValueChange: setBreakingAlertsEnabled }}
            last
          />
        </SettingsSection>

        <SettingsSection label="Açık Kaynak Projesi">
          <SettingsRow
            icon="information-circle-outline"
            title="Hakkımızda"
            subtitle="Vizyonumuz ve editoryal bağımsızlık ilkelerimiz."
            trailing={{ type: 'chevron' }}
            onPress={() => setAboutOpen(true)}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            title="Gizlilik Sözleşmesi"
            subtitle="Veri toplamıyoruz. Detayları okuyun."
            trailing={{ type: 'external' }}
            onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
            last
          />
        </SettingsSection>
      </ScrollView>

      <TextScaleModal visible={textScaleModalOpen} onClose={() => setTextScaleModalOpen(false)} />
      <ManageSourcesModal visible={manageSourcesOpen} onClose={() => setManageSourcesOpen(false)} />
      <ManageCategoriesModal visible={manageCategoriesOpen} onClose={() => setManageCategoriesOpen(false)} />
      <InfoModal visible={aboutOpen} onClose={() => setAboutOpen(false)} title="Hakkımızda" body={ABOUT_BODY} />
    </View>
  );
}

function useStyles(theme: AppTheme) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackMd,
    paddingBottom: 32,
  },

  section: {
    marginBottom: theme.spacing.stackMd,
  },
  sectionLabel: {
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    letterSpacing: 0.6,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.stackSm,
    marginLeft: 4,
  },
  card: {
    borderRadius: theme.rounded.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surfaceContainerLowest,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: theme.rounded.md,
    backgroundColor: theme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  rowSubtitle: {
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});
}
