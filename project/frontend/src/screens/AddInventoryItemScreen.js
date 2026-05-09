import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

export const AddInventoryItemScreen = ({ navigation }) => {
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    itemName: '',
    category: 'Fodder',
    quantity: '',
    unit: 'kg',
    minStockLevel: '',
  });

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.post('/inventory', {
        ...form,
        quantity: form.quantity ? Number(form.quantity) : 0,
        minStockLevel: form.minStockLevel ? Number(form.minStockLevel) : 0,
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Add Inventory Item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={styles.sectionTitle}>Item Details</Text>
        <Field label="Item Name" value={form.itemName} onChangeText={(v) => setForm((f) => ({ ...f, itemName: v }))} placeholder="Enter item name" />
        <Field label="Category" value={form.category} onChangeText={(v) => setForm((f) => ({ ...f, category: v }))} placeholder="Fodder / Medicines / Equipment" />
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Quantity" value={String(form.quantity)} onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))} placeholder="100" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Unit" value={form.unit} onChangeText={(v) => setForm((f) => ({ ...f, unit: v }))} placeholder="kg, liters, units" />
          </View>
        </View>
        <Field label="Minimum Stock Level" value={String(form.minStockLevel)} onChangeText={(v) => setForm((f) => ({ ...f, minStockLevel: v }))} placeholder="50" keyboardType="numeric" />
      </ScrollView>

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={save} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Add to Inventory'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const Field = ({ label, ...props }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { backgroundColor: '#2C4D5F', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  sectionTitle: { fontWeight: '900', color: '#101828', marginBottom: 10, marginTop: 6 },
  label: { fontSize: 12, color: '#667085', fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: '#F2F4F7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  row2: { flexDirection: 'row', gap: 12 },
  saveBtn: { position: 'absolute', left: 16, right: 16, bottom: 18, backgroundColor: '#4FA765', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});

