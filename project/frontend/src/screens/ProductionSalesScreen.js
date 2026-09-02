import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';
import { LineTrendChart, BarChart } from '../components/Charts';

const TABS = ['Overview', 'Daily Entry', 'Sales', 'Compare'];

export const ProductionSalesScreen = ({ navigation }) => {
  const [tab, setTab] = React.useState('Overview');
  const [loading, setLoading] = React.useState(true);
  const [overview, setOverview] = React.useState({ litersToday: 0, revenueToday: 0 });
  const [trendData, setTrendData] = React.useState([]);
  const [entries, setEntries] = React.useState([]);
  const [sales, setSales] = React.useState({ totals: { totalSalesWeek: 0, totalLitersWeek: 0 }, sales: [] });
  const [compare, setCompare] = React.useState([]);
  const [animals, setAnimals] = React.useState([]);

  // Modals
  const [entryModal, setEntryModal] = React.useState(false);
  const [editingEntryId, setEditingEntryId] = React.useState(null);
  const [entryForm, setEntryForm] = React.useState({
    animalId: '',
    morningLiters: '',
    eveningLiters: '',
    entryDate: '',
  });

  const [saleModal, setSaleModal] = React.useState(false);
  const [saleForm, setSaleForm] = React.useState({
    buyerName: '',
    litersSold: '',
    pricePerLiter: '',
    saleDate: '',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, eRes, sRes, cRes, tRes, aRes] = await Promise.all([
        apiClient.get('/production/overview'),
        apiClient.get('/production/entries'),
        apiClient.get('/production/sales'),
        apiClient.get('/production/compare'),
        apiClient.get('/production/trend'),
        apiClient.get('/animals?category=All'),
      ]);
      setOverview(oRes.data || { litersToday: 0, revenueToday: 0 });
      setEntries(eRes.data || []);
      setSales(sRes.data || { totals: { totalSalesWeek: 0, totalLitersWeek: 0 }, sales: [] });
      setCompare(cRes.data || []);
      setTrendData(tRes.data || []);
      setAnimals(aRes.data || []);
    } catch (e) {
      console.log('Error loading production data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  // Open Add/Edit Production Entry
  const openEntry = (item = null) => {
    if (item) {
      setEditingEntryId(item.id);
      setEntryForm({
        animalId: String(item.animal_id),
        morningLiters: String(item.morning_liters),
        eveningLiters: String(item.evening_liters),
        entryDate: item.entry_date ? String(item.entry_date).slice(0, 10) : '',
      });
    } else {
      setEditingEntryId(null);
      setEntryForm({
        animalId: animals[0]?.id ? String(animals[0].id) : '',
        morningLiters: '',
        eveningLiters: '',
        entryDate: new Date().toISOString().slice(0, 10),
      });
    }
    setEntryModal(true);
  };

  const saveEntry = async () => {
    if (!entryForm.animalId) {
      Alert.alert('Required', 'Please select an animal');
      return;
    }
    try {
      if (editingEntryId) {
        await apiClient.put(`/production/entries/${editingEntryId}`, {
          morningLiters: Number(entryForm.morningLiters || 0),
          eveningLiters: Number(entryForm.eveningLiters || 0),
          entryDate: entryForm.entryDate || null,
        });
      } else {
        await apiClient.post('/production/entries', {
          animalId: Number(entryForm.animalId),
          entryDate: entryForm.entryDate || null,
          morningLiters: Number(entryForm.morningLiters || 0),
          eveningLiters: Number(entryForm.eveningLiters || 0),
        });
      }
      setEntryModal(false);
      load();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save entry');
    }
  };

  const deleteEntry = (id) => {
    Alert.alert('Delete Entry', 'Are you sure you want to remove this milk entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/production/entries/${id}`);
            load();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete entry');
          }
        },
      },
    ]);
  };

  // Open Add Sale Modal
  const openSaleModal = () => {
    setSaleForm({
      buyerName: '',
      litersSold: '',
      pricePerLiter: '180',
      saleDate: new Date().toISOString().slice(0, 10),
    });
    setSaleModal(true);
  };

  const saveSale = async () => {
    if (!saleForm.buyerName.trim() || !saleForm.litersSold || !saleForm.pricePerLiter) {
      Alert.alert('Required Fields', 'Please enter Buyer Name, Liters Sold, and Price/Liter');
      return;
    }
    try {
      await apiClient.post('/production/sales', {
        buyerName: saleForm.buyerName.trim(),
        litersSold: Number(saleForm.litersSold),
        pricePerLiter: Number(saleForm.pricePerLiter),
        saleDate: saleForm.saleDate.trim() || null,
      });
      setSaleModal(false);
      load();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to record sale');
    }
  };

  const deleteSale = (id, buyer) => {
    Alert.alert('Delete Sale Record', `Delete sale for "${buyer}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/production/sales/${id}`);
            load();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete sale');
          }
        },
      },
    ]);
  };

  const calculatedTotal =
    (Number(saleForm.litersSold) || 0) * (Number(saleForm.pricePerLiter) || 0);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Production & Sales</Text>
        </TouchableOpacity>
        {tab === 'Sales' && (
          <TouchableOpacity onPress={openSaleModal} style={styles.topAddBtn}>
            <MaterialIcons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2F8C83" />
        </View>
      ) : tab === 'Overview' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
          {/* KPI Cards */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: '#E0F2FE' }]}>
                <MaterialIcons name="local-drink" size={20} color="#0284C7" />
              </View>
              <Text style={styles.kpiLabel}>Today's Milk</Text>
              <Text style={styles.kpiValue}>{overview.litersToday} L</Text>
              <Text style={styles.kpiTiny}>Total recorded today</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: '#E9F5EE' }]}>
                <MaterialIcons name="attach-money" size={20} color="#4FA765" />
              </View>
              <Text style={styles.kpiLabel}>Today's Sales</Text>
              <Text style={styles.kpiValue}>Rs. {overview.revenueToday}</Text>
              <Text style={styles.kpiTiny}>Daily revenue</Text>
            </View>
          </View>

          {/* 7-Day Trend Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>7-Day Milk Production Trend</Text>
                <Text style={styles.chartSub}>Daily volume across herd (Liters)</Text>
              </View>
              <MaterialIcons name="show-chart" size={20} color="#2F8C83" />
            </View>

            {trendData.length > 0 ? (
              <LineTrendChart data={trendData} yKey="total_liters" xKey="day_name" unit="L" />
            ) : (
              <View style={styles.emptyTrend}>
                <Text style={styles.emptyTrendText}>Record daily entries to see milk production graphs</Text>
              </View>
            )}
          </View>

          {/* Weekly Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Weekly Performance</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Total Milk Sold</Text>
                <Text style={styles.summaryVal}>{sales.totals?.totalLitersWeek || 0} L</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Weekly Sales</Text>
                <Text style={[styles.summaryVal, { color: '#2F8C83' }]}>
                  Rs. {sales.totals?.totalSalesWeek || 0}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : tab === 'Daily Entry' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.actionCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Add Daily Production</Text>
              <Text style={styles.actionSub}>Log morning and evening yield per animal</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openEntry(null)}>
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Add Entry</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.listTitle}>Today's Entries ({entries.length})</Text>

          {entries.length === 0 ? (
            <View style={styles.center}>
              <MaterialIcons name="local-drink" size={48} color="#D0D5DD" />
              <Text style={styles.emptyTitle}>No entries for today</Text>
              <Text style={styles.emptySub}>Tap "Add Entry" to log milk yield</Text>
            </View>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(it) => String(it.id)}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              renderItem={({ item }) => (
                <View style={styles.listRow}>
                  <View style={styles.entryIcon}>
                    <MaterialIcons name="pets" size={18} color="#2F8C83" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.animal_code}</Text>
                    <Text style={styles.rowSub}>
                      Morning: {item.morning_liters}L • Evening: {item.evening_liters}L
                    </Text>
                  </View>
                  <Text style={styles.rowTotal}>{item.total_liters} L</Text>

                  <TouchableOpacity onPress={() => openEntry(item)} style={styles.iconBtn}>
                    <MaterialIcons name="edit" size={18} color="#4FA765" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteEntry(item.id)} style={styles.iconBtn}>
                    <MaterialIcons name="delete-outline" size={18} color="#D92D20" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      ) : tab === 'Sales' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.salesHeader}>
            <View>
              <Text style={styles.salesSmall}>This Week's Revenue</Text>
              <Text style={styles.salesBig}>Rs. {sales?.totals?.totalSalesWeek || 0}</Text>
              <Text style={styles.salesTiny}>{sales?.totals?.totalLitersWeek || 0} Liters sold</Text>
            </View>
            <TouchableOpacity style={styles.newSaleBtn} onPress={openSaleModal}>
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text style={styles.newSaleBtnText}>New Sale</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.listTitle}>Recent Milk Sales</Text>

          {sales.sales?.length === 0 ? (
            <View style={styles.center}>
              <MaterialIcons name="receipt-long" size={48} color="#D0D5DD" />
              <Text style={styles.emptyTitle}>No sales recorded</Text>
              <Text style={styles.emptySub}>Record buyer orders to track revenue</Text>
            </View>
          ) : (
            <FlatList
              data={sales.sales || []}
              keyExtractor={(it) => String(it.id)}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              renderItem={({ item }) => (
                <View style={styles.listRow}>
                  <View style={[styles.entryIcon, { backgroundColor: '#E9F5EE' }]}>
                    <MaterialIcons name="receipt" size={18} color="#4FA765" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.buyer_name}</Text>
                    <Text style={styles.rowSub}>
                      {String(item.sale_date).slice(0, 10)} • {item.liters_sold}L @ Rs.{item.price_per_liter}/L
                    </Text>
                  </View>
                  <Text style={styles.salesAmount}>Rs. {item.total_amount}</Text>

                  <TouchableOpacity
                    onPress={() => deleteSale(item.id, item.buyer_name)}
                    style={styles.iconBtn}
                  >
                    <MaterialIcons name="delete-outline" size={18} color="#D92D20" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      ) : (
        /* Compare Tab */
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={styles.compareTitle}>Animal Yield Comparison (7-Day Average)</Text>
          <Text style={styles.compareSub}>Compare daily average milk yields across all livestock</Text>

          {compare.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No comparison data yet</Text>
            </View>
          ) : (
            <FlatList
              data={compare}
              keyExtractor={(it) => String(it.animal_id)}
              contentContainerStyle={{ paddingBottom: 60 }}
              renderItem={({ item, index }) => {
                const avg = Number(item.avg_liters_per_day || 0);
                const maxAvg = Math.max(...compare.map((c) => Number(c.avg_liters_per_day || 0)), 1);
                const pct = Math.min(100, Math.round((avg / maxAvg) * 100));
                return (
                  <View style={styles.compareCard}>
                    <View style={styles.compareHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.rankNum}>#{index + 1}</Text>
                        <Text style={styles.compareAnimal}>{item.animal_code}</Text>
                      </View>
                      <Text style={styles.compareAvg}>{avg.toFixed(1)} L/day</Text>
                    </View>
                    <View style={styles.yieldTrack}>
                      <View style={[styles.yieldBar, { width: `${pct}%` }]} />
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}

      {/* Add / Edit Daily Entry Modal */}
      <Modal
        visible={entryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEntryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEntryId ? 'Edit Production Entry' : 'Add Production Entry'}
              </Text>
              <TouchableOpacity onPress={() => setEntryModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 400 }}>
              {!editingEntryId && (
                <>
                  <Text style={styles.inputLabel}>Select Animal *</Text>
                  <View style={styles.animalChips}>
                    {animals.map((a) => {
                      const active = String(entryForm.animalId) === String(a.id);
                      return (
                        <TouchableOpacity
                          key={a.id}
                          style={[styles.animalChip, active && styles.animalChipActive]}
                          onPress={() => setEntryForm((f) => ({ ...f, animalId: String(a.id) }))}
                        >
                          <Text style={[styles.animalChipText, active && styles.animalChipTextActive]}>
                            {a.animal_code}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              <Text style={styles.inputLabel}>Morning Milk (Liters)</Text>
              <TextInput
                style={styles.modalInput}
                value={entryForm.morningLiters}
                onChangeText={(v) => setEntryForm((f) => ({ ...f, morningLiters: v }))}
                keyboardType="numeric"
                placeholder="e.g. 8.5"
              />

              <Text style={styles.inputLabel}>Evening Milk (Liters)</Text>
              <TextInput
                style={styles.modalInput}
                value={entryForm.eveningLiters}
                onChangeText={(v) => setEntryForm((f) => ({ ...f, eveningLiters: v }))}
                keyboardType="numeric"
                placeholder="e.g. 7.0"
              />

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.modalInput}
                value={entryForm.entryDate}
                onChangeText={(v) => setEntryForm((f) => ({ ...f, entryDate: v }))}
                placeholder="YYYY-MM-DD"
              />

              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveEntry}>
                <Text style={styles.modalSaveText}>
                  {editingEntryId ? 'Update Entry' : 'Save Entry'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Sale Modal */}
      <Modal
        visible={saleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSaleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Milk Sale</Text>
              <TouchableOpacity onPress={() => setSaleModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Buyer / Vendor Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={saleForm.buyerName}
                onChangeText={(v) => setSaleForm((f) => ({ ...f, buyerName: v }))}
                placeholder="e.g. City Dairy / Nestlé Center"
              />

              <Text style={styles.inputLabel}>Liters Sold *</Text>
              <TextInput
                style={styles.modalInput}
                value={saleForm.litersSold}
                onChangeText={(v) => setSaleForm((f) => ({ ...f, litersSold: v }))}
                keyboardType="numeric"
                placeholder="e.g. 50"
              />

              <Text style={styles.inputLabel}>Price Per Liter (Rs.) *</Text>
              <TextInput
                style={styles.modalInput}
                value={saleForm.pricePerLiter}
                onChangeText={(v) => setSaleForm((f) => ({ ...f, pricePerLiter: v }))}
                keyboardType="numeric"
                placeholder="180"
              />

              <View style={styles.calcBox}>
                <Text style={styles.calcLabel}>Total Expected Revenue:</Text>
                <Text style={styles.calcVal}>Rs. {calculatedTotal.toLocaleString()}</Text>
              </View>

              <Text style={styles.inputLabel}>Sale Date</Text>
              <TextInput
                style={styles.modalInput}
                value={saleForm.saleDate}
                onChangeText={(v) => setSaleForm((f) => ({ ...f, saleDate: v }))}
                placeholder="YYYY-MM-DD"
              />

              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveSale}>
                <Text style={styles.modalSaveText}>Record Sale</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  topBar: {
    backgroundColor: '#2F8C83',
    paddingTop: 42,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  topAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: { flexDirection: 'row', gap: 8, padding: 14, paddingBottom: 6 },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  tabActive: { backgroundColor: '#2F8C83', borderColor: '#2F8C83' },
  tabText: { fontWeight: '800', fontSize: 12, color: '#475467' },
  tabTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  kpiCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#fff',
    padding: 14,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiLabel: { fontSize: 11, color: '#667085', fontWeight: '800' },
  kpiValue: { marginTop: 4, fontSize: 18, fontWeight: '900', color: '#101828' },
  kpiTiny: { marginTop: 2, fontSize: 10, color: '#98A2B3', fontWeight: '600' },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 16,
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartTitle: { fontSize: 15, fontWeight: '900', color: '#101828' },
  chartSub: { fontSize: 11, color: '#667085', fontWeight: '600', marginTop: 1 },
  emptyTrend: { height: 120, alignItems: 'center', justifyContent: 'center' },
  emptyTrendText: { color: '#98A2B3', fontSize: 12, textAlign: 'center' },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 16,
  },
  summaryTitle: { fontSize: 14, fontWeight: '900', color: '#101828', marginBottom: 12 },
  summaryStats: { flexDirection: 'row', gap: 16 },
  summaryCol: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  summaryLabel: { fontSize: 11, color: '#667085', fontWeight: '700' },
  summaryVal: { fontSize: 16, fontWeight: '900', color: '#101828', marginTop: 4 },
  actionCard: {
    margin: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 14,
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionTitle: { fontWeight: '900', color: '#101828', fontSize: 14 },
  actionSub: { marginTop: 2, color: '#475467', fontWeight: '600', fontSize: 11 },
  actionBtn: {
    backgroundColor: '#2F8C83',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  listTitle: { paddingHorizontal: 16, paddingTop: 4, fontWeight: '900', color: '#101828', fontSize: 14 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontWeight: '900', color: '#101828', fontSize: 14 },
  rowSub: { marginTop: 2, color: '#667085', fontWeight: '600', fontSize: 12 },
  rowTotal: { fontWeight: '900', color: '#2F8C83', fontSize: 14 },
  salesAmount: { fontWeight: '900', color: '#4FA765', fontSize: 14 },
  iconBtn: { padding: 6 },
  salesHeader: {
    margin: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  salesSmall: { color: '#667085', fontWeight: '800', fontSize: 11 },
  salesBig: { marginTop: 4, fontSize: 20, fontWeight: '900', color: '#101828' },
  salesTiny: { marginTop: 2, color: '#667085', fontWeight: '700', fontSize: 11 },
  newSaleBtn: {
    backgroundColor: '#2F8C83',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newSaleBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  compareTitle: { fontSize: 15, fontWeight: '900', color: '#101828' },
  compareSub: { fontSize: 12, color: '#667085', fontWeight: '600', marginTop: 2, marginBottom: 14 },
  compareCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 12,
    marginBottom: 10,
  },
  compareHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rankNum: { fontSize: 11, fontWeight: '800', color: '#2F8C83' },
  compareAnimal: { fontSize: 14, fontWeight: '900', color: '#101828' },
  compareAvg: { fontSize: 13, fontWeight: '900', color: '#2F8C83' },
  yieldTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#F2F4F7',
    marginTop: 8,
    overflow: 'hidden',
  },
  yieldBar: { height: 6, borderRadius: 999, backgroundColor: '#2F8C83' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  modalHeader: {
    backgroundColor: '#2F8C83',
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
  animalChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  animalChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F2F4F7' },
  animalChipActive: { backgroundColor: '#2F8C83' },
  animalChipText: { fontSize: 11, fontWeight: '800', color: '#344054' },
  animalChipTextActive: { color: '#fff' },
  calcBox: {
    backgroundColor: '#E6F4F2',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: { fontSize: 12, color: '#2F8C83', fontWeight: '700' },
  calcVal: { fontSize: 14, color: '#2F8C83', fontWeight: '900' },
  modalSaveBtn: {
    backgroundColor: '#2F8C83',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  modalSaveText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#344054', marginTop: 10 },
  emptySub: { fontSize: 12, color: '#667085', marginTop: 2 },
});
