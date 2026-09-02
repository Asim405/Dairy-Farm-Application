import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';
import apiClient from '../services/apiClient';

const CATEGORIES = ['Cow', 'Buffalo', 'Sheep', 'Goat', 'Other'];
const GENDERS = ['Female', 'Male', 'Unknown'];
const HEALTH_STATUSES = ['Healthy', 'Under Treatment', 'Sick'];

export const AddAnimalScreen = ({ navigation, route }) => {
  const isEditing = Boolean(route.params?.animal);
  const existingAnimal = route.params?.animal;

  const [saving, setSaving] = React.useState(false);
  const [qrVisible, setQrVisible] = React.useState(false);
  const [animalId, setAnimalId] = React.useState(existingAnimal?.id || null);

  const [form, setForm] = React.useState({
    animalCode: existingAnimal?.animal_code || '',
    category: existingAnimal?.category || 'Cow',
    breed: existingAnimal?.breed || '',
    ageYears: existingAnimal?.age_years != null ? String(existingAnimal.age_years) : '',
    gender: existingAnimal?.gender || 'Female',
    weightKg: existingAnimal?.weight_kg != null ? String(existingAnimal.weight_kg) : '',
    purchaseDate: existingAnimal?.purchase_date ? String(existingAnimal.purchase_date).slice(0, 10) : '',
    purchasePrice: existingAnimal?.purchase_price != null ? String(existingAnimal.purchase_price) : '',
    healthStatus: existingAnimal?.health_status || 'Healthy',
    photoUrl: existingAnimal?.photo_url || '',
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
    if (!form.animalCode.trim()) {
      Alert.alert('Required Field', 'Please enter an Animal ID (e.g. COW-001)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        animalCode: form.animalCode.trim(),
        category: form.category,
        breed: form.breed.trim() || null,
        ageYears: form.ageYears ? Number(form.ageYears) : null,
        gender: form.gender,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        purchaseDate: form.purchaseDate.trim() || null,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
        healthStatus: form.healthStatus,
        photoUrl: form.photoUrl || null,
      };

      if (isEditing) {
        await apiClient.put(`/animals/${existingAnimal.id}`, payload);
        Alert.alert('Success', 'Animal details updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const { data } = await apiClient.post('/animals', payload);
        setAnimalId(data?.id);
        setQrVisible(true);
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save animal record');
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
          <Text style={styles.topTitle}>{isEditing ? 'Edit Animal' : 'Add New Animal'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Photo Upload Box */}
        <Text style={styles.sectionTitle}>Animal Photo</Text>
        <TouchableOpacity style={styles.photoBox} onPress={pickPhoto} activeOpacity={0.8}>
          <MaterialIcons
            name={form.photoUrl ? 'check-circle' : 'cloud-upload'}
            size={24}
            color={form.photoUrl ? '#4FA765' : '#667085'}
          />
          <Text style={styles.photoText}>
            {form.photoUrl ? 'Photo attached (Tap to change)' : 'Tap to upload photo'}
          </Text>
        </TouchableOpacity>

        {/* Basic Information */}
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Field
          label="Animal ID *"
          value={form.animalCode}
          onChangeText={(v) => setForm((f) => ({ ...f, animalCode: v }))}
          placeholder="e.g. COW-001"
          editable={!isEditing}
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

        <Field
          label="Breed"
          value={form.breed}
          onChangeText={(v) => setForm((f) => ({ ...f, breed: v }))}
          placeholder="e.g. Holstein Friesian / Sahiwal"
        />

        {/* Gender Selector */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.optionRow}>
          {GENDERS.map((g) => {
            const active = form.gender === g;
            return (
              <TouchableOpacity
                key={g}
                onPress={() => setForm((f) => ({ ...f, gender: g }))}
                style={[styles.optionChip, active && styles.optionChipActive]}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{g}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field
              label="Age (Years)"
              value={form.ageYears}
              onChangeText={(v) => setForm((f) => ({ ...f, ageYears: v }))}
              placeholder="3"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Weight (kg)"
              value={form.weightKg}
              onChangeText={(v) => setForm((f) => ({ ...f, weightKg: v }))}
              placeholder="450"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Health Status Selector */}
        <Text style={styles.sectionTitle}>Health & Purchase Details</Text>
        <Text style={styles.label}>Health Status</Text>
        <View style={styles.optionRow}>
          {HEALTH_STATUSES.map((hs) => {
            const active = form.healthStatus === hs;
            return (
              <TouchableOpacity
                key={hs}
                onPress={() => setForm((f) => ({ ...f, healthStatus: hs }))}
                style={[styles.optionChip, active && styles.optionChipActive]}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{hs}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Field
          label="Purchase Date"
          value={form.purchaseDate}
          onChangeText={(v) => setForm((f) => ({ ...f, purchaseDate: v }))}
          placeholder="YYYY-MM-DD"
        />
        <Field
          label="Purchase Price (Rs.)"
          value={form.purchasePrice}
          onChangeText={(v) => setForm((f) => ({ ...f, purchasePrice: v }))}
          placeholder="75000"
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
            <Text style={styles.saveText}>{isEditing ? 'Update Animal' : 'Save Animal'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success QR Modal for New Animal */}
      <Modal
        visible={qrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setQrVisible(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Animal Added Successfully!</Text>
              <TouchableOpacity
                onPress={() => {
                  setQrVisible(false);
                  navigation.goBack();
                }}
              >
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Animal ID: {form.animalCode}</Text>

            <View style={styles.qrBox}>
              <QRCode
                value={JSON.stringify({ animalId: animalId, animalCode: form.animalCode })}
                size={160}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#4FA765' }]}
                onPress={() => {
                  setQrVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Field = ({ label, editable = true, ...props }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && { backgroundColor: '#EAECF0', color: '#667085' }]}
      editable={editable}
      placeholderTextColor="#98A2B3"
      {...props}
    />
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
  sectionTitle: { fontWeight: '900', color: '#101828', marginBottom: 12, marginTop: 14, fontSize: 14 },
  photoBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D0D5DD',
    borderRadius: 14,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
    gap: 6,
  },
  photoText: { color: '#475467', fontWeight: '700', fontSize: 13 },
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
  optionChipActive: { backgroundColor: '#4FA765', borderColor: '#4FA765' },
  optionText: { fontSize: 12, color: '#475467', fontWeight: '700' },
  optionTextActive: { color: '#fff' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  modalHeader: {
    backgroundColor: '#4FA765',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: { color: '#fff', fontWeight: '900', fontSize: 15 },
  modalSub: { paddingHorizontal: 16, paddingTop: 12, color: '#667085', fontWeight: '700' },
  qrBox: { alignItems: 'center', justifyContent: 'center', padding: 18 },
  modalActions: { padding: 16, paddingTop: 0 },
  modalBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
