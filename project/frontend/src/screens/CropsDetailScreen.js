import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

export const CropsDetailScreen = ({ navigation }) => {
  const [loading, setLoading] = React.useState(true);
  const [crops, setCrops] = React.useState([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/crops');
      setCrops(data || []);
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
          <Text style={styles.topTitle}>Crops Detail</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddCrop')} style={styles.addBtn}>
          <MaterialIcons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={crops}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          ListHeaderComponent={
            <View style={styles.statsRow}>
              <Stat value={10} label="Total Land" />
              <Stat value={crops.length} label="Crops" />
              <Stat value="75%" label="Avg Growth" accent />
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <MaterialIcons name="grass" size={18} color="#4FA765" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.crop_name}</Text>
                <Text style={styles.sub}>
                  {item.land_size} {item.land_unit} • Planted {String(item.planted_date).slice(0, 10)}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: item.status === 'Ready Soon' ? '95%' : '62%' }]} />
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>Expected: {item.expected_harvest_date ? String(item.expected_harvest_date).slice(0, 10) : '—'}</Text>
                  <View style={[styles.badge, item.status === 'Ready Soon' ? styles.badgeSoon : styles.badgeGrow]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const Stat = ({ value, label, accent }) => (
  <View style={[styles.stat, accent && { borderColor: '#F79009' }]}>
    <Text style={[styles.statValue, accent && { color: '#B54708' }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { backgroundColor: '#4FA765', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  stat: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#EAECF0', padding: 12, alignItems: 'center' },
  statValue: { fontWeight: '900', color: '#4FA765' },
  statLabel: { marginTop: 4, fontSize: 11, color: '#667085', fontWeight: '700' },
  card: { flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#EAECF0', borderRadius: 12, padding: 12, marginBottom: 10 },
  iconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#E9F5EE', alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '900', color: '#101828' },
  sub: { color: '#667085', fontWeight: '700', marginTop: 2, fontSize: 12 },
  progressBar: { height: 6, borderRadius: 999, backgroundColor: '#EAECF0', marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: '#4FA765' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  meta: { color: '#667085', fontWeight: '700', fontSize: 11 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeGrow: { backgroundColor: '#E9F5EE' },
  badgeSoon: { backgroundColor: '#FEF0C7' },
  badgeText: { fontSize: 11, fontWeight: '900', color: '#344054' },
});

