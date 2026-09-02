import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';
import { LineTrendChart, BarChart, DonutChart } from '../components/Charts';

export const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [data, setData] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      const res = await apiClient.get('/reports/dashboard');
      setData(res.data);
    } catch (e) {
      console.log('Error loading reports dashboard', e);
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

  // Merge Revenue & Expense for Monthly Bar Chart
  const mergedMonthlyData = React.useMemo(() => {
    if (!data?.monthlyRevenue && !data?.monthlyExpenses) return [];
    const map = {};
    (data?.monthlyRevenue || []).forEach((r) => {
      map[r.month] = { label: r.month, revenue: Number(r.revenue || 0), expense: 0 };
    });
    (data?.monthlyExpenses || []).forEach((e) => {
      if (!map[e.month]) {
        map[e.month] = { label: e.month, revenue: 0, expense: Number(e.expense || 0) };
      } else {
        map[e.month].expense = Number(e.expense || 0);
      }
    });
    return Object.values(map);
  }, [data]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <MaterialIcons name="bar-chart" size={24} color="#fff" />
          <Text style={styles.topTitle}>Analytics & Reports</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <MaterialIcons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4FA765" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4FA765']} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Farm KPI Highlights */}
          <Text style={styles.sectionHeading}>Farm Performance Overview</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiTile}>
              <Text style={styles.kpiTileLabel}>Total Livestock</Text>
              <Text style={[styles.kpiTileValue, { color: '#4FA765' }]}>
                {data?.animalsByCategory?.reduce((acc, c) => acc + Number(c.count), 0) || 0}
              </Text>
              <Text style={styles.kpiTileSub}>Animals registered</Text>
            </View>

            <View style={styles.kpiTile}>
              <Text style={styles.kpiTileLabel}>Active Staff</Text>
              <Text style={[styles.kpiTileValue, { color: '#6A4A3C' }]}>
                {data?.staff?.total_staff || 0}
              </Text>
              <Text style={styles.kpiTileSub}>Payroll: Rs.{Number(data?.staff?.total_payroll || 0).toLocaleString()}</Text>
            </View>
          </View>

          {/* 1. Production Trend Chart */}
          <View style={styles.reportCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>7-Day Milk Production (Liters)</Text>
                <Text style={styles.cardSub}>Daily herd yield trend</Text>
              </View>
              <View style={[styles.cardTag, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.cardTagText, { color: '#0284C7' }]}>Milk Yield</Text>
              </View>
            </View>

            {data?.productionTrend?.length > 0 ? (
              <LineTrendChart data={data.productionTrend} yKey="total_liters" xKey="day_name" unit="L" />
            ) : (
              <View style={styles.emptyNotice}>
                <Text style={styles.emptyNoticeText}>No daily production entries recorded yet</Text>
              </View>
            )}
          </View>

          {/* 2. Monthly Revenue vs Expense Chart */}
          <View style={styles.reportCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>P&L Financial Performance</Text>
                <Text style={styles.cardSub}>Monthly Revenue vs Expenses</Text>
              </View>
              <View style={[styles.cardTag, { backgroundColor: '#E9F5EE' }]}>
                <Text style={[styles.cardTagText, { color: '#4FA765' }]}>Finances</Text>
              </View>
            </View>

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
              <View style={styles.emptyNotice}>
                <Text style={styles.emptyNoticeText}>No monthly financial records logged</Text>
              </View>
            )}
          </View>

          {/* 3. Livestock Distribution Donut */}
          <View style={styles.reportCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Livestock Herd Distribution</Text>
                <Text style={styles.cardSub}>Breakdown by animal species</Text>
              </View>
              <MaterialIcons name="pie-chart" size={20} color="#4FA765" />
            </View>

            {data?.animalsByCategory?.length > 0 ? (
              <DonutChart
                data={data.animalsByCategory}
                labelKey="category"
                valueKey="count"
                totalLabel="Animals"
              />
            ) : (
              <View style={styles.emptyNotice}>
                <Text style={styles.emptyNoticeText}>No animals recorded</Text>
              </View>
            )}
          </View>

          {/* 4. Expense Breakdown Donut */}
          {data?.expenseBreakdown?.length > 0 && (
            <View style={styles.reportCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Farm Expense Breakdown</Text>
                  <Text style={styles.cardSub}>Spending by cost category</Text>
                </View>
                <MaterialIcons name="donut-large" size={20} color="#E07A16" />
              </View>

              <DonutChart
                data={data.expenseBreakdown}
                labelKey="category"
                valueKey="total_amount"
                totalLabel="Expenses"
              />
            </View>
          )}

          {/* 5. Top Milk Producers */}
          {data?.topAnimals?.length > 0 && (
            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>Top Milk Yielding Animals</Text>
              <Text style={[styles.cardSub, { marginBottom: 12 }]}>Highest performing cows & buffaloes</Text>

              {data.topAnimals.map((animal, idx) => (
                <View key={idx} style={styles.topAnimalRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topAnimalCode}>{animal.animal_code}</Text>
                    <Text style={styles.topAnimalBreed}>{animal.category} • {animal.breed || 'Standard'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.topAnimalYield}>{Number(animal.total_liters).toFixed(1)} L</Text>
                    <Text style={styles.topAnimalAvg}>Avg {Number(animal.avg_liters || 0).toFixed(1)} L/entry</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  topBar: {
    backgroundColor: '#4FA765',
    paddingTop: 42,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  refreshBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHeading: { fontSize: 15, fontWeight: '900', color: '#101828', marginBottom: 10, marginTop: 4 },
  kpiGrid: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  kpiTile: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 14,
  },
  kpiTileLabel: { fontSize: 11, color: '#667085', fontWeight: '800' },
  kpiTileValue: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  kpiTileSub: { fontSize: 10, color: '#98A2B3', fontWeight: '600', marginTop: 2 },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#101828' },
  cardSub: { fontSize: 11, color: '#667085', fontWeight: '600', marginTop: 2 },
  cardTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cardTagText: { fontSize: 10, fontWeight: '800' },
  emptyNotice: { height: 100, alignItems: 'center', justifyContent: 'center' },
  emptyNoticeText: { color: '#98A2B3', fontSize: 12 },
  topAnimalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
    gap: 10,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E9F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 11, fontWeight: '900', color: '#4FA765' },
  topAnimalCode: { fontSize: 14, fontWeight: '900', color: '#101828' },
  topAnimalBreed: { fontSize: 11, color: '#667085', fontWeight: '600', marginTop: 1 },
  topAnimalYield: { fontSize: 14, fontWeight: '900', color: '#2F8C83' },
  topAnimalAvg: { fontSize: 10, color: '#98A2B3', fontWeight: '600' },
});
