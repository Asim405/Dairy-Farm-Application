import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

const TABS = ['Overview', 'Expenses', 'P&L Analytics', 'Labor'];

export const FinanceOperationsScreen = ({ navigation }) => {
  const [tab, setTab] = React.useState('Overview');
  const [loading, setLoading] = React.useState(true);
  const [overview, setOverview] = React.useState({ revenueMonth: 0, expenseMonth: 0, netMonth: 0 });
  const [expenses, setExpenses] = React.useState([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, eRes] = await Promise.all([apiClient.get('/finance/overview'), apiClient.get('/finance/expenses')]);
      setOverview(oRes.data);
      setExpenses(eRes.data || []);
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
          <Text style={styles.topTitle}>Finance & Operations</Text>
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
        <View style={{ padding: 16, gap: 12 }}>
          <Kpi title="Total Revenue" value={`Rs.${overview.revenueMonth}`} tint="#E9F5EE" />
          <Kpi title="Total Expense" value={`Rs.${overview.expenseMonth}`} tint="#FEE4E2" />
          <Kpi title="Net Profit/Loss" value={`Rs.${overview.netMonth}`} tint="#E9F5EE" />
        </View>
      ) : tab === 'Expenses' ? (
        <FlatList
          data={expenses}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <MaterialIcons name="receipt" size={18} color="#E07A16" />
                <View>
                  <Text style={styles.rowTitle}>{item.category}</Text>
                  <Text style={styles.rowSub}>{String(item.expense_date).slice(0, 10)} • {item.description || ''}</Text>
                </View>
              </View>
              <Text style={styles.rowAmount}>Rs.{item.amount}</Text>
            </View>
          )}
        />
      ) : tab === 'P&L Analytics' ? (
        <View style={{ padding: 16 }}>
          <Text style={styles.placeholderTitle}>Monthly Revenue vs Expense</Text>
          <View style={styles.placeholderChart}>
            <Text style={styles.placeholderText}>Chart placeholder (bar + pie in design).</Text>
          </View>
        </View>
      ) : (
        <View style={{ padding: 16 }}>
          <Text style={styles.placeholderTitle}>Staff & Labor Management</Text>
          <Text style={styles.placeholderText}>Open Staff Management from Home to manage employees.</Text>
        </View>
      )}
    </View>
  );
};

const Kpi = ({ title, value, tint }) => (
  <View style={[styles.kpi, { backgroundColor: tint }]}>
    <Text style={styles.kpiTitle}>{title}</Text>
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiTiny}>This month</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { backgroundColor: '#E07A16', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  tabs: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8, flexWrap: 'wrap' },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#F2F4F7' },
  tabActive: { backgroundColor: '#E07A16' },
  tabText: { fontWeight: '800', fontSize: 12, color: '#344054' },
  tabTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  kpi: { borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#EAECF0' },
  kpiTitle: { color: '#667085', fontWeight: '900', fontSize: 12 },
  kpiValue: { marginTop: 8, fontSize: 20, fontWeight: '900', color: '#101828' },
  kpiTiny: { marginTop: 4, color: '#667085', fontWeight: '700', fontSize: 11 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#EAECF0', borderRadius: 12, padding: 12, marginBottom: 10 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowTitle: { fontWeight: '900', color: '#101828' },
  rowSub: { color: '#667085', fontWeight: '700', fontSize: 11, marginTop: 2 },
  rowAmount: { color: '#B42318', fontWeight: '900' },
  placeholderTitle: { fontWeight: '900', color: '#101828' },
  placeholderChart: { marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: '#EAECF0', padding: 14 },
  placeholderText: { color: '#667085', fontWeight: '700' },
});

