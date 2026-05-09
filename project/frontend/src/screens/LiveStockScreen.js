import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

const CATEGORIES = ['All', 'Cow', 'Buffalo', 'Sheep', 'Goat'];

export const LiveStockScreen = ({ navigation }) => {
  const [category, setCategory] = React.useState('All');
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [animals, setAnimals] = React.useState([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/animals?category=${encodeURIComponent(category)}&q=${encodeURIComponent(q)}`);
      setAnimals(data);
    } finally {
      setLoading(false);
    }
  }, [category, q]);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  React.useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [category, q, load]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Live Stock</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <MaterialIcons name="search" size={18} color="#98A2B3" />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search by ID or breed..."
          style={styles.searchInput}
        />
        <MaterialIcons name="tune" size={18} color="#98A2B3" />
      </View>

      <View style={styles.chips}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={animals}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="pets" size={18} color="#4FA765" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.animal_code}</Text>
                <Text style={styles.rowSub}>
                  {item.breed || 'Unknown'} • {item.age_years ?? '-'} years
                </Text>
              </View>
              <View style={[styles.badge, badgeStyle(item.health_status)]}>
                <Text style={styles.badgeText}>{item.health_status}</Text>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddAnimal')}>
        <MaterialIcons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

function badgeStyle(status) {
  if (status === 'Healthy') return { backgroundColor: '#E9F5EE' };
  if (status === 'Under Treatment') return { backgroundColor: '#FEF0C7' };
  if (status === 'Sick') return { backgroundColor: '#FEE4E2' };
  return { backgroundColor: '#F2F4F7' };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { backgroundColor: '#4FA765', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  searchRow: {
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F2F4F7' },
  chipActive: { backgroundColor: '#4FA765' },
  chipText: { fontSize: 12, color: '#344054', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#E9F5EE', alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontWeight: '900', color: '#101828' },
  rowSub: { marginTop: 2, color: '#667085', fontSize: 12, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#344054' },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4FA765',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});

