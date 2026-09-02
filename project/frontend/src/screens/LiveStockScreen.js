import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import apiClient from '../services/apiClient';

const CATEGORIES = ['All', 'Cow', 'Buffalo', 'Sheep', 'Goat'];

export const LiveStockScreen = ({ navigation }) => {
  const [category, setCategory] = React.useState('All');
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [animals, setAnimals] = React.useState([]);

  // Selected animal detail modal
  const [selectedAnimal, setSelectedAnimal] = React.useState(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [showQrModal, setShowQrModal] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(
        `/animals?category=${encodeURIComponent(category)}&q=${encodeURIComponent(q)}`
      );
      setAnimals(data || []);
    } catch (e) {
      console.log('Error loading animals', e);
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

  const handleDeleteAnimal = (animal) => {
    Alert.alert(
      'Delete Animal',
      `Are you sure you want to delete ${animal.animal_code}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/animals/${animal.id}`);
              setShowDetailModal(false);
              load();
            } catch (err) {
              Alert.alert('Error', err?.response?.data?.error || 'Failed to delete animal');
            }
          },
        },
      ]
    );
  };

  const handleEditAnimal = (animal) => {
    setShowDetailModal(false);
    navigation.navigate('AddAnimal', { animal });
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Live Stock</Text>
        </TouchableOpacity>
        <Text style={styles.topCount}>{animals.length} animals</Text>
      </View>

      {/* Search Row */}
      <View style={styles.searchRow}>
        <MaterialIcons name="search" size={20} color="#98A2B3" />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search by ID or breed..."
          style={styles.searchInput}
          placeholderTextColor="#98A2B3"
        />
        {q ? (
          <TouchableOpacity onPress={() => setQ('')}>
            <MaterialIcons name="close" size={18} color="#98A2B3" />
          </TouchableOpacity>
        ) : (
          <MaterialIcons name="tune" size={20} color="#98A2B3" />
        )}
      </View>

      {/* Category Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
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
        </ScrollView>
      </View>

      {/* Livestock List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4FA765" />
        </View>
      ) : animals.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="pets" size={48} color="#D0D5DD" />
          <Text style={styles.emptyTitle}>No animals found</Text>
          <Text style={styles.emptySub}>Add animals to manage your livestock easily</Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => navigation.navigate('AddAnimal')}
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.addFirstBtnText}>Add Animal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={animals}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedAnimal(item);
                setShowDetailModal(true);
              }}
            >
              <View style={styles.rowIcon}>
                <MaterialIcons name="pets" size={20} color="#4FA765" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.rowTitle}>{item.animal_code}</Text>
                  <Text style={styles.categoryBadge}>{item.category || 'Cow'}</Text>
                </View>
                <Text style={styles.rowSub}>
                  {item.breed || 'Unknown Breed'} • {item.age_years ?? '-'} yrs • {item.gender || 'Unknown'}
                </Text>
              </View>
              <View style={[styles.badge, badgeStyle(item.health_status)]}>
                <Text style={styles.badgeText}>{item.health_status}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddAnimal')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Animal Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailTitle}>{selectedAnimal?.animal_code}</Text>
                <Text style={styles.detailSub}>
                  {selectedAnimal?.category} • {selectedAnimal?.breed || 'Standard'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color="#667085" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360, padding: 16 }}>
              <View style={styles.infoGrid}>
                <DetailRow label="Health Status" value={selectedAnimal?.health_status} />
                <DetailRow label="Gender" value={selectedAnimal?.gender} />
                <DetailRow label="Age" value={`${selectedAnimal?.age_years || '-'} years`} />
                <DetailRow label="Weight" value={selectedAnimal?.weight_kg ? `${selectedAnimal.weight_kg} kg` : '-'} />
                <DetailRow label="Purchase Date" value={selectedAnimal?.purchase_date ? String(selectedAnimal.purchase_date).slice(0, 10) : '-'} />
                <DetailRow label="Purchase Price" value={selectedAnimal?.purchase_price ? `Rs. ${selectedAnimal.purchase_price}` : '-'} />
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.detailActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#EAF3FF' }]}
                onPress={() => {
                  setShowDetailModal(false);
                  setShowQrModal(true);
                }}
              >
                <MaterialIcons name="qr-code-2" size={18} color="#175CD3" />
                <Text style={[styles.actionBtnText, { color: '#175CD3' }]}>QR Tag</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#E9F5EE' }]}
                onPress={() => selectedAnimal && handleEditAnimal(selectedAnimal)}
              >
                <MaterialIcons name="edit" size={18} color="#4FA765" />
                <Text style={[styles.actionBtnText, { color: '#4FA765' }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#FEE4E2' }]}
                onPress={() => selectedAnimal && handleDeleteAnimal(selectedAnimal)}
              >
                <MaterialIcons name="delete-outline" size={18} color="#D92D20" />
                <Text style={[styles.actionBtnText, { color: '#D92D20' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Tag Modal */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <Text style={styles.qrTitle}>Animal Digital ID</Text>
              <TouchableOpacity onPress={() => setShowQrModal(false)}>
                <MaterialIcons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.qrBody}>
              <Text style={styles.qrAnimalCode}>{selectedAnimal?.animal_code}</Text>
              <Text style={styles.qrAnimalBreed}>
                {selectedAnimal?.category} • {selectedAnimal?.breed}
              </Text>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={JSON.stringify({
                    id: selectedAnimal?.id,
                    code: selectedAnimal?.animal_code,
                    category: selectedAnimal?.category,
                  })}
                  size={170}
                />
              </View>
              <Text style={styles.qrHint}>Scan tag with camera for quick access</Text>

              <TouchableOpacity
                style={styles.qrCloseBtn}
                onPress={() => setShowQrModal(false)}
              >
                <Text style={styles.qrCloseBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRowItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || '—'}</Text>
  </View>
);

