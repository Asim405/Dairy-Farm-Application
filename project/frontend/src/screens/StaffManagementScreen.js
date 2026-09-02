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
  Linking,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

export const StaffManagementScreen = ({ navigation }) => {
  const [loading, setLoading] = React.useState(true);
  const [staff, setStaff] = React.useState([]);
  const [selectedStaff, setSelectedStaff] = React.useState(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/staff');
      setStaff(data || []);
    } catch (e) {
      console.log('Error loading staff', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const handleDeleteStaff = (member) => {
    Alert.alert('Delete Staff Member', `Are you sure you want to remove ${member.full_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/staff/${member.id}`);
            setShowDetailModal(false);
            load();
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.error || 'Failed to remove staff member');
          }
        },
      },
    ]);
  };

  const handleEditStaff = (member) => {
    setShowDetailModal(false);
    navigation.navigate('AddStaff', { staff: member });
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('No Phone', 'No phone number provided for this staff member');
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    } else {
      Alert.alert('No Email', 'No email address provided for this staff member');
    }
  };

  const totalPayroll = staff.reduce((acc, it) => acc + Number(it.monthly_salary || 0), 0);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Staff Management</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddStaff')}
          style={styles.addBtn}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Payroll KPI Header */}
      <View style={styles.payrollCard}>
        <View style={styles.payrollCol}>
          <Text style={styles.payrollLabel}>Total Team</Text>
          <Text style={styles.payrollVal}>{staff.length} Members</Text>
        </View>
        <View style={styles.payrollDivider} />
        <View style={styles.payrollCol}>
          <Text style={styles.payrollLabel}>Monthly Payroll</Text>
          <Text style={[styles.payrollVal, { color: '#6A4A3C' }]}>
            Rs. {totalPayroll.toLocaleString()}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6A4A3C" />
        </View>
      ) : staff.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="people" size={48} color="#D0D5DD" />
          <Text style={styles.emptyTitle}>No staff members found</Text>
          <Text style={styles.emptySub}>Add farm hands, milkers, or managers</Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => navigation.navigate('AddStaff')}
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.addFirstBtnText}>Add Staff Member</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedStaff(item);
                setShowDetailModal(true);
              }}
            >
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={22} color="#6A4A3C" />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.name}>{item.full_name}</Text>
                  <View style={styles.shiftBadge}>
                    <Text style={styles.shiftText}>{item.shift || 'Flexible'}</Text>
                  </View>
                </View>

                <Text style={styles.role}>{item.role_position}</Text>
                <Text style={styles.salary}>
                  Monthly Salary: <Text style={{ fontWeight: '900', color: '#101828' }}>Rs. {item.monthly_salary}</Text>
                </Text>
              </View>

              {/* Quick Call Button */}
              {item.phone_number ? (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(item.phone_number)}
                >
                  <MaterialIcons name="call" size={18} color="#4FA765" />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}

      {/* Staff Detail Modal */}
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
                <Text style={styles.detailTitle}>{selectedStaff?.full_name}</Text>
                <Text style={styles.detailSub}>{selectedStaff?.role_position}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color="#667085" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, maxHeight: 340 }}>
              <View style={styles.infoGrid}>
                <DetailRow label="Role / Position" value={selectedStaff?.role_position} />
                <DetailRow label="Phone Number" value={selectedStaff?.phone_number} />
                <DetailRow label="Email" value={selectedStaff?.email} />
                <DetailRow label="Address" value={selectedStaff?.address} />
                <DetailRow label="Joining Date" value={selectedStaff?.joining_date ? String(selectedStaff.joining_date).slice(0, 10) : '-'} />
                <DetailRow label="Monthly Salary" value={`Rs. ${selectedStaff?.monthly_salary || 0}`} />
                <DetailRow label="Shift" value={selectedStaff?.shift} />
              </View>
            </ScrollView>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#E9F5EE' }]}
                onPress={() => handleCall(selectedStaff?.phone_number)}
              >
                <MaterialIcons name="call" size={18} color="#4FA765" />
                <Text style={[styles.actionBtnText, { color: '#4FA765' }]}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#EAF3FF' }]}
                onPress={() => selectedStaff && handleEditStaff(selectedStaff)}
              >
                <MaterialIcons name="edit" size={18} color="#175CD3" />
                <Text style={[styles.actionBtnText, { color: '#175CD3' }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#FEE4E2' }]}
                onPress={() => selectedStaff && handleDeleteStaff(selectedStaff)}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  topBar: {
    backgroundColor: '#6A4A3C',
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
  payrollCard: {
    margin: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  payrollCol: { flex: 1, alignItems: 'center' },
  payrollDivider: { width: 1, height: 36, backgroundColor: '#EAECF0' },
  payrollLabel: { fontSize: 11, color: '#667085', fontWeight: '700' },
  payrollVal: { marginTop: 4, fontSize: 16, fontWeight: '900', color: '#101828' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#344054', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#667085', marginTop: 4 },
  addFirstBtn: {
    marginTop: 16,
    backgroundColor: '#6A4A3C',
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
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F7F2EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontWeight: '900', color: '#101828', fontSize: 15 },
  role: { color: '#6A4A3C', fontWeight: '700', marginTop: 2, fontSize: 12 },
  salary: { marginTop: 6, color: '#667085', fontWeight: '600', fontSize: 11 },
  shiftBadge: {
    backgroundColor: '#F2F4F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  shiftText: { color: '#344054', fontWeight: '800', fontSize: 10 },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E9F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
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
  detailSub: { fontSize: 12, color: '#6A4A3C', fontWeight: '700', marginTop: 2 },
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
