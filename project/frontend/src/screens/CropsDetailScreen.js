import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

export const CropsDetailScreen = ({ navigation }) => {
  const [loading, setLoading] = React.useState(true);
  const [crops, setCrops] = React.useState([]);
  const [selectedCrop, setSelectedCrop] = React.useState(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/crops');
      setCrops(data || []);
    } catch (e) {
      console.log('Error loading crops', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const handleDeleteCrop = (crop) => {
    Alert.alert('Delete Crop Record', `Delete "${crop.crop_name}" from farm records?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/crops/${crop.id}`);
            setShowDetailModal(false);
            load();
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.error || 'Failed to delete crop');
          }
        },
      },
    ]);
  };

  const handleEditCrop = (crop) => {
    setShowDetailModal(false);
    navigation.navigate('AddCrop', { crop });
  };

  const cycleStatus = async (crop) => {
    const statuses = ['Growing', 'Ready Soon', 'Harvested'];
    const nextIdx = (statuses.indexOf(crop.status) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];

    try {
      // Optimistic update
      setCrops((prev) =>
        prev.map((c) => (c.id === crop.id ? { ...c, status: nextStatus } : c))
      );
      await apiClient.put(`/crops/${crop.id}`, {
        cropName: crop.crop_name,
        landSize: crop.land_size,
        landUnit: crop.land_unit,
        plantedDate: crop.planted_date,
        expectedHarvestDate: crop.expected_harvest_date,
        status: nextStatus,
      });
    } catch (e) {
      load();
    }
  };

  const totalLand = crops.reduce((acc, it) => acc + Number(it.land_size || 0), 0);
  const readySoonCount = crops.filter((c) => c.status === 'Ready Soon').length;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Crops Detail</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddCrop')}
          style={styles.addBtn}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalLand} Acres</Text>
          <Text style={styles.statLabel}>Cultivated Land</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{crops.length}</Text>
          <Text style={styles.statLabel}>Active Crops</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: '#FEF0C7', borderColor: '#FDB022' }]}>
          <Text style={[styles.statValue, { color: '#B54708' }]}>{readySoonCount}</Text>
          <Text style={styles.statLabel}>Ready Soon</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4FA765" />
        </View>
      ) : crops.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="grass" size={48} color="#D0D5DD" />
          <Text style={styles.emptyTitle}>No crops planted</Text>
          <Text style={styles.emptySub}>Log fodder and cash crops to track yields</Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => navigation.navigate('AddCrop')}
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.addFirstBtnText}>Add Crop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={crops}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const progress =
              item.status === 'Harvested' ? 100 : item.status === 'Ready Soon' ? 90 : 50;
            const progressColor =
              item.status === 'Harvested' ? '#175CD3' : item.status === 'Ready Soon' ? '#E07A16' : '#4FA765';

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedCrop(item);
                  setShowDetailModal(true);
                }}
              >
                <View style={styles.iconBox}>
                  <MaterialIcons name="grass" size={22} color="#4FA765" />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.name}>{item.crop_name}</Text>
                    <TouchableOpacity
                      style={[styles.badge, badgeStyle(item.status)]}
                      onPress={() => cycleStatus(item)}
                    >
                      <Text style={styles.badgeText}>{item.status}</Text>
                      <MaterialIcons name="cached" size={12} color="#344054" style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.sub}>
                    {item.land_size} {item.land_unit} • Planted {String(item.planted_date).slice(0, 10)}
                  </Text>

                  {/* Maturity Progress Bar */}
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%`, backgroundColor: progressColor },
                      ]}
                    />
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>
                      Harvest: {item.expected_harvest_date ? String(item.expected_harvest_date).slice(0, 10) : 'Ongoing'}
                    </Text>
                    <Text style={styles.progressPct}>{progress}% Mature</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Crop Detail Modal */}
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
                <Text style={styles.detailTitle}>{selectedCrop?.crop_name}</Text>
                <Text style={styles.detailSub}>
                  {selectedCrop?.land_size} {selectedCrop?.land_unit}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color="#667085" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 320 }}>
              <View style={styles.infoGrid}>
                <DetailRow label="Crop Name" value={selectedCrop?.crop_name} />
                <DetailRow label="Land Size" value={`${selectedCrop?.land_size} ${selectedCrop?.land_unit}`} />
                <DetailRow label="Planted Date" value={selectedCrop?.planted_date ? String(selectedCrop.planted_date).slice(0, 10) : '-'} />
                <DetailRow label="Expected Harvest" value={selectedCrop?.expected_harvest_date ? String(selectedCrop.expected_harvest_date).slice(0, 10) : 'Not specified'} />
                <DetailRow label="Status" value={selectedCrop?.status} />
              </View>
            </ScrollView>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#EAF3FF' }]}
                onPress={() => selectedCrop && handleEditCrop(selectedCrop)}
              >
                <MaterialIcons name="edit" size={18} color="#175CD3" />
                <Text style={[styles.actionBtnText, { color: '#175CD3' }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#FEE4E2' }]}
                onPress={() => selectedCrop && handleDeleteCrop(selectedCrop)}
              >
                <MaterialIcons name="delete-outline" size={18} color="#D92D20" />
                <Text style={[styles.actionBtnText, { color: '#D92D20' }]}>Delete</Text>
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
  if (status === 'Ready Soon') return { backgroundColor: '#FEF0C7' };
  if (status === 'Harvested') return { backgroundColor: '#EAF3FF' };
  return { backgroundColor: '#E9F5EE' };
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
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 10, padding: 14, paddingBottom: 4 },
  stat: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontWeight: '900', color: '#101828', fontSize: 15 },
  statLabel: { marginTop: 4, fontSize: 11, color: '#667085', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#344054', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#667085', marginTop: 4 },
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
  card: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E9F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontWeight: '900', color: '#101828', fontSize: 15 },
  sub: { color: '#667085', fontWeight: '600', marginTop: 2, fontSize: 12 },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#F2F4F7',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 999 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meta: { color: '#667085', fontWeight: '600', fontSize: 11 },
  progressPct: { fontSize: 11, fontWeight: '800', color: '#344054' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#344054' },
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
  detailSub: { fontSize: 12, color: '#4FA765', fontWeight: '700', marginTop: 2 },
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
});
