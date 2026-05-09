import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../services/apiClient';

export const ProfileScreen = ({ navigation }) => {
  const { state, signOut } = useContext(AuthContext);
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState(null);
  const [stats, setStats] = React.useState({ totalAnimals: 0, litersToday: 0, revenueWeek: 0, staffMembers: 0 });

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
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>My Profile</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <View style={styles.headerCard}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={26} color="#4FA765" />
            </View>
            <Text style={styles.name}>{profile?.fullName || state?.user?.fullName || 'User'}</Text>
            <Text style={styles.role}>{profile?.role || 'Farm Owner'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <InfoRow icon="person" label="Full Name" value={profile?.fullName || '-'} />
            <InfoRow icon="mail" label="Email" value={profile?.email || '-'} />
            <InfoRow icon="phone" label="Phone Number" value={profile?.phoneNumber || '-'} />
            <InfoRow icon="calendar-today" label="Member Since" value={profile?.createdAt ? String(profile.createdAt).slice(0, 10) : '-'} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farm Statistics</Text>
            <View style={styles.statsGrid}>
              <StatCard value={stats.totalAnimals} label="Total Animals" tint="#E9F5EE" />
              <StatCard value={`${stats.litersToday}L`} label="Daily Production" tint="#EAF3FF" />
              <StatCard value={`₹${stats.revenueWeek}`} label="Weekly Revenue" tint="#E9F5EE" />
              <StatCard value={stats.staffMembers} label="Staff Members" tint="#F2F2F2" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farm Details</Text>
            <InfoRow icon="agriculture" label="Farm Name" value={profile?.farmName || '—'} />
            <InfoRow icon="place" label="Location" value={profile?.farmLocation || '—'} />
            <InfoRow icon="map" label="Total Land" value={profile?.totalLandAcres ? `${profile.totalLandAcres} Acres` : '—'} />
          </View>

          <TouchableOpacity style={styles.logout} onPress={signOut}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
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

const StatCard = ({ value, label, tint }) => (
  <View style={[styles.statCard, { backgroundColor: tint }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    backgroundColor: '#4FA765',
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard: {
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  name: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#101828' },
  role: { marginTop: 2, fontSize: 12, color: '#667085' },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontWeight: '900', color: '#101828', marginBottom: 10 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  infoLabel: { fontSize: 11, color: '#667085', fontWeight: '700' },
  infoValue: { marginTop: 2, color: '#101828', fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  statValue: { fontSize: 16, fontWeight: '900', color: '#101828' },
  statLabel: { marginTop: 4, fontSize: 11, color: '#667085', fontWeight: '700' },
  logout: {
    margin: 16,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F04438',
    alignItems: 'center',
  },
  logoutText: { color: '#F04438', fontWeight: '900' },
});
