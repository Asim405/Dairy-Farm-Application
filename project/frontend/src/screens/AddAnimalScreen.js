import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';
import QRCode from 'react-native-qrcode-svg';

export const AddAnimalScreen = ({ navigation, route }) => {
  const [saving, setSaving] = React.useState(false);
  const [qrVisible, setQrVisible] = React.useState(false);
  const [animalId, setAnimalId] = React.useState(null);

  const [form, setForm] = React.useState({
    animalCode: '',
    category: 'Cow',
    breed: '',
    ageYears: '',
    gender: 'Unknown',
    weightKg: '',
    purchaseDate: '',
    purchasePrice: '',
    healthStatus: 'Healthy',
    photoUrl: '',
  });

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled) {
      setForm((f) => ({ ...f, photoUrl: res.assets?.[0]?.uri || '' }));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        ageYears: form.ageYears ? Number(form.ageYears) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
      };
      const { data } = await apiClient.post('/animals', payload);
      setAnimalId(data?.id);
      setQrVisible(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Add New Animal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={styles.sectionTitle}>Animal Photo</Text>
        <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
          <MaterialIcons name="cloud-upload" size={20} color="#667085" />
          <Text style={styles.photoText}>Tap to upload photo</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Field label="Animal ID" value={form.animalCode} onChangeText={(v) => setForm((f) => ({ ...f, animalCode: v }))} placeholder="e.g. COW-001" />
        <Field label="Category" value={form.category} onChangeText={(v) => setForm((f) => ({ ...f, category: v }))} placeholder="Cow / Buffalo / Sheep / Goat" />
        <Field label="Breed" value={form.breed} onChangeText={(v) => setForm((f) => ({ ...f, breed: v }))} placeholder="e.g. Holstein" />
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Age (years)" value={String(form.ageYears)} onChangeText={(v) => setForm((f) => ({ ...f, ageYears: v }))} placeholder="3" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Gender" value={form.gender} onChangeText={(v) => setForm((f) => ({ ...f, gender: v }))} placeholder="Male / Female" />
          </View>
        </View>
        <Field label="Weight (kg)" value={String(form.weightKg)} onChangeText={(v) => setForm((f) => ({ ...f, weightKg: v }))} placeholder="450" keyboardType="numeric" />

        <Text style={styles.sectionTitle}>Purchase Details</Text>
        <Field label="Purchase Date" value={form.purchaseDate} onChangeText={(v) => setForm((f) => ({ ...f, purchaseDate: v }))} placeholder="YYYY-MM-DD" />
        <Field label="Purchase Price" value={String(form.purchasePrice)} onChangeText={(v) => setForm((f) => ({ ...f, purchasePrice: v }))} placeholder="50000" keyboardType="numeric" />
        <Field label="Health Status" value={form.healthStatus} onChangeText={(v) => setForm((f) => ({ ...f, healthStatus: v }))} placeholder="Healthy / Under Treatment / Sick" />
      </ScrollView>

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={save} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Animal'}</Text>
      </TouchableOpacity>

      <Modal visible={qrVisible} transparent animationType="fade" onRequestClose={() => setQrVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>QR Code Generated</Text>
              <TouchableOpacity onPress={() => setQrVisible(false)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Animal ID: {form.animalCode || '—'}</Text>

            <View style={styles.qrBox}>
              <QRCode value={JSON.stringify({ animalId: animalId, animalCode: form.animalCode })} size={180} />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#4FA765' }]} onPress={() => setQrVisible(false)}>
                <Text style={styles.modalBtnText}>Print Tag</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#6A4A3C' }]} onPress={() => setQrVisible(false)}>
                <Text style={styles.modalBtnText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  photoBox: {
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 12,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F7',
    marginBottom: 14,
    gap: 6,
  },
  photoText: { color: '#667085', fontWeight: '700' },
  label: { fontSize: 12, color: '#667085', fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: '#F2F4F7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  row2: { flexDirection: 'row', gap: 12 },
  saveBtn: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: '#4FA765',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  modalHeader: { backgroundColor: '#4FA765', padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: '#fff', fontWeight: '900' },
  modalSub: { paddingHorizontal: 14, paddingTop: 10, color: '#667085', fontWeight: '700' },
  qrBox: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalActions: { flexDirection: 'row', gap: 10, padding: 14, paddingTop: 0 },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '900' },
});