function badgeStyle(status) {
  if (status === 'Healthy') return { backgroundColor: '#E9F5EE' };
  if (status === 'Under Treatment') return { backgroundColor: '#FEF0C7' };
  if (status === 'Sick') return { backgroundColor: '#FEE4E2' };
  return { backgroundColor: '#F2F4F7' };
}

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
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  topCount: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700' },
  searchRow: {
    margin: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#101828' },
  chipsContainer: { paddingBottom: 4 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  chipActive: { backgroundColor: '#4FA765', borderColor: '#4FA765' },
  chipText: { fontSize: 12, color: '#475467', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#344054', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#667085', marginTop: 4, textAlign: 'center' },
  addFirstBtn: {
    marginTop: 16,
    backgroundColor: '#4FA765',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addFirstBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E9F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontWeight: '900', color: '#101828', fontSize: 15 },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4FA765',
    backgroundColor: '#E9F5EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rowSub: { marginTop: 3, color: '#667085', fontSize: 12, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#344054' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4FA765',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#4FA765',
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
  detailCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  detailTitle: { fontSize: 18, fontWeight: '900', color: '#101828' },
  detailSub: { fontSize: 12, color: '#667085', fontWeight: '700', marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoGrid: { gap: 10 },
  detailRowItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: { fontSize: 12, color: '#667085', fontWeight: '700' },
  detailValue: { fontSize: 13, color: '#101828', fontWeight: '800' },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: { fontWeight: '800', fontSize: 13 },
  qrCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  qrHeader: {
    backgroundColor: '#4FA765',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qrTitle: { color: '#fff', fontWeight: '900', fontSize: 16 },
  qrBody: { alignItems: 'center', padding: 20 },
  qrAnimalCode: { fontSize: 20, fontWeight: '900', color: '#101828' },
  qrAnimalBreed: { fontSize: 13, color: '#667085', fontWeight: '700', marginTop: 2 },
  qrWrapper: {
    marginVertical: 16,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  qrHint: { fontSize: 11, color: '#98A2B3', fontWeight: '600', marginBottom: 16 },
  qrCloseBtn: {
    width: '100%',
    backgroundColor: '#4FA765',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  qrCloseBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
