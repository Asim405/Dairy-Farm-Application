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

const UNITS = ['Acre', 'Marla', 'Kanal', 'Hectare'];
const STATUSES = ['Growing', 'Ready Soon', 'Harvested'];

export const AddCropScreen = ({ navigation, route }) => {
  const isEditing = Boolean(route.params?.crop);
  const existingCrop = route.params?.crop;

  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    cropName: existingCrop?.crop_name || '',
    landSize: existingCrop?.land_size != null ? String(existingCrop.land_size) : '',
    landUnit: existingCrop?.land_unit || 'Acre',
    plantedDate: existingCrop?.planted_date ? String(existingCrop.planted_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    expectedHarvestDate: existingCrop?.expected_harvest_date ? String(existingCrop.expected_harvest_date).slice(0, 10) : '',
    status: existingCrop?.status || 'Growing',
  });

  const save = async () => {
    if (!form.cropName.trim() || !form.landSize) {
      Alert.alert('Required Fields', 'Please enter crop name and land size');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        cropName: form.cropName.trim(),
        landSize: Number(form.landSize),
        landUnit: form.landUnit,
        plantedDate: form.plantedDate.trim() || new Date().toISOString().slice(0, 10),
        expectedHarvestDate: form.expectedHarvestDate.trim() || null,
        status: form.status,
      };

      if (isEditing) {
        await apiClient.put(`/crops/${existingCrop.id}`, payload);
        Alert.alert('Success', 'Crop record updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await apiClient.post('/crops', payload);
        Alert.alert('Success', 'Crop planted record added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save crop');
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
          <Text style={styles.topTitle}>{isEditing ? 'Edit Crop' : 'Add New Crop'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={styles.sectionTitle}>Crop Details</Text>
        <Field
          label="Crop Name *"
          value={form.cropName}
          onChangeText={(v) => setForm((f) => ({ ...f, cropName: v }))}
          placeholder="e.g. Alfalfa (Lucerne) / Corn / Wheat / Berseem"
        />

        <View style={styles.row2}>
          <View style={{ flex: 1.2 }}>
            <Field
              label="Land Size *"
              value={form.landSize}
              onChangeText={(v) => setForm((f) => ({ ...f, landSize: v }))}
              placeholder="e.g. 5"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Land Unit</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {UNITS.map((u) => {
                const active = form.landUnit === u;
                return (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setForm((f) => ({ ...f, landUnit: u }))}
                    style={[styles.unitChip, active && styles.unitChipActive]}
                  >
                    <Text style={[styles.unitText, active && styles.unitTextActive]}>{u}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Planting & Harvest Schedule</Text>
        <Field
          label="Planted Date *"
          value={form.plantedDate}
          onChangeText={(v) => setForm((f) => ({ ...f, plantedDate: v }))}
          placeholder="YYYY-MM-DD"
        />
        <Field
          label="Expected Harvest Date"
          value={form.expectedHarvestDate}
          onChangeText={(v) => setForm((f) => ({ ...f, expectedHarvestDate: v }))}
          placeholder="YYYY-MM-DD"
        />

        {/* Status Selector */}
        <Text style={styles.label}>Current Growth Status</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((st) => {
            const active = form.status === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setForm((f) => ({ ...f, status: st }))}
                style={[styles.statusChip, active && styles.statusChipActive]}
              >
                <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
            <Text style={styles.saveText}>{isEditing ? 'Update Crop' : 'Save Crop Record'}</Text>
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
    backgroundColor: '#4FA765',
    paddingTop: 42,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  sectionTitle: { fontWeight: '900', color: '#101828', marginBottom: 12, marginTop: 10, fontSize: 14 },
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
  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F2F4F7',
  },
  unitChipActive: { backgroundColor: '#4FA765' },
  unitText: { fontSize: 11, fontWeight: '800', color: '#344054' },
  unitTextActive: { color: '#fff' },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 14 },
  statusChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
    alignItems: 'center',
  },
  statusChipActive: { backgroundColor: '#4FA765', borderColor: '#4FA765' },
  statusChipText: { fontSize: 12, fontWeight: '800', color: '#475467' },
  statusChipTextActive: { color: '#fff' },
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
    backgroundColor: '#4FA765',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#4FA765',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  saveText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
