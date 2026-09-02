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
import { BarChart, DonutChart } from '../components/Charts';

const TABS = ['Overview', 'Expenses', 'P&L Analytics', 'Labor'];
const EXPENSE_CATEGORIES = ['Feed', 'Labor', 'Medical Bills', 'Electricity', 'Other'];

export const FinanceOperationsScreen = ({ navigation }) => {
  const [tab, setTab] = React.useState('Overview');
  const [loading, setLoading] = React.useState(true);
  const [overview, setOverview] = React.useState({ revenueMonth: 0, expenseMonth: 0, netMonth: 0 });
  const [expenses, setExpenses] = React.useState([]);
  const [plData, setPlData] = React.useState({ revenue: [], expense: [] });
  const [breakdown, setBreakdown] = React.useState([]);

  // Modal
  const [showExpenseModal, setShowExpenseModal] = React.useState(false);
  const [editingExpenseId, setEditingExpenseId] = React.useState(null);
  const [expenseForm, setExpenseForm] = React.useState({
    category: 'Feed',
    amount: '',
    expenseDate: '',
    description: '',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, eRes, plRes, bRes] = await Promise.all([
        apiClient.get('/finance/overview'),
        apiClient.get('/finance/expenses'),
        apiClient.get('/finance/pl?months=6'),
        apiClient.get('/finance/breakdown'),
      ]);
      setOverview(oRes.data || { revenueMonth: 0, expenseMonth: 0, netMonth: 0 });
      setExpenses(eRes.data || []);
      setPlData(plRes.data || { revenue: [], expense: [] });
      setBreakdown(bRes.data || []);
    } catch (e) {
      console.log('Error loading finance data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openAddExpense = (item = null) => {
    if (item) {
      setEditingExpenseId(item.id);
      setExpenseForm({
        category: item.category || 'Feed',
        amount: String(item.amount || ''),
        expenseDate: item.expense_date ? String(item.expense_date).slice(0, 10) : '',
        description: item.description || '',
      });
    } else {
      setEditingExpenseId(null);
      setExpenseForm({
        category: 'Feed',
        amount: '',
        expenseDate: new Date().toISOString().slice(0, 10),
        description: '',
      });
    }
    setShowExpenseModal(true);
  };

  const saveExpense = async () => {
    if (!expenseForm.amount) {
      Alert.alert('Required', 'Please enter an expense amount');
      return;
    }

    try {
      const payload = {
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        expenseDate: expenseForm.expenseDate.trim() || null,
        description: expenseForm.description.trim() || null,
      };

      if (editingExpenseId) {
        await apiClient.put(`/finance/expenses/${editingExpenseId}`, payload);
      } else {
        await apiClient.post('/finance/expenses', payload);
      }
      setShowExpenseModal(false);
      load();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to record expense');
    }
  };

  const deleteExpense = (id, category, amount) => {
    Alert.alert('Delete Expense', `Delete ${category} expense of Rs. ${amount}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/finance/expenses/${id}`);
            load();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete expense');
          }
        },
      },
    ]);
  };

  // Merge Revenue & Expense for Monthly Bar Chart
  const mergedMonthlyData = React.useMemo(() => {
    const map = {};
    (plData.revenue || []).forEach((r) => {
      map[r.month] = { label: r.month, revenue: Number(r.revenue || 0), expense: 0 };
    });
    (plData.expense || []).forEach((e) => {
      if (!map[e.month]) {
        map[e.month] = { label: e.month, revenue: 0, expense: Number(e.expense || 0) };
      } else {
        map[e.month].expense = Number(e.expense || 0);
      }
    });
    return Object.values(map);
  }, [plData]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Finance & Operations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAddBtn} onPress={() => openAddExpense(null)}>
          <MaterialIcons name="add" size={20} color="#fff" />
        </TouchableOpacity>
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
          <ActivityIndicator size="large" color="#E07A16" />
        </View>
      ) : tab === 'Overview' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
          {/* Main Financial KPI Tiles */}
          <Kpi
            title="Total Revenue (This Month)"
            value={`Rs. ${overview.revenueMonth.toLocaleString()}`}
            tint="#E9F5EE"
            textColor="#12B76A"
            icon="trending-up"
          />
          <Kpi
            title="Total Expense (This Month)"
            value={`Rs. ${overview.expenseMonth.toLocaleString()}`}
            tint="#FEE4E2"
            textColor="#D92D20"
            icon="trending-down"
          />
          <Kpi
            title="Net Profit / (Loss)"
            value={`Rs. ${overview.netMonth.toLocaleString()}`}
            tint={overview.netMonth >= 0 ? '#E0F2FE' : '#FEF3F2'}
            textColor={overview.netMonth >= 0 ? '#0284C7' : '#D92D20'}
            icon="account-balance-wallet"
          />

          {/* Quick Expense Breakdown Preview */}
          {breakdown.length > 0 && (
            <View style={styles.cardBox}>
              <Text style={styles.cardBoxTitle}>Expense Categories</Text>
              <DonutChart
                data={breakdown}
                labelKey="category"
                valueKey="total_amount"
                totalLabel="Total Rs."
              />
            </View>
          )}
        </ScrollView>
      ) : tab === 'Expenses' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.expenseActionRow}>
            <View>
              <Text style={styles.expenseSummaryTitle}>Expense Ledger</Text>
              <Text style={styles.expenseSummarySub}>{expenses.length} records logged</Text>
            </View>
            <TouchableOpacity style={styles.addExpenseBtn} onPress={() => openAddExpense(null)}>
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text style={styles.addExpenseBtnText}>Add Expense</Text>
            </TouchableOpacity>
          </View>

          {expenses.length === 0 ? (
            <View style={styles.center}>
              <MaterialIcons name="receipt" size={48} color="#D0D5DD" />
              <Text style={styles.emptyTitle}>No expenses recorded</Text>
              <Text style={styles.emptySub}>Add feed, medical, labor or electricity bills</Text>
            </View>
          ) : (
            <FlatList
              data={expenses}
              keyExtractor={(it) => String(it.id)}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              renderItem={({ item }) => (
                <View style={styles.expenseRow}>
                  <View style={styles.expenseIcon}>
                    <MaterialIcons
                      name={categoryIcon(item.category)}
                      size={20}
                      color="#E07A16"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expenseCat}>{item.category}</Text>
                    <Text style={styles.expenseSub}>
                      {String(item.expense_date).slice(0, 10)} {item.description ? `• ${item.description}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>Rs. {item.amount}</Text>

                  <TouchableOpacity onPress={() => openAddExpense(item)} style={styles.iconBtn}>
                    <MaterialIcons name="edit" size={18} color="#4FA765" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteExpense(item.id, item.category, item.amount)}
                    style={styles.iconBtn}
                  >
                    <MaterialIcons name="delete-outline" size={18} color="#D92D20" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      ) : tab === 'P&L Analytics' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
          {/* Monthly Comparison Bar Chart */}
          <View style={styles.cardBox}>
            <Text style={styles.cardBoxTitle}>Monthly Revenue vs Expenses</Text>
            <Text style={styles.cardBoxSub}>Compare inflows and outflows (Last 6 months)</Text>
            {mergedMonthlyData.length > 0 ? (
              <BarChart
                data={mergedMonthlyData}
                xKey="label"
                yKey="revenue"
                secondaryYKey="expense"
                barColor="#4FA765"
                secondaryColor="#D92D20"
                showLegend={true}
                legend1="Revenue (Green)"
                legend2="Expense (Red)"
                unit=" Rs"
              />
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptySub}>No monthly financial entries available</Text>
              </View>
            )}
          </View>

          {/* Expense Category Distribution */}
          <View style={styles.cardBox}>
            <Text style={styles.cardBoxTitle}>Expense Distribution by Category</Text>
            <DonutChart
              data={breakdown}
              labelKey="category"
              valueKey="total_amount"
              totalLabel="Expenses"
            />
          </View>
        </ScrollView>
      ) : (
        /* Labor Tab */
        <View style={{ flex: 1, padding: 16 }}>
          <View style={styles.laborCard}>
            <MaterialIcons name="people" size={36} color="#6A4A3C" />
            <Text style={styles.laborTitle}>Staff & Labor Management</Text>
            <Text style={styles.laborSub}>
              Manage farm employees, monthly payrolls, and work shifts directly.
            </Text>
            <TouchableOpacity
              style={styles.laborBtn}
              onPress={() => navigation.navigate('StaffManagement')}
            >
              <Text style={styles.laborBtnText}>Open Staff Management</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Add / Edit Expense Modal */}
      <Modal
        visible={showExpenseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExpenseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingExpenseId ? 'Edit Expense Record' : 'Record Farm Expense'}
              </Text>
              <TouchableOpacity onPress={() => setShowExpenseModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Category *</Text>
              <View style={styles.catChips}>
                {EXPENSE_CATEGORIES.map((cat) => {
                  const active = expenseForm.category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catChip, active && styles.catChipActive]}
                      onPress={() => setExpenseForm((f) => ({ ...f, category: cat }))}
                    >
                      <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Amount (Rs.) *</Text>
              <TextInput
                style={styles.modalInput}
                value={expenseForm.amount}
                onChangeText={(v) => setExpenseForm((f) => ({ ...f, amount: v }))}
                keyboardType="numeric"
                placeholder="e.g. 15000"
              />

              <Text style={styles.inputLabel}>Expense Date</Text>
              <TextInput
                style={styles.modalInput}
                value={expenseForm.expenseDate}
                onChangeText={(v) => setExpenseForm((f) => ({ ...f, expenseDate: v }))}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.inputLabel}>Description / Notes</Text>
              <TextInput
                style={styles.modalInput}
                value={expenseForm.description}
                onChangeText={(v) => setExpenseForm((f) => ({ ...f, description: v }))}
                placeholder="e.g. 10 bags of green fodder purchased"
              />

              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveExpense}>
                <Text style={styles.modalSaveText}>
                  {editingExpenseId ? 'Update Expense' : 'Save Expense'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Kpi = ({ title, value, tint, textColor, icon }) => (
  <View style={[styles.kpi, { backgroundColor: tint }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <MaterialIcons name={icon} size={20} color={textColor} />
    </View>
    <Text style={[styles.kpiValue, { color: textColor }]}>{value}</Text>
    <Text style={styles.kpiTiny}>Current billing period</Text>
  </View>
);

function categoryIcon(cat) {
  if (cat === 'Feed') return 'grass';
  if (cat === 'Labor') return 'people';
  if (cat === 'Medical Bills') return 'medical-services';
  if (cat === 'Electricity') return 'bolt';
  return 'receipt';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  topBar: {
    backgroundColor: '#E07A16',
    paddingTop: 42,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  headerAddBtn: {
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
  tabActive: { backgroundColor: '#E07A16', borderColor: '#E07A16' },
  tabText: { fontWeight: '800', fontSize: 12, color: '#475467' },
  tabTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  kpi: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 12,
  },
  kpiTitle: { color: '#475467', fontWeight: '800', fontSize: 12 },
  kpiValue: { marginTop: 6, fontSize: 22, fontWeight: '900' },
  kpiTiny: { marginTop: 4, color: '#667085', fontWeight: '600', fontSize: 11 },
  cardBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 16,
    marginBottom: 14,
  },
  cardBoxTitle: { fontSize: 15, fontWeight: '900', color: '#101828' },
  cardBoxSub: { fontSize: 11, color: '#667085', fontWeight: '600', marginTop: 2, marginBottom: 12 },
  expenseActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  expenseSummaryTitle: { fontSize: 15, fontWeight: '900', color: '#101828' },
  expenseSummarySub: { fontSize: 11, color: '#667085', fontWeight: '600' },
  addExpenseBtn: {
    backgroundColor: '#E07A16',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addExpenseBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  expenseRow: {
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
  expenseIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF3F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseCat: { fontWeight: '900', color: '#101828', fontSize: 14 },
  expenseSub: { color: '#667085', fontWeight: '600', fontSize: 11, marginTop: 2 },
  expenseAmount: { color: '#D92D20', fontWeight: '900', fontSize: 14 },
  iconBtn: { padding: 6 },
  laborCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  laborTitle: { fontSize: 18, fontWeight: '900', color: '#101828' },
  laborSub: { fontSize: 13, color: '#667085', textAlign: 'center', lineHeight: 18 },
  laborBtn: {
    backgroundColor: '#6A4A3C',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  laborBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  modalHeader: {
    backgroundColor: '#E07A16',
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
  catChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F2F4F7' },
  catChipActive: { backgroundColor: '#E07A16' },
  catChipText: { fontSize: 11, fontWeight: '800', color: '#344054' },
  catChipTextActive: { color: '#fff' },
  modalSaveBtn: {
    backgroundColor: '#E07A16',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  modalSaveText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#344054', marginTop: 10 },
  emptySub: { fontSize: 12, color: '#667085', marginTop: 2 },
  emptyChart: { height: 100, alignItems: 'center', justifyContent: 'center' },
});
