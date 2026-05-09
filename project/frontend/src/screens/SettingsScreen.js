import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';

export const SettingsScreen = ({ navigation }) => {
  const { signOut } = React.useContext(AuthContext);
  const [loading, setLoading] = React.useState(true);
  const [settings, setSettings] = React.useState({
    notifications_enabled: true,
    dark_mode: false,
    language: 'English',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/settings');
      setSettings(data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const update = async (patch) => {
    setSettings((s) => ({ ...s, ...patch }));
    try {
      await apiClient.put('/settings', {
        notificationsEnabled: patch.notifications_enabled,
        darkMode: patch.dark_mode,
        language: patch.language,
      });
    } catch {
      // ignore for now; UI stays optimistic
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Settings</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <Section title="Preferences">
            <Row icon="notifications" label="Notifications" right={<Switch value={!!settings.notifications_enabled} onValueChange={(v) => update({ notifications_enabled: v })} />} />
            <Row icon="dark-mode" label="Dark Mode" right={<Switch value={!!settings.dark_mode} onValueChange={(v) => update({ dark_mode: v })} />} />
            <Row icon="language" label="Language" right={<Text style={styles.rightText}>{settings.language || 'English'}</Text>} />
          </Section>

          <Section title="Security">
            <Row icon="lock" label="Change Password" right={<MaterialIcons name="chevron-right" size={22} color="#98A2B3" />} />
            <Row icon="policy" label="Privacy Policy" right={<MaterialIcons name="chevron-right" size={22} color="#98A2B3" />} />
          </Section>

          <Section title="Support">
            <Row icon="help" label="Help & Support" right={<MaterialIcons name="chevron-right" size={22} color="#98A2B3" />} />
            <Row icon="info" label="About" right={<MaterialIcons name="chevron-right" size={22} color="#98A2B3" />} />
          </Section>

          <TouchableOpacity style={styles.logout} onPress={signOut}>
            <MaterialIcons name="logout" size={18} color="#F04438" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Version 1.0.0{'\n'}Dairy Farm Management System</Text>
        </>
      )}
    </View>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const Row = ({ icon, label, right }) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <MaterialIcons name={icon} size={18} color="#667085" />
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    {right}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { backgroundColor: '#6B6D7A', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 16 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 16, paddingTop: 14 },
  sectionTitle: { fontWeight: '900', color: '#101828', marginBottom: 8 },
  sectionCard: { borderWidth: 1, borderColor: '#EAECF0', borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { fontWeight: '700', color: '#344054' },
  rightText: { color: '#667085', fontWeight: '700' },
  logout: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#FEE4E2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: { color: '#F04438', fontWeight: '900' },
  version: { textAlign: 'center', color: '#667085', marginBottom: 10 },
});

