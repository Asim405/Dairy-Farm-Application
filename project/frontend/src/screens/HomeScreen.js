import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - 44) / 2; // Adjusted for padding and gap

export const HomeScreen = ({ navigation }) => {
  const { state } = React.useContext(AuthContext);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [stats, setStats] = React.useState({
    totalAnimals: 0,
    litersToday: 0,
    revenueToday: 0,
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [animalsRes, prodRes] = await Promise.all([
        apiClient.get('/animals?category=All'),
        apiClient.get('/production/overview'),
      ]);
      setStats({
        totalAnimals: animalsRes.data?.length || 0,
        litersToday: prodRes.data?.litersToday || 0,
        revenueToday: prodRes.data?.revenueToday || 0,
      });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const tiles = [
    { title: 'Live Stock Management', icon: 'pets', color: '#4FA765', screen: 'LiveStock' },
    { title: 'Health', icon: 'favorite', color: '#C23B3B', screen: 'Health' },
    { title: 'Production & Sales', icon: 'local-drink', color: '#2F8C83', screen: 'ProductionSales' },
    { title: 'Finance & Operations', icon: 'attach-money', color: '#E07A16', screen: 'FinanceOperations' },
    { title: 'Staff Management', icon: 'people', color: '#6A4A3C', screen: 'StaffManagement' },
    // FIXED: changed 'inventory-2' to 'inventory'
    { title: 'Inventory Management', icon: 'inventory', color: '#2C4D5F', screen: 'InventoryManagement' },
    { title: 'Crops Detail', icon: 'grass', color: '#4FA765', screen: 'CropsDetail' },
    { title: 'AI Health Detection', icon: 'insights', color: '#C8A15A', comingSoon: true },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeSmall}>Welcome back,</Text>
          <Text style={styles.welcomeName}>{state?.user?.fullName || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconButton}>
          <MaterialIcons name="person" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.heroTitle}>Total Animals</Text>
            <Text style={styles.heroValue}>{stats.totalAnimals}</Text>
            <Text style={styles.heroHint}>+ {Math.max(0, Math.round(stats.totalAnimals * 0.05))} this month</Text>
          </>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>Farm Management</Text>
      
      <View style={styles.grid}>
        {tiles.map((t) => (
          <TouchableOpacity
            key={t.title}
            style={[styles.tile, t.comingSoon && styles.tileDisabled]}
            onPress={() => !t.comingSoon && navigation.navigate(t.screen)}
            disabled={t.comingSoon}
          >
            <View style={[styles.tileIcon, { backgroundColor: t.color }]}>
              <MaterialIcons name={t.icon} size={22} color="#fff" />
            </View>
            <Text style={styles.tileText}>{t.title}</Text>
            {t.comingSoon ? <Text style={styles.comingSoon}>Coming Soon</Text> : null}
          </TouchableOpacity>
        ))}
      </View>
      {/* Extra padding at bottom for scrollability */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    backgroundColor: '#4FA765',
    paddingHorizontal: 16,
    paddingTop: 40, // Increased for status bar
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeSmall: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  welcomeName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: '#77B67F',
    margin: 16,
    borderRadius: 14,
    padding: 20,
  },
  heroTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
  },
  heroValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  heroHint: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontSize: 12,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    fontWeight: '800',
    color: '#101828',
    fontSize: 16,
  },
  grid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: TILE_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 12,
    marginBottom: 12,
    minHeight: 100,
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tileDisabled: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#344054',
    lineHeight: 18,
  },
  comingSoon: {
    marginTop: 4,
    fontSize: 10,
    color: '#B54708',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  error: {
    marginHorizontal: 16,
    color: '#B42318',
    marginBottom: 12,
    backgroundColor: '#FEF3F2',
    padding: 8,
    borderRadius: 6,
    fontSize: 12,
  },
});