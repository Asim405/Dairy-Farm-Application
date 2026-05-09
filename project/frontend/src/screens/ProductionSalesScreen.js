import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

const TABS = ['Overview', 'Daily Entry', 'Sales', 'Compare'];

export const ProductionSalesScreen = ({ navigation }) => {
  const [tab, setTab] = React.useState('Overview');
  const [loading, setLoading] = React.useState(true);
  const [overview, setOverview] = React.useState({ litersToday: 0, revenueToday: 0 });
  const [entries, setEntries] = React.useState([]);
  const [sales, setSales] = React.useState({ totals: { totalSalesWeek: 0, totalLitersWeek: 0 }, sales: [] });
  const [compare, setCompare] = React.useState([]);

  const [entryModal, setEntryModal] = React.useState(false);
  const [animals, setAnimals] = React.useState([]);
  const [entryForm, setEntryForm] = React.useState({ animalId: '', morningLiters: '', eveningLiters: '', entryDate: '' });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, eRes, sRes, cRes] = await Promise.all([
        apiClient.get('/production/overview'),
        apiClient.get('/production/entries'),
        apiClient.get('/production/sales'),
        apiClient.get('/production/compare'),
      ]);
      setOverview(oRes.data);
      setEntries(eRes.data || []);
      setSales(sRes.data);
      setCompare(cRes.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openEntry = async () => {
    const { data } = await apiClient.get('/animals?category=All');
    setAnimals(data || []);
    setEntryForm({ animalId: data?.[0]?.id ? String(data[0].id) : '', morningLiters: '', eveningLiters: '', entryDate: '' });
    setEntryModal(true);
  };

  const saveEntry = async () => {
    await apiClient.post('/production/entries', {
      animalId: Number(entryForm.animalId),
      entryDate: entryForm.entryDate || null,
      morningLiters: Number(entryForm.morningLiters || 0),
      eveningLiters: Number(entryForm.eveningLiters || 0),
    });
    setEntryModal(false);
    await load();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Production & Sales</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : tab === 'Overview' ? (
        <View style={{ padding: 16 }}>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Today</Text>
              <Text style={styles.kpiValue}>{overview.litersToday}L</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Revenue</Text>
              <Text style={styles.kpiValue}>₹{overview.revenueToday}</Text>
              <Text style={styles.kpiTiny}>Today</Text>
            </View>
          </View>

          <View style={styles.placeholderChart}>
            <Text style={styles.placeholderTitle}>Production Trend (Liters)</Text>
            <Text style={styles.placeholderText}>Chart placeholder (can be replaced with `react-native-chart-kit`).</Text>
          </View>
        </View>
      ) : tab === 'Daily Entry' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Add Daily Production</Text>
            <Text style={styles.actionSub}>Record today’s milk production from each animal</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={openEntry}>
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Add Production Entry</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.listTitle}>Today’s Entries</Text>
          <FlatList
            data={entries}
            keyExtractor={(it) => String(it.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            renderItem={({ item }) => (
              <View style={styles.listRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.animal_code}</Text>
                  <Text style={styles.rowSub}>Morning: {item.morning_liters}L • Evening: {item.evening_liters}L</Text>
                </View>
                <Text style={styles.rowRight}>{item.total_liters}L</Text>
              </View>
            )}
          />
        </View>
      ) : tab === 'Sales' ? (
        <View style={{ flex: 1, paddingTop: 8 }}>
          <View style={styles.salesHeader}>
            <Text style={styles.salesSmall}>Total Sales (This Week)</Text>
            <Text style={styles.salesBig}>Rs.{sales?.totals?.totalSalesWeek || 0}</Text>
            <Text style={styles.salesTiny}>{sales?.totals?.totalLitersWeek || 0} Liters sold</Text>
          </View>
          <Text style={styles.listTitle}>Recent Sales</Text>
          <FlatList
            data={sales.sales || []}
            keyExtractor={(it) => String(it.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            renderItem={({ item }) => (
              <View style={styles.listRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.buyer_name}</Text>
                  <Text style={styles.rowSub}>{String(item.sale_date).slice(0, 10)} • {item.liters_sold}L • ₹{item.price_per_liter}/L</Text>
                </View>
                <Text style={[styles.rowRight, { color: '#4FA765' }]}>₹{item.total_amount}</Text>
              </View>
            )}
          />
        </View>
      ) : (
        <View style={{ flex: 1, paddingTop: 8 }}>
          <Text style={styles.listTitle}>Animal-wise Production Comparison</Text>
          <FlatList
            data={compare}
            keyExtractor={(it) => String(it.animal_id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            renderItem={({ item }) => (
              <View style={styles.listRow}>
                <Text style={styles.rowTitle}>{item.animal_code}</Text>
                <Text style={styles.rowRight}>Avg: {Number(item.avg_liters_per_day).toFixed(1)} L/day</Text>
              </View>
            )}
          />
        </View>
      )}

      <Modal visible={entryModal} transparent animationType="fade" onRequestClose={() => setEntryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Production Entry</Text>
              <TouchableOpacity onPress={() => setEntryModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 14, gap: 10 }}>
              <Text style={styles.modalLabel}>Select Animal (id)</Text>
              <TextInput
                style={styles.modalInput}
                value={entryForm.animalId}
                onChangeText={(v) => setEntryForm((f) => ({ ...f, animalId: v }))}
                placeholder={animals?.[0]?.id ? String(animals[0].id) : '1'}
              />

              <Text style={styles.modalLabel}>Morning Production (Liters)</Text>
              <TextInput
                style={styles.modalInput}
                value={entryForm.morningLiters}
                onChangeText={(v) => setEntryForm((f) => ({ ...f, morningLiters: v }))}
                keyboardType="numeric"
                placeholder="0.0"
              />

              <Text style={styles.modalLabel}>Evening Production (Liters)</Text>
              <TextInput
                style={styles.modalInput}
                value={entryForm.eveningLiters}
                onChangeText={(v) => setEntryForm((f) => ({ ...f, eveningLiters: v }))}
                keyboardType="numeric"
                placeholder="0.0"
              />

              <Text style={styles.modalLabel}>Date (optional)</Text>
              <TextInput
                style={styles.modalInput}
                value={entryForm.entryDate}
                onChangeText={(v) => setEntryForm((f) => ({ ...f, entryDate: v }))}
                placeholder="YYYY-MM-DD"
              />

              <TouchableOpacity style={styles.modalSave} onPress={saveEntry}>
                <Text style={styles.modalSaveText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { backgroundColor: '#2F8C83', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  tabs: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8, flexWrap: 'wrap' },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#F2F4F7' },
  tabActive: { backgroundColor: '#2F8C83' },
  tabText: { fontWeight: '800', fontSize: 12, color: '#344054' },
  tabTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  kpiRow: { flexDirection: 'row', gap: 12 },
  kpiCard: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#EAECF0', padding: 12 },
  kpiLabel: { fontSize: 11, color: '#667085', fontWeight: '800' },
  kpiValue: { marginTop: 6, fontSize: 18, fontWeight: '900', color: '#101828' },
  kpiTiny: { marginTop: 2, fontSize: 11, color: '#667085', fontWeight: '700' },
  placeholderChart: { marginTop: 14, borderRadius: 12, borderWidth: 1, borderColor: '#EAECF0', padding: 12 },
  placeholderTitle: { fontWeight: '900', color: '#101828' },
  placeholderText: { marginTop: 6, color: '#667085' },
  actionCard: { margin: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAECF0', padding: 12, backgroundColor: '#F4FBF6' },
  actionTitle: { fontWeight: '900', color: '#101828' },
  actionSub: { marginTop: 4, color: '#667085', fontWeight: '700', fontSize: 12 },
  actionBtn: { marginTop: 10, backgroundColor: '#4FA765', borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  actionBtnText: { color: '#fff', fontWeight: '900' },
  listTitle: { paddingHorizontal: 16, paddingTop: 6, fontWeight: '900', color: '#101828' },
  listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#EAECF0', borderRadius: 12, padding: 12, marginBottom: 10 },
  rowTitle: { fontWeight: '900', color: '#101828' },
  rowSub: { marginTop: 2, color: '#667085', fontWeight: '700', fontSize: 12 },
  rowRight: { fontWeight: '900', color: '#2F8C83' },
  salesHeader: { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAECF0', padding: 12 },
  salesSmall: { color: '#667085', fontWeight: '800', fontSize: 11 },
  salesBig: { marginTop: 6, fontSize: 18, fontWeight: '900', color: '#101828' },
  salesTiny: { marginTop: 2, color: '#667085', fontWeight: '700', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  modalHeader: { backgroundColor: '#4FA765', padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: '#fff', fontWeight: '900' },
  modalLabel: { fontSize: 12, color: '#667085', fontWeight: '800' },
  modalInput: { backgroundColor: '#F2F4F7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  modalSave: { backgroundColor: '#4FA765', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  modalSaveText: { color: '#fff', fontWeight: '900' },
});

