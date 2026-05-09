import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

export const AddCropScreen = ({ navigation }) => {
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    cropName: '',
    landSize: '',
    landUnit: 'Acre',
    plantedDate: '',
    expectedHarvestDate: '',
    useDurationInstead: false,
    durationDays: '',
    status: 'Growing',
  });

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.post('/crops', {
        ...form,
        landSize: Number(form.landSize),
        durationDays: form.durationDays ? Number(form.durationDays) : null,
        expectedHarvestDate: form.expectedHarvestDate || null,
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
          <Text style={styles.topTitle}>Add New Crop</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={styles.sectionTitle}>Crop Details</Text>
        <Field label="Crop Name" value={form.cropName} onChangeText={(v) => setForm((f) => ({ ...f, cropName: v }))} placeholder="e.g. Wheat, Corn, Rice" />
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Land Dimensions" value={String(form.landSize)} onChangeText={(v) => setForm((f) => ({ ...f, landSize: v }))} placeholder="Enter size" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Unit" value={form.landUnit} onChangeText={(v) => setForm((f) => ({ ...f, landUnit: v }))} placeholder="Acre" />
          </View>
        </View>
        <Field label="Cultivation Date" value={form.plantedDate} onChangeText={(v) => setForm((f) => ({ ...f, plantedDate: v }))} placeholder="YYYY-MM-DD" />
        <Field label="Expected Harvest Date" value={form.expectedHarvestDate} onChangeText={(v) => setForm((f) => ({ ...f, expectedHarvestDate: v }))} placeholder="YYYY-MM-DD" />
      </ScrollView>

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={save} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Add Crop'}</Text>
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
  topBar: { backgroundColor: '#4FA765', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  sectionTitle: { fontWeight: '900', color: '#101828', marginBottom: 10, marginTop: 6 },
  label: { fontSize: 12, color: '#667085', fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: '#F2F4F7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  row2: { flexDirection: 'row', gap: 12 },
  saveBtn: { position: 'absolute', left: 16, right: 16, bottom: 18, backgroundColor: '#4FA765', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});

