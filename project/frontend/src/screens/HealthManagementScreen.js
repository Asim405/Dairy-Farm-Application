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

export const HealthManagementScreen = ({ navigation }) => {
  const [tab, setTab] = React.useState('Vaccinations');
  const [loading, setLoading] = React.useState(true);
  const [vaccinations, setVaccinations] = React.useState([]);
  const [checkups, setCheckups] = React.useState([]);
  const [animals, setAnimals] = React.useState([]);

  // Modals
  const [showVacModal, setShowVacModal] = React.useState(false);
  const [showCheckupModal, setShowCheckupModal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Forms
  const [vacForm, setVacForm] = React.useState({
    animalId: '',
    vaccineName: '',
    lastVaccination: '',
    nextDue: '',
    status: 'Upcoming',
    notes: '',
  });

  const [checkupForm, setCheckupForm] = React.useState({
    animalId: '',
    title: '',
    checkupDate: '',
    status: 'Upcoming',
    notes: '',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, cRes, aRes] = await Promise.all([
        apiClient.get('/health/vaccinations'),
        apiClient.get('/health/checkups'),
        apiClient.get('/animals?category=All'),
      ]);
      setVaccinations(vRes.data || []);
      setCheckups(cRes.data || []);
      setAnimals(aRes.data || []);
    } catch (e) {
      console.log('Error loading health records', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openAddVac = () => {
    setVacForm({
      animalId: animals[0]?.id ? String(animals[0].id) : '',
      vaccineName: '',
      lastVaccination: new Date().toISOString().slice(0, 10),
      nextDue: '',
      status: 'Upcoming',
      notes: '',
    });
    setShowVacModal(true);
  };

  const openAddCheckup = () => {
    setCheckupForm({
      animalId: animals[0]?.id ? String(animals[0].id) : '',
      title: '',
      checkupDate: new Date().toISOString().slice(0, 10),
      status: 'Upcoming',
      notes: '',
    });
    setShowCheckupModal(true);
  };

  const saveVaccination = async () => {
    if (!vacForm.animalId || !vacForm.vaccineName.trim()) {
      Alert.alert('Required Fields', 'Please select an animal and enter the vaccine name');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/health/vaccinations', {
        animalId: Number(vacForm.animalId),
        vaccineName: vacForm.vaccineName.trim(),
        lastVaccination: vacForm.lastVaccination.trim() || null,
        nextDue: vacForm.nextDue.trim() || null,
        status: vacForm.status,
        notes: vacForm.notes.trim() || null,
      });
      setShowVacModal(false);
      load();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save vaccination');
    } finally {
      setSaving(false);
    }
  };

  const saveCheckup = async () => {
    if (!checkupForm.animalId || !checkupForm.title.trim()) {
      Alert.alert('Required Fields', 'Please select an animal and enter check-up purpose');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/health/checkups', {
        animalId: Number(checkupForm.animalId),
        title: checkupForm.title.trim(),
        checkupDate: checkupForm.checkupDate.trim() || new Date().toISOString().slice(0, 10),
        status: checkupForm.status,
        notes: checkupForm.notes.trim() || null,
      });
      setShowCheckupModal(false);
      load();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save checkup');
    } finally {
      setSaving(false);
    }
  };

  const deleteVaccination = (id, title) => {
    Alert.alert('Delete Vaccination', `Delete record "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/health/vaccinations/${id}`);
            load();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete record');
          }
        },
      },
    ]);
  };

  const deleteCheckup = (id, title) => {
    Alert.alert('Delete Check-up', `Delete checkup "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/health/checkups/${id}`);
            load();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete record');
          }
        },
      },
    ]);
  };

  const toggleVaccinationStatus = async (item) => {
    const nextStatus = item.status === 'Done' ? 'Upcoming' : 'Done';
    try {
      await apiClient.put(`/health/vaccinations/${item.id}`, {
        animalId: item.animal_id,
        vaccineName: item.vaccine_name,
        lastVaccination: item.last_vaccination,
        nextDue: item.next_due,
        status: nextStatus,
        notes: item.notes,
      });
      load();
    } catch (e) {
      console.log('Error updating status', e);
    }
  };

  const toggleCheckupStatus = async (item) => {
    const nextStatus = item.status === 'Done' ? 'Upcoming' : 'Done';
    try {
      await apiClient.put(`/health/checkups/${item.id}`, {
        animalId: item.animal_id,
        title: item.title,
        checkupDate: item.checkup_date,
        status: nextStatus,
        notes: item.notes,
      });
      load();
    } catch (e) {
      console.log('Error updating status', e);
    }
  };

  const upcomingCount = (tab === 'Vaccinations' ? vaccinations : checkups).filter(
    (x) => x.status === 'Upcoming'
  ).length;
  const dueNowCount = (tab === 'Vaccinations' ? vaccinations : checkups).filter(
    (x) => x.status === 'Due Now'
  ).length;
  const doneCount = (tab === 'Vaccinations' ? vaccinations : checkups).filter(
    (x) => x.status === 'Done'
  ).length;

  const activeList = tab === 'Vaccinations' ? vaccinations : checkups;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Health Management</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={tab === 'Vaccinations' ? openAddVac : openAddCheckup}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabButton
          title="Vaccinations"
          active={tab === 'Vaccinations'}
          onPress={() => setTab('Vaccinations')}
        />
        <TabButton
          title="Check-ups"
          active={tab === 'Check-ups'}
          onPress={() => setTab('Check-ups')}
        />
      </View>

      {/* Summary KPI row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summarySmall}>Upcoming</Text>
          <Text style={[styles.summaryBig, { color: '#B54708' }]}>{upcomingCount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summarySmall}>Due Now</Text>
          <Text style={[styles.summaryBig, { color: '#D92D20' }]}>{dueNowCount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summarySmall}>Done</Text>
          <Text style={[styles.summaryBig, { color: '#4FA765' }]}>{doneCount}</Text>
        </View>
      </View>

      {/* List / Empty State */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C23B3B" />
        </View>
      ) : activeList.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="health-and-safety" size={54} color="#D0D5DD" />
          <Text style={styles.emptyText}>No {tab.toLowerCase()} recorded yet</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={tab === 'Vaccinations' ? openAddVac : openAddCheckup}
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.emptyBtnText}>
              {tab === 'Vaccinations' ? 'Add Vaccination' : 'Schedule Check-up'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activeList}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialIcons
                  name={tab === 'Vaccinations' ? 'vaccines' : 'medical-services'}
                  size={20}
                  color="#C23B3B"
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.cardTitle}>{item.animal_code}</Text>
                  <TouchableOpacity
                    style={[styles.statusBadge, statusStyle(item.status)]}
                    onPress={() =>
                      tab === 'Vaccinations'
                        ? toggleVaccinationStatus(item)
                        : toggleCheckupStatus(item)
                    }
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                    <MaterialIcons name="cached" size={12} color="#344054" style={{ marginLeft: 3 }} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardSub}>{item.vaccine_name || item.title}</Text>

                <View style={styles.cardMeta}>
                  <Meta
                    label={tab === 'Vaccinations' ? 'Last Given' : 'Checkup Date'}
                    value={
                      item.last_vaccination
                        ? String(item.last_vaccination).slice(0, 10)
                        : item.checkup_date
                        ? String(item.checkup_date).slice(0, 10)
                        : '—'
                    }
                  />
                  {tab === 'Vaccinations' && (
                    <Meta
                      label="Next Due"
                      value={item.next_due ? String(item.next_due).slice(0, 10) : '—'}
                    />
                  )}
                </View>

                {item.notes ? <Text style={styles.notesText}>Note: {item.notes}</Text> : null}
              </View>

              <TouchableOpacity
                onPress={() =>
                  tab === 'Vaccinations'
                    ? deleteVaccination(item.id, item.vaccine_name)
                    : deleteCheckup(item.id, item.title)
                }
                style={styles.cardDeleteBtn}
              >
                <MaterialIcons name="delete-outline" size={18} color="#D92D20" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={tab === 'Vaccinations' ? openAddVac : openAddCheckup}
      >
        <MaterialIcons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Add Vaccination Modal */}
      <Modal
        visible={showVacModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVacModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Vaccination Record</Text>
              <TouchableOpacity onPress={() => setShowVacModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Select Animal *</Text>
              <View style={styles.animalChips}>
                {animals.map((a) => {
                  const active = String(vacForm.animalId) === String(a.id);
                  return (
                    <TouchableOpacity
                      key={a.id}
                      style={[styles.animalChip, active && styles.animalChipActive]}
                      onPress={() => setVacForm((f) => ({ ...f, animalId: String(a.id) }))}
                    >
                      <Text style={[styles.animalChipText, active && styles.animalChipTextActive]}>
                        {a.animal_code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Vaccine Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. FMD / Anthrax / Brucellosis"
                value={vacForm.vaccineName}
                onChangeText={(v) => setVacForm((f) => ({ ...f, vaccineName: v }))}
              />

              <Text style={styles.inputLabel}>Last Vaccination Date</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                value={vacForm.lastVaccination}
                onChangeText={(v) => setVacForm((f) => ({ ...f, lastVaccination: v }))}
              />

              <Text style={styles.inputLabel}>Next Due Date</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                value={vacForm.nextDue}
                onChangeText={(v) => setVacForm((f) => ({ ...f, nextDue: v }))}
              />

              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusChips}>
                {['Upcoming', 'Due Now', 'Done'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.statusChip, vacForm.status === st && styles.statusChipActive]}
                    onPress={() => setVacForm((f) => ({ ...f, status: st }))}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        vacForm.status === st && styles.statusChipTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Dosage or veterinarian notes..."
                value={vacForm.notes}
                onChangeText={(v) => setVacForm((f) => ({ ...f, notes: v }))}
              />

              <TouchableOpacity
                style={[styles.modalSaveBtn, saving && { opacity: 0.7 }]}
                onPress={saveVaccination}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Vaccination</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Schedule Checkup Modal */}
      <Modal
        visible={showCheckupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCheckupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Veterinary Check-up</Text>
              <TouchableOpacity onPress={() => setShowCheckupModal(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Select Animal *</Text>
              <View style={styles.animalChips}>
                {animals.map((a) => {
                  const active = String(checkupForm.animalId) === String(a.id);
                  return (
                    <TouchableOpacity
                      key={a.id}
                      style={[styles.animalChip, active && styles.animalChipActive]}
                      onPress={() => setCheckupForm((f) => ({ ...f, animalId: String(a.id) }))}
                    >
                      <Text style={[styles.animalChipText, active && styles.animalChipTextActive]}>
                        {a.animal_code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Check-up Title / Reason *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Routine Deworming / Udder Exam"
                value={checkupForm.title}
                onChangeText={(v) => setCheckupForm((f) => ({ ...f, title: v }))}
              />

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                value={checkupForm.checkupDate}
                onChangeText={(v) => setCheckupForm((f) => ({ ...f, checkupDate: v }))}
              />

              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusChips}>
                {['Upcoming', 'Due Now', 'Done'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.statusChip, checkupForm.status === st && styles.statusChipActive]}
                    onPress={() => setCheckupForm((f) => ({ ...f, status: st }))}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        checkupForm.status === st && styles.statusChipTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Symptoms or treatment notes..."
                value={checkupForm.notes}
                onChangeText={(v) => setCheckupForm((f) => ({ ...f, notes: v }))}
              />

              <TouchableOpacity
                style={[styles.modalSaveBtn, saving && { opacity: 0.7 }]}
                onPress={saveCheckup}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>Schedule Check-up</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const TabButton = ({ title, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabBtn, active && styles.tabBtnActive]}
    activeOpacity={0.8}
  >
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
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  topBar: {
    backgroundColor: '#C23B3B',
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
  tabs: { flexDirection: 'row', gap: 10, padding: 14, paddingBottom: 6 },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  tabBtnActive: { backgroundColor: '#C23B3B', borderColor: '#C23B3B' },
  tabText: { fontWeight: '800', color: '#475467', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginBottom: 8 },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#fff',
    padding: 12,
  },
  summarySmall: { color: '#667085', fontWeight: '700', fontSize: 11 },
  summaryBig: { marginTop: 4, fontWeight: '900', fontSize: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  emptyText: { color: '#667085', fontWeight: '800', fontSize: 15 },
  emptyBtn: {
    backgroundColor: '#C23B3B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  card: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    alignItems: 'flex-start',
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEE4E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontWeight: '900', color: '#101828', fontSize: 15 },
  cardSub: { color: '#344054', marginTop: 2, fontWeight: '700', fontSize: 13 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaLabel: { fontSize: 10, color: '#667085', fontWeight: '800' },
  metaValue: { fontSize: 12, color: '#101828', fontWeight: '800', marginTop: 1 },
  notesText: { marginTop: 6, fontSize: 11, color: '#667085', fontStyle: 'italic' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: { fontSize: 10, fontWeight: '900', color: '#344054' },
  cardDeleteBtn: { padding: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C23B3B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#C23B3B',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#C23B3B',
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
  animalChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F2F4F7',
  },
  animalChipActive: { backgroundColor: '#C23B3B' },
  animalChipText: { fontSize: 11, fontWeight: '800', color: '#344054' },
  animalChipTextActive: { color: '#fff' },
  statusChips: { flexDirection: 'row', gap: 8 },
  statusChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
  },
  statusChipActive: { backgroundColor: '#C23B3B' },
  statusChipText: { fontSize: 11, fontWeight: '800', color: '#344054' },
  statusChipTextActive: { color: '#fff' },
  modalSaveBtn: {
    backgroundColor: '#C23B3B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  modalSaveText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
