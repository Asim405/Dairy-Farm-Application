import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - 44) / 2;

export const HomeScreen = ({ navigation }) => {
  const { state } = React.useContext(AuthContext);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [stats, setStats] = React.useState({
    totalAnimals: 0,
    litersToday: 0,
    revenueToday: 0,
  });

  const load = React.useCallback(async () => {
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
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const tiles = [
    { title: 'Live Stock Management', icon: 'pets', color: '#4FA765', screen: 'LiveStock', sub: `${stats.totalAnimals} Herd` },
    { title: 'Health Management', icon: 'favorite', color: '#C23B3B', screen: 'Health', sub: 'Vaccines & Checkups' },
    { title: 'Production & Sales', icon: 'local-drink', color: '#2F8C83', screen: 'ProductionSales', sub: `${stats.litersToday}L Today` },
    { title: 'Finance & Operations', icon: 'attach-money', color: '#E07A16', screen: 'FinanceOperations', sub: `Rs.${stats.revenueToday}` },
    { title: 'Staff Management', icon: 'people', color: '#6A4A3C', screen: 'StaffManagement', sub: 'Team & Payroll' },
    { title: 'Inventory Management', icon: 'inventory', color: '#2C4D5F', screen: 'InventoryManagement', sub: 'Feed & Supplies' },
    { title: 'Crops Detail', icon: 'grass', color: '#4FA765', screen: 'CropsDetail', sub: 'Land & Harvest' },
    { title: 'AI Health Detection', icon: 'insights', color: '#C8A15A', comingSoon: true, sub: 'Smart Diagnosis' },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4FA765']} />}
    >
      {/* Top Welcome Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeSmall}>Welcome back,</Text>
          <Text style={styles.welcomeName}>{state?.user?.fullName || 'Farm Manager'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.iconButton}
          activeOpacity={0.8}
        >
          <MaterialIcons name="person" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Hero Metrics Card */}
      <View style={styles.hero}>
        {loading ? (
          <ActivityIndicator color="#fff" style={{ padding: 20 }} />
        ) : (
          <>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroTitle}>Total Herd Size</Text>
                <Text style={styles.heroValue}>{stats.totalAnimals} Animals</Text>
              </View>
              <View style={styles.heroIconBox}>
                <MaterialIcons name="pets" size={26} color="#4FA765" />
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStatsRow}>
              <View style={styles.heroMiniStat}>
                <Text style={styles.heroMiniLabel}>Today's Milk</Text>
                <Text style={styles.heroMiniVal}>{stats.litersToday} Liters</Text>
              </View>
              <View style={styles.heroMiniDivider} />
              <View style={styles.heroMiniStat}>
                <Text style={styles.heroMiniLabel}>Today's Sales</Text>
                <Text style={styles.heroMiniVal}>Rs. {stats.revenueToday.toLocaleString()}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Quick Action Shortcuts */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('AddAnimal')}
        >
          <MaterialIcons name="add" size={18} color="#4FA765" />
          <Text style={styles.quickActionText}>Add Animal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('ProductionSales')}
        >
          <MaterialIcons name="local-drink" size={18} color="#2F8C83" />
          <Text style={styles.quickActionText}>Log Milk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('FinanceOperations')}
        >
          <MaterialIcons name="receipt" size={18} color="#E07A16" />
          <Text style={styles.quickActionText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Farm Modules</Text>

      {/* Grid of Management Modules */}
      <View style={styles.grid}>
        {tiles.map((t) => (
          <TouchableOpacity
            key={t.title}
            style={[styles.tile, t.comingSoon && styles.tileDisabled]}
            onPress={() => !t.comingSoon && navigation.navigate(t.screen)}
            disabled={t.comingSoon}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIcon, { backgroundColor: t.color }]}>
              <MaterialIcons name={t.icon} size={22} color="#fff" />
            </View>
            <Text style={styles.tileText}>{t.title}</Text>
            <Text style={styles.tileSub}>{t.sub}</Text>
            {t.comingSoon ? <Text style={styles.comingSoon}>Coming Soon</Text> : null}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB',
  },
  topBar: {
    backgroundColor: '#4FA765',
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeSmall: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  welcomeName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: '#439757',
    margin: 16,
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    shadowColor: '#439757',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
  },
  heroValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  heroIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 14,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMiniStat: { flex: 1 },
  heroMiniDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 12,
  },
  heroMiniLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
  },
  heroMiniVal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 12,
    paddingVertical: 10,
  },
  quickActionText: { fontSize: 12, fontWeight: '800', color: '#344054' },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontWeight: '900',
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 14,
    marginBottom: 12,
    minHeight: 110,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  tileDisabled: {
    opacity: 0.65,
    backgroundColor: '#F9FAFB',
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#101828',
    lineHeight: 18,
  },
  tileSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#667085',
    marginTop: 3,
  },
  comingSoon: {
    marginTop: 4,
    fontSize: 9,
    color: '#B54708',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  error: {
    marginHorizontal: 16,
    color: '#B42318',
    marginBottom: 12,
    backgroundColor: '#FEF3F2',
    padding: 10,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '600',
  },
});