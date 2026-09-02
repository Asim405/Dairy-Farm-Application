import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

const CATEGORIES = ['Fodder', 'Medicines', 'Equipment', 'Other'];
const UNITS = ['kg', 'liters', 'bags', 'doses', 'units'];

export const AddInventoryItemScreen = ({ navigation, route }) => {
  const isEditing = Boolean(route.params?.item);
  const existingItem = route.params?.item;

  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    itemName: existingItem?.item_name || '',
    category: existingItem?.category || 'Fodder',
    quantity: existingItem?.quantity != null ? String(existingItem.quantity) : '',
    unit: existingItem?.unit || 'kg',
    minStockLevel: existingItem?.min_stock_level != null ? String(existingItem.min_stock_level) : '',
  });

  const save = async () => {
    if (!form.itemName.trim()) {
      Alert.alert('Required', 'Please enter an item name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        itemName: form.itemName.trim(),
        category: form.category,
        quantity: form.quantity ? Number(form.quantity) : 0,
        unit: form.unit,
        minStockLevel: form.minStockLevel ? Number(form.minStockLevel) : 0,
      };

      if (isEditing) {
        await apiClient.put(`/inventory/${existingItem.id}`, payload);
        Alert.alert('Success', 'Inventory item updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await apiClient.post('/inventory', payload);
        Alert.alert('Success', 'Inventory item added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save inventory item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>{isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={styles.sectionTitle}>Item Details</Text>
        <Field
          label="Item Name *"
          value={form.itemName}
          onChangeText={(v) => setForm((f) => ({ ...f, itemName: v }))}
          placeholder="e.g. Silage Fodder / Calcium Injection"
        />

        {/* Category Selector */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.optionRow}>
          {CATEGORIES.map((cat) => {
            const active = form.category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setForm((f) => ({ ...f, category: cat }))}
                style={[styles.optionChip, active && styles.optionChipActive]}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.row2}>
          <View style={{ flex: 1.2 }}>
            <Field
              label="Stock Quantity"
              value={form.quantity}
              onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))}
              placeholder="100"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Unit</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {UNITS.map((u) => {
                const active = form.unit === u;
                return (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setForm((f) => ({ ...f, unit: u }))}
                    style={[styles.unitChip, active && styles.unitChipActive]}
                  >
                    <Text style={[styles.unitText, active && styles.unitTextActive]}>{u}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <Field
          label="Minimum Stock Level (Restock Alert)"
          value={form.minStockLevel}
          onChangeText={(v) => setForm((f) => ({ ...f, minStockLevel: v }))}
          placeholder="20"
          keyboardType="numeric"
        />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={save}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>{isEditing ? 'Update Item' : 'Add to Inventory'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Field = ({ label, ...props }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor="#98A2B3" {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  topBar: {
    backgroundColor: '#2C4D5F',
    paddingTop: 42,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  sectionTitle: { fontWeight: '900', color: '#101828', marginBottom: 12, marginTop: 6, fontSize: 14 },
  label: { fontSize: 12, color: '#475467', fontWeight: '800', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#101828',
  },
  row2: { flexDirection: 'row', gap: 12 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  optionChipActive: { backgroundColor: '#2C4D5F', borderColor: '#2C4D5F' },
  optionText: { fontSize: 12, color: '#475467', fontWeight: '700' },
  optionTextActive: { color: '#fff' },
  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F2F4F7',
  },
  unitChipActive: { backgroundColor: '#2C4D5F' },
  unitText: { fontSize: 11, fontWeight: '800', color: '#344054' },
  unitTextActive: { color: '#fff' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
  },
  saveBtn: {
    backgroundColor: '#2C4D5F',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#2C4D5F',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  saveText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
