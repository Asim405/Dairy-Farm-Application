import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

const CATS = ['All', 'Fodder', 'Medicines', 'Equipment'];

export const InventoryManagementScreen = ({ navigation }) => {
  const [category, setCategory] = React.useState('All');
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/inventory?category=${encodeURIComponent(category)}`);
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  }, [category]);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  React.useEffect(() => {
    load();
  }, [category, load]);

  const lowStockCount = items.filter((x) => x.low_stock).length;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Inventory Management</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddInventoryItem')} style={styles.addBtn}>
          <MaterialIcons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.chips}>
        {CATS.map((c) => {
          const active = c === category;
          return (
            <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {lowStockCount > 0 ? (
        <View style={styles.alert}>
          <MaterialIcons name="warning" size={18} color="#B42318" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Low Stock Alert</Text>
            <Text style={styles.alertSub}>{lowStockCount} items need restocking</Text>
          </View>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <MaterialIcons name="inventory-2" size={18} color="#2C4D5F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.item_name}</Text>
                <Text style={styles.sub}>{item.category}</Text>
                <Text style={styles.meta}>Current Stock</Text>
                <Text style={styles.value}>
                  {item.quantity} {item.unit}
                </Text>
                <Text style={styles.meta2}>Min Level {item.min_stock_level} {item.unit}</Text>
              </View>
              <View style={[styles.badge, item.low_stock ? styles.badgeLow : styles.badgeOk]}>
                <Text style={styles.badgeText}>{item.low_stock ? 'Low Stock' : 'In Stock'}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { backgroundColor: '#2C4D5F', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F2F4F7' },
  chipActive: { backgroundColor: '#2C4D5F' },
  chipText: { fontSize: 12, color: '#344054', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  alert: { marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 12, backgroundColor: '#FEE4E2', flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertTitle: { fontWeight: '900', color: '#B42318' },
  alertSub: { color: '#B42318', fontWeight: '700', fontSize: 12, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#EAECF0', borderRadius: 12, padding: 12, marginBottom: 10 },
  iconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EAF3FF', alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '900', color: '#101828' },
  sub: { color: '#667085', fontWeight: '700', marginTop: 2, fontSize: 12 },
  meta: { marginTop: 8, color: '#667085', fontWeight: '800', fontSize: 10 },
  value: { marginTop: 2, fontWeight: '900', color: '#101828' },
  meta2: { marginTop: 6, color: '#667085', fontWeight: '700', fontSize: 10 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeLow: { backgroundColor: '#FEE4E2' },
  badgeOk: { backgroundColor: '#E9F5EE' },
  badgeText: { fontSize: 11, fontWeight: '900', color: '#344054' },
});

