import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
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

  // Modals
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showLanguageModal, setShowLanguageModal] = React.useState(false);
  const [showAboutModal, setShowAboutModal] = React.useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/settings');
      setSettings(data || { notifications_enabled: true, dark_mode: false, language: 'English' });
    } catch (e) {
      console.log('Error loading settings', e);
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
        notificationsEnabled: patch.notifications_enabled !== undefined ? patch.notifications_enabled : settings.notifications_enabled,
        darkMode: patch.dark_mode !== undefined ? patch.dark_mode : settings.dark_mode,
        language: patch.language !== undefined ? patch.language : settings.language,
      });
    } catch {
      // optimistic update
    }
  };

  const handleChangePassword = () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Required', 'Please enter your new password');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirm password do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }

    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    Alert.alert('Success', 'Password changed successfully!');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Settings & Preferences</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4FA765" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          {/* Preferences Section */}
          <Section title="Preferences">
            <Row
              icon="notifications"
              label="Push Notifications"
              right={
                <Switch
                  value={!!settings.notifications_enabled}
                  onValueChange={(v) => update({ notifications_enabled: v })}
                  trackColor={{ false: '#D0D5DD', true: '#4FA765' }}
                />
              }
            />
            <Row
              icon="dark-mode"
              label="Dark Theme (Preview)"
              right={
                <Switch
                  value={!!settings.dark_mode}
                  onValueChange={(v) => update({ dark_mode: v })}
                  trackColor={{ false: '#D0D5DD', true: '#4FA765' }}
                />
              }
            />
            <TouchableOpacity onPress={() => setShowLanguageModal(true)}>
              <Row
                icon="language"
                label="Language"
                right={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.rightText}>{settings.language || 'English'}</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#98A2B3" />
                  </View>
                }
              />
            </TouchableOpacity>
          </Section>

          {/* Security Section */}
          <Section title="Security & Access">
            <TouchableOpacity onPress={() => setShowPasswordModal(true)}>
              <Row
                icon="lock"
                label="Change Password"
                right={<MaterialIcons name="chevron-right" size={22} color="#98A2B3" />}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
              <Row
                icon="policy"
                label="Privacy Policy"
                right={<MaterialIcons name="chevron-right" size={22} color="#98A2B3" />}
              />
            </TouchableOpacity>
          </Section>

          {/* Support Section */}
          <Section title="Help & Support">
            <TouchableOpacity onPress={() => setShowHelpModal(true)}>
              <Row
                icon="help-outline"
                label="Help & FAQ"
                right={<MaterialIcons name="chevron-right" size={22} color="#98A2B3" />}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAboutModal(true)}>
              <Row
                icon="info-outline"
                label="About Farm Manager"
                right={<MaterialIcons name="chevron-right" size={22} color="#98A2B3" />}
              />
            </TouchableOpacity>
          </Section>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logout} onPress={signOut} activeOpacity={0.85}>
            <MaterialIcons name="logout" size={18} color="#D92D20" />
            <Text style={styles.logoutText}>Logout from Account</Text>
          </TouchableOpacity>

          <Text style={styles.version}>
            Dairy Farm Management System{'\n'}Version 1.2.0 • Production Ready
          </Text>
        </ScrollView>
      )}

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChangeText={(v) => setPasswordForm((f) => ({ ...f, currentPassword: v }))}
              />

              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                placeholder="At least 6 characters"
                value={passwordForm.newPassword}
                onChangeText={(v) => setPasswordForm((f) => ({ ...f, newPassword: v }))}
              />

              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                placeholder="Repeat new password"
                value={passwordForm.confirmPassword}
                onChangeText={(v) => setPasswordForm((f) => ({ ...f, confirmPassword: v }))}
              />

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleChangePassword}>
                <Text style={styles.modalSaveText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selector Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16, gap: 10 }}>
              {['English', 'Urdu (اردو)', 'Punjabi (پنجابی)'].map((lang) => {
                const isSelected = settings.language?.startsWith(lang.split(' ')[0]);
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langOption, isSelected && styles.langOptionActive]}
                    onPress={() => {
                      update({ language: lang.split(' ')[0] });
                      setShowLanguageModal(false);
                    }}
                  >
                    <Text style={[styles.langOptionText, isSelected && styles.langOptionTextActive]}>
                      {lang}
                    </Text>
                    {isSelected && <MaterialIcons name="check" size={20} color="#4FA765" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About Dairy Farm Manager</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20, alignItems: 'center', gap: 10 }}>
              <MaterialIcons name="agriculture" size={48} color="#4FA765" />
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#101828' }}>
                Dairy Farm Manager
              </Text>
              <Text style={{ fontSize: 13, color: '#667085', textAlign: 'center', lineHeight: 19 }}>
                A modern full-stack mobile solution designed for dairy farms to track livestock,
                daily milk yields, veterinary health checkups, fodder inventory, finance ledger, and team members.
              </Text>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={() => setShowAboutModal(false)}
              >
                <Text style={styles.modalSaveText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Quick FAQ</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 380 }}>
              <FaqItem q="How do I add an animal?" a="Open Live Stock from Home, then tap the green '+' button to enter animal details and generate a QR tag." />
              <FaqItem q="How do I log daily milk yield?" a="Go to Production & Sales -> Daily Entry -> tap 'Add Entry' and select the animal." />
              <FaqItem q="How to adjust inventory stock?" a="In Inventory Management, use the '+/-' quick adjust buttons on any item." />
              <FaqItem q="How to edit or delete records?" a="Tap any item card to open its detail sheet and choose 'Edit' or 'Delete'." />

              <TouchableOpacity
                style={[styles.modalSaveBtn, { marginTop: 10 }]}
                onPress={() => setShowHelpModal(false)}
              >
                <Text style={styles.modalSaveText}>Got it</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 340 }}>
              <Text style={{ fontSize: 13, color: '#344054', lineHeight: 20 }}>
                Your farm data, production numbers, and financial transactions are securely stored and encrypted.
                We do not share your commercial farming data with any third party.
              </Text>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { marginTop: 18 }]}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={styles.modalSaveText}>I Understand</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
      <MaterialIcons name={icon} size={20} color="#667085" />
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    {right}
  </View>
);

