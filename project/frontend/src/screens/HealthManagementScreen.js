import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

export const HealthManagementScreen = ({ navigation }) => {
  const [tab, setTab] = React.useState('Vaccinations');
  const [loading, setLoading] = React.useState(true);
  const [vaccinations, setVaccinations] = React.useState([]);
  const [checkups, setCheckups] = React.useState([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, cRes] = await Promise.all([apiClient.get('/health/vaccinations'), apiClient.get('/health/checkups')]);
      setVaccinations(vRes.data || []);
      setCheckups(cRes.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const upcomingCount = (tab === 'Vaccinations' ? vaccinations : checkups).filter((x) => x.status === 'Upcoming').length;
  const dueNowCount = (tab === 'Vaccinations' ? vaccinations : checkups).filter((x) => x.status === 'Due Now').length;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Health Management</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TabButton title="Vaccinations" active={tab === 'Vaccinations'} onPress={() => setTab('Vaccinations')} />
        <TabButton title="Check-ups" active={tab === 'Check-ups'} onPress={() => setTab('Check-ups')} />
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summarySmall}>Upcoming</Text>
          <Text style={styles.summaryBig}>{upcomingCount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summarySmall}>Due Now</Text>
          <Text style={styles.summaryBig}>{dueNowCount}</Text>
        </View>
        <TouchableOpacity style={styles.addMini} onPress={() => {}}>
          <MaterialIcons name="add" size={18} color="#C23B3B" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : tab === 'Check-ups' && checkups.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="favorite-border" size={40} color="#C7CDD6" />
          <Text style={styles.emptyText}>No check-ups scheduled</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => {}}>
            <Text style={styles.emptyBtnText}>Schedule Check-up</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tab === 'Vaccinations' ? vaccinations : checkups}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialIcons name="vaccines" size={18} color="#C23B3B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.animal_code}</Text>
                <Text style={styles.cardSub}>{item.vaccine_name || item.title}</Text>
                <View style={styles.cardMeta}>
                  <Meta label="Last" value={item.last_vaccination ? String(item.last_vaccination).slice(0, 10) : '—'} />
                  <Meta label="Next Due" value={item.next_due ? String(item.next_due).slice(0, 10) : (item.checkup_date ? String(item.checkup_date).slice(0, 10) : '—')} />
                </View>
              </View>
              <View style={[styles.status, statusStyle(item.status)]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const TabButton = ({ title, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
  </TouchableOpacity>
);

const Meta = ({ label, value }) => (
  <View style={{ flex: 1 }}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

function statusStyle(status) {
  if (status === 'Due Now') return { backgroundColor: '#FEE4E2' };
  if (status === 'Done') return { backgroundColor: '#E9F5EE' };
  return { backgroundColor: '#FEF0C7' };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { backgroundColor: '#C23B3B', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  tabs: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 6 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#F2F4F7' },
  tabBtnActive: { backgroundColor: '#C23B3B' },
  tabText: { fontWeight: '800', color: '#344054', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, alignItems: 'center' },
  summaryCard: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#EAECF0', padding: 12 },
  summarySmall: { color: '#667085', fontWeight: '700', fontSize: 11 },
  summaryBig: { marginTop: 4, fontWeight: '900', fontSize: 18 },
  addMini: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEE4E2', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { color: '#667085', fontWeight: '800' },
  emptyBtn: { backgroundColor: '#4FA765', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '900' },
  card: { flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#EAECF0', borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: '#fff' },
  cardIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEE4E2', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '900', color: '#101828' },
  cardSub: { color: '#667085', marginTop: 2, fontWeight: '700', fontSize: 12 },
  cardMeta: { flexDirection: 'row', gap: 10, marginTop: 8 },
  metaLabel: { fontSize: 10, color: '#667085', fontWeight: '800' },
  metaValue: { fontSize: 11, color: '#101828', fontWeight: '800', marginTop: 2 },
  status: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '900', color: '#344054' },
});

