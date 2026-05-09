import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';

export const AddStaffScreen = ({ navigation }) => {
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: '',
    rolePosition: '',
    phoneNumber: '',
    email: '',
    address: '',
    joiningDate: '',
    monthlySalary: '',
    shift: 'Flexible',
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
      await apiClient.post('/staff', {
        ...form,
        monthlySalary: form.monthlySalary ? Number(form.monthlySalary) : 0,
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
          <Text style={styles.topTitle}>Add New Staff</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={styles.sectionTitle}>Staff Photo (Optional)</Text>
        <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
          <MaterialIcons name="cloud-upload" size={20} color="#667085" />
          <Text style={styles.photoText}>Upload Photo</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Field label="Full Name" value={form.fullName} onChangeText={(v) => setForm((f) => ({ ...f, fullName: v }))} placeholder="Enter full name" />
        <Field label="Role/Position" value={form.rolePosition} onChangeText={(v) => setForm((f) => ({ ...f, rolePosition: v }))} placeholder="Select role" />
        <Field label="Phone Number" value={form.phoneNumber} onChangeText={(v) => setForm((f) => ({ ...f, phoneNumber: v }))} placeholder="+92 ..." keyboardType="phone-pad" />
        <Field label="Email (Optional)" value={form.email} onChangeText={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="email@example.com" autoCapitalize="none" />
        <Field label="Address" value={form.address} onChangeText={(v) => setForm((f) => ({ ...f, address: v }))} placeholder="Enter address" multiline />

        <Text style={styles.sectionTitle}>Employment Details</Text>
        <Field label="Joining Date" value={form.joiningDate} onChangeText={(v) => setForm((f) => ({ ...f, joiningDate: v }))} placeholder="YYYY-MM-DD" />
        <Field label="Monthly Salary (Rs.)" value={String(form.monthlySalary)} onChangeText={(v) => setForm((f) => ({ ...f, monthlySalary: v }))} placeholder="15000" keyboardType="numeric" />
        <Field label="Shift" value={form.shift} onChangeText={(v) => setForm((f) => ({ ...f, shift: v }))} placeholder="Morning / Evening / Morning & Evening" />
      </ScrollView>

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={save} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Add Staff Member'}</Text>
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
  topBar: { backgroundColor: '#6A4A3C', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  sectionTitle: { fontWeight: '900', color: '#101828', marginBottom: 10, marginTop: 6 },
  photoBox: { borderWidth: 1, borderColor: '#EAECF0', borderRadius: 12, height: 84, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F4F7', marginBottom: 14, gap: 6 },
  photoText: { color: '#667085', fontWeight: '700' },
  label: { fontSize: 12, color: '#667085', fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: '#F2F4F7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  saveBtn: { position: 'absolute', left: 16, right: 16, bottom: 18, backgroundColor: '#4FA765', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});

