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
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';

const ROLES = ['Milker', 'Feeder', 'Vet Assistant', 'General Farm Worker', 'Manager'];
const SHIFTS = ['Morning', 'Evening', 'Morning & Evening', 'Night', 'Flexible'];

export const AddStaffScreen = ({ navigation, route }) => {
  const isEditing = Boolean(route.params?.staff);
  const existingStaff = route.params?.staff;

  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: existingStaff?.full_name || '',
    rolePosition: existingStaff?.role_position || 'Milker',
    phoneNumber: existingStaff?.phone_number || '',
    email: existingStaff?.email || '',
    address: existingStaff?.address || '',
    joiningDate: existingStaff?.joining_date ? String(existingStaff.joining_date).slice(0, 10) : '',
    monthlySalary: existingStaff?.monthly_salary != null ? String(existingStaff.monthly_salary) : '',
    shift: existingStaff?.shift || 'Flexible',
    photoUrl: existingStaff?.photo_url || '',
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
    if (!form.fullName.trim()) {
      Alert.alert('Required', 'Please enter staff full name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        rolePosition: form.rolePosition,
        phoneNumber: form.phoneNumber.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        joiningDate: form.joiningDate.trim() || null,
        monthlySalary: form.monthlySalary ? Number(form.monthlySalary) : 0,
        shift: form.shift,
        photoUrl: form.photoUrl || null,
      };

      if (isEditing) {
        await apiClient.put(`/staff/${existingStaff.id}`, payload);
        Alert.alert('Success', 'Staff member updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await apiClient.post('/staff', payload);
        Alert.alert('Success', 'Staff member added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save staff record');
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
          <Text style={styles.topTitle}>{isEditing ? 'Edit Staff Member' : 'Add New Staff'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Photo Upload Box */}
        <Text style={styles.sectionTitle}>Staff Photo</Text>
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

        {/* Personal Details */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Field
          label="Full Name *"
          value={form.fullName}
          onChangeText={(v) => setForm((f) => ({ ...f, fullName: v }))}
          placeholder="e.g. Ali Ahmed"
        />

        {/* Role Selector */}
        <Text style={styles.label}>Role / Position</Text>
        <View style={styles.optionRow}>
          {ROLES.map((role) => {
            const active = form.rolePosition === role;
            return (
              <TouchableOpacity
                key={role}
                onPress={() => setForm((f) => ({ ...f, rolePosition: role }))}
                style={[styles.optionChip, active && styles.optionChipActive]}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{role}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Field
          label="Phone Number"
          value={form.phoneNumber}
          onChangeText={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
          placeholder="0300-1234567"
          keyboardType="phone-pad"
        />
        <Field
          label="Email (Optional)"
          value={form.email}
          onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
          placeholder="ali@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field
          label="Address / Living Quarters"
          value={form.address}
          onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
          placeholder="e.g. Farm Quarter #2, Sector B"
        />

        {/* Employment Details */}
        <Text style={styles.sectionTitle}>Employment Details</Text>
        <Field
          label="Joining Date"
          value={form.joiningDate}
          onChangeText={(v) => setForm((f) => ({ ...f, joiningDate: v }))}
          placeholder="YYYY-MM-DD"
        />
        <Field
          label="Monthly Salary (Rs.)"
          value={form.monthlySalary}
          onChangeText={(v) => setForm((f) => ({ ...f, monthlySalary: v }))}
          placeholder="25000"
          keyboardType="numeric"
        />

        {/* Shift Selector */}
        <Text style={styles.label}>Shift Schedule</Text>
        <View style={styles.optionRow}>
          {SHIFTS.map((sh) => {
            const active = form.shift === sh;
            return (
              <TouchableOpacity
                key={sh}
                onPress={() => setForm((f) => ({ ...f, shift: sh }))}
                style={[styles.optionChip, active && styles.optionChipActive]}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{sh}</Text>
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
            <Text style={styles.saveText}>{isEditing ? 'Update Staff Member' : 'Add Staff Member'}</Text>
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
    backgroundColor: '#6A4A3C',
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
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  optionChipActive: { backgroundColor: '#6A4A3C', borderColor: '#6A4A3C' },
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
    backgroundColor: '#6A4A3C',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#6A4A3C',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  saveText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