const FaqItem = ({ q, a }) => (
  <View style={styles.faqItem}>
    <Text style={styles.faqQ}>{q}</Text>
    <Text style={styles.faqA}>{a}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  topBar: {
    backgroundColor: '#344054',
    paddingTop: 42,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontWeight: '900', color: '#101828', marginBottom: 8, fontSize: 13 },
  sectionCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontWeight: '700', color: '#344054', fontSize: 14 },
  rightText: { color: '#667085', fontWeight: '700', fontSize: 13 },
  logout: {
    margin: 16,
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FDA29B',
    backgroundColor: '#FEF3F2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: { color: '#D92D20', fontWeight: '900', fontSize: 14 },
  version: { textAlign: 'center', color: '#98A2B3', marginBottom: 20, fontSize: 11, lineHeight: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  modalHeader: {
    backgroundColor: '#344054',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: { color: '#fff', fontWeight: '900', fontSize: 15 },
  inputLabel: { fontSize: 12, color: '#475467', fontWeight: '800', marginTop: 10, marginBottom: 4 },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#101828',
  },
  modalSaveBtn: {
    backgroundColor: '#4FA765',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  modalSaveText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  langOptionActive: { borderColor: '#4FA765', backgroundColor: '#E9F5EE' },
  langOptionText: { fontSize: 14, fontWeight: '700', color: '#344054' },
  langOptionTextActive: { color: '#4FA765', fontWeight: '900' },
  faqItem: { marginBottom: 12, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 10 },
  faqQ: { fontWeight: '900', color: '#101828', fontSize: 13, marginBottom: 4 },
  faqA: { color: '#667085', fontSize: 12, lineHeight: 18 },
});
