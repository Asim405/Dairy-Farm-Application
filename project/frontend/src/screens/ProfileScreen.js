import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../services/apiClient';

export const ProfileScreen = ({ navigation }) => {
  const { state, signOut } = useContext(AuthContext);
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState(null);
  const [stats, setStats] = React.useState({
    totalAnimals: 0,
    litersToday: 0,
    revenueWeek: 0,
    staffMembers: 0,
  });

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: '',
    phoneNumber: '',
    farmName: '',
    farmLocation: '',
    totalLandAcres: '',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, animalsRes, prodRes, salesRes, staffRes] = await Promise.all([
        apiClient.get('/users/me'),
        apiClient.get('/animals?category=All'),
        apiClient.get('/production/overview'),
        apiClient.get('/production/sales'),
        apiClient.get('/staff'),
      ]);

      setProfile(meRes.data);
      setStats({
        totalAnimals: animalsRes.data?.length || 0,
        litersToday: prodRes.data?.litersToday || 0,
        revenueWeek: salesRes.data?.totals?.totalSalesWeek || 0,
        staffMembers: staffRes.data?.length || 0,
      });
    } catch (e) {
      console.log('Error loading profile', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openEditModal = () => {
    setForm({
      fullName: profile?.fullName || state?.user?.fullName || '',
      phoneNumber: profile?.phoneNumber || '',
      farmName: profile?.farmName || '',
      farmLocation: profile?.farmLocation || '',
      totalLandAcres: profile?.totalLandAcres != null ? String(profile.totalLandAcres) : '',
    });
    setShowEditModal(true);
  };

  const saveProfile = async () => {
    if (!form.fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
        farmName: form.farmName.trim() || null,
        farmLocation: form.farmLocation.trim() || null,
        totalLandAcres: form.totalLandAcres ? Number(form.totalLandAcres) : null,
      };

      const { data } = await apiClient.put('/users/me', payload);
      setProfile((prev) => ({ ...prev, ...data.user }));
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openEditModal} style={styles.editHeaderBtn}>
          <MaterialIcons name="edit" size={18} color="#fff" />
          <Text style={styles.editHeaderText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4FA765" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={32} color="#4FA765" />
            </View>
            <Text style={styles.name}>{profile?.fullName || state?.user?.fullName || 'Farm Manager'}</Text>
            <Text style={styles.role}>{profile?.role || 'Dairy Farm Owner'}</Text>
            {profile?.farmName ? (
              <View style={styles.farmPill}>
                <MaterialIcons name="agriculture" size={14} color="#4FA765" />
                <Text style={styles.farmPillText}>{profile.farmName}</Text>
              </View>
            ) : null}
          </View>

          {/* Farm Statistics Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farm Statistics</Text>
            <View style={styles.statsGrid}>
              <StatCard value={stats.totalAnimals} label="Total Animals" tint="#E9F5EE" icon="pets" color="#4FA765" />
              <StatCard value={`${stats.litersToday} L`} label="Daily Production" tint="#E0F2FE" icon="local-drink" color="#0284C7" />
              <StatCard value={`Rs. ${stats.revenueWeek}`} label="Weekly Revenue" tint="#FEF0C7" icon="attach-money" color="#B54708" />
              <StatCard value={stats.staffMembers} label="Staff Members" tint="#F2F4F7" icon="people" color="#667085" />
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <InfoRow icon="person" label="Full Name" value={profile?.fullName || '-'} />
            <InfoRow icon="mail" label="Email Address" value={profile?.email || '-'} />
            <InfoRow icon="phone" label="Phone Number" value={profile?.phoneNumber || '-'} />
            <InfoRow
              icon="calendar-today"
              label="Member Since"
              value={profile?.createdAt ? String(profile.createdAt).slice(0, 10) : '-'}
            />
          </View>

          {/* Farm Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farm Details</Text>
            <InfoRow icon="agriculture" label="Farm Name" value={profile?.farmName || 'Not configured'} />
            <InfoRow icon="place" label="Location" value={profile?.farmLocation || 'Not configured'} />
            <InfoRow
              icon="map"
              label="Total Land"
              value={profile?.totalLandAcres ? `${profile.totalLandAcres} Acres` : 'Not configured'}
            />
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logout} onPress={signOut} activeOpacity={0.85}>
            <MaterialIcons name="logout" size={18} color="#D92D20" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={form.fullName}
                onChangeText={(v) => setForm((f) => ({ ...f, fullName: v }))}
                placeholder="Enter full name"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={form.phoneNumber}
                onChangeText={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
                placeholder="0300-1234567"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Farm Name</Text>
              <TextInput
                style={styles.modalInput}
                value={form.farmName}
                onChangeText={(v) => setForm((f) => ({ ...f, farmName: v }))}
                placeholder="e.g. Al-Madina Dairy Farm"
              />

              <Text style={styles.inputLabel}>Farm Location</Text>
              <TextInput
                style={styles.modalInput}
                value={form.farmLocation}
                onChangeText={(v) => setForm((f) => ({ ...f, farmLocation: v }))}
                placeholder="e.g. Sahiwal, Punjab"
              />

              <Text style={styles.inputLabel}>Total Land (Acres)</Text>
              <TextInput
                style={styles.modalInput}
                value={form.totalLandAcres}
                onChangeText={(v) => setForm((f) => ({ ...f, totalLandAcres: v }))}
                placeholder="e.g. 25"
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.modalSaveBtn, saving && { opacity: 0.7 }]}
                onPress={saveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <MaterialIcons name={icon} size={18} color="#667085" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const StatCard = ({ value, label, tint, icon, color }) => (
  <View style={[styles.statCard, { backgroundColor: tint }]}>
    <MaterialIcons name={icon} size={18} color={color} style={{ marginBottom: 4 }} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  topBar: {
    backgroundColor: '#4FA765',
    paddingTop: 42,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  editHeaderText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E9F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4FA765',
  },
  name: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#101828' },
  role: { marginTop: 2, fontSize: 13, color: '#667085', fontWeight: '600' },
  farmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#E9F5EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  farmPillText: { fontSize: 11, fontWeight: '800', color: '#4FA765' },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontWeight: '900', color: '#101828', marginBottom: 10, fontSize: 14 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: { fontSize: 11, color: '#667085', fontWeight: '700' },
  infoValue: { marginTop: 2, color: '#101828', fontWeight: '800', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  statValue: { fontSize: 16, fontWeight: '900', color: '#101828' },
  statLabel: { marginTop: 2, fontSize: 11, color: '#667085', fontWeight: '700' },
  logout: {
    margin: 16,
    marginTop: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  modalHeader: {
    backgroundColor: '#4FA765',
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
    marginTop: 18,
    marginBottom: 10,
  },
  modalSaveText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
