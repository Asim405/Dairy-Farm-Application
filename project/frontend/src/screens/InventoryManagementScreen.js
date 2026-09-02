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

const CATS = ['All', 'Fodder', 'Medicines', 'Equipment', 'Other'];

export const InventoryManagementScreen = ({ navigation }) => {
  const [category, setCategory] = React.useState('All');
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState([]);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/inventory?category=${encodeURIComponent(category)}`);
      setItems(data || []);
    } catch (e) {
      console.log('Error loading inventory', e);
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

  // Quick Inline Stock Adjust
  const adjustStock = async (item, delta) => {
    try {
      // Optimistic update
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                quantity: Math.max(0, Number(it.quantity) + delta),
                low_stock: Math.max(0, Number(it.quantity) + delta) <= Number(it.min_stock_level),
              }
            : it
        )
      );
      await apiClient.patch(`/inventory/${item.id}/adjust`, { delta });
    } catch (e) {
      load();
    }
  };

  const handleDeleteItem = (item) => {
    Alert.alert('Delete Item', `Delete "${item.item_name}" from inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/inventory/${item.id}`);
            setShowDetailModal(false);
            load();
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.error || 'Failed to delete item');
          }
        },
      },
    ]);
  };

  const handleEditItem = (item) => {
    setShowDetailModal(false);
    navigation.navigate('AddInventoryItem', { item });
  };

  const lowStockCount = items.filter((x) => x.low_stock).length;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Inventory Management</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddInventoryItem')}
          style={styles.addBtn}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Category Chips */}
      <View style={styles.chips}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATS.map((c) => {
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

      {/* Low Stock Warning Alert */}
      {lowStockCount > 0 && (
        <View style={styles.alert}>
          <MaterialIcons name="warning-amber" size={20} color="#B42318" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Low Stock Alert</Text>
            <Text style={styles.alertSub}>{lowStockCount} items below minimum reserve level</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2C4D5F" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="inventory" size={48} color="#D0D5DD" />
          <Text style={styles.emptyTitle}>No inventory items</Text>
          <Text style={styles.emptySub}>Add feed, medical supplies, or farm tools</Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => navigation.navigate('AddInventoryItem')}
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.addFirstBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => {
                setSelectedItem(item);
                setShowDetailModal(true);
              }}
            >
              <View style={styles.iconBox}>
                <MaterialIcons name={inventoryIcon(item.category)} size={20} color="#2C4D5F" />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.name}>{item.item_name}</Text>
                  <View style={[styles.badge, item.low_stock ? styles.badgeLow : styles.badgeOk]}>
                    <Text style={[styles.badgeText, item.low_stock && { color: '#B42318' }]}>
                      {item.low_stock ? 'Low Stock' : 'In Stock'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.sub}>{item.category}</Text>

                <View style={styles.stockRow}>
                  <Text style={styles.value}>
                    {item.quantity} <Text style={styles.unitText}>{item.unit}</Text>
                  </Text>
                  <Text style={styles.meta2}>Min: {item.min_stock_level} {item.unit}</Text>
                </View>

                {/* Inline Quick Adjustment Buttons */}
                <View style={styles.inlineAdjustRow}>
                  <Text style={styles.quickAdjustLabel}>Quick Adjust:</Text>
                  <TouchableOpacity
                    style={styles.adjustBtn}
                    onPress={() => adjustStock(item, -1)}
                  >
                    <MaterialIcons name="remove" size={16} color="#344054" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.adjustBtn}
                    onPress={() => adjustStock(item, 1)}
                  >
                    <MaterialIcons name="add" size={16} color="#344054" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.adjustBtn, { paddingHorizontal: 8 }]}
                    onPress={() => adjustStock(item, 10)}
                  >
                    <Text style={styles.adjustPlusText}>+10</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Item Detail Modal */}
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
                <Text style={styles.detailTitle}>{selectedItem?.item_name}</Text>
                <Text style={styles.detailSub}>{selectedItem?.category}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color="#667085" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 320 }}>
              <View style={styles.infoGrid}>
                <DetailRow label="Category" value={selectedItem?.category} />
                <DetailRow label="Current Quantity" value={`${selectedItem?.quantity} ${selectedItem?.unit}`} />
                <DetailRow label="Minimum Reserve" value={`${selectedItem?.min_stock_level} ${selectedItem?.unit}`} />
                <DetailRow label="Stock Status" value={selectedItem?.low_stock ? 'Needs Restocking' : 'Healthy Stock'} />
                <DetailRow label="Last Updated" value={selectedItem?.last_updated ? String(selectedItem.last_updated).slice(0, 10) : 'Today'} />
              </View>
            </ScrollView>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#EAF3FF' }]}
                onPress={() => selectedItem && handleEditItem(selectedItem)}
              >
                <MaterialIcons name="edit" size={18} color="#175CD3" />
                <Text style={[styles.actionBtnText, { color: '#175CD3' }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#FEE4E2' }]}
                onPress={() => selectedItem && handleDeleteItem(selectedItem)}
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

function inventoryIcon(category) {
  if (category === 'Fodder') return 'grass';
  if (category === 'Medicines') return 'medical-services';
  if (category === 'Equipment') return 'build';
  return 'inventory-2';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  topBar: {
    backgroundColor: '#2C4D5F',
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
  chips: { padding: 14, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  chipActive: { backgroundColor: '#2C4D5F', borderColor: '#2C4D5F' },
  chipText: { fontSize: 12, color: '#475467', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  alert: {
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertTitle: { fontWeight: '900', color: '#B42318', fontSize: 13 },
  alertSub: { color: '#B42318', fontWeight: '600', fontSize: 11, marginTop: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#344054', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#667085', marginTop: 4 },
  addFirstBtn: {
    marginTop: 16,
    backgroundColor: '#2C4D5F',
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
    backgroundColor: '#E6F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontWeight: '900', color: '#101828', fontSize: 15 },
  sub: { color: '#667085', fontWeight: '600', marginTop: 2, fontSize: 12 },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 6,
  },
  value: { fontSize: 16, fontWeight: '900', color: '#101828' },
  unitText: { fontSize: 12, fontWeight: '700', color: '#667085' },
  meta2: { color: '#667085', fontWeight: '600', fontSize: 11 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeLow: { backgroundColor: '#FEE4E2' },
  badgeOk: { backgroundColor: '#E9F5EE' },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#027A48' },
  inlineAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  quickAdjustLabel: { fontSize: 11, color: '#667085', fontWeight: '700' },
  adjustBtn: {
    backgroundColor: '#F2F4F7',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustPlusText: { fontSize: 11, fontWeight: '900', color: '#344054' },
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
  detailSub: { fontSize: 12, color: '#2C4D5F', fontWeight: '700', marginTop: 2 },
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
