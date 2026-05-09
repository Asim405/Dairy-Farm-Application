import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

export const StaffManagementScreen = ({ navigation }) => {
  const [loading, setLoading] = React.useState(true);
  const [staff, setStaff] = React.useState([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/staff');
      setStaff(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topLeft}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.topTitle}>Staff Management</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddStaff')} style={styles.addBtn}>
          <MaterialIcons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          ListHeaderComponent={<Text style={styles.small}>Team Members{'\n'}{staff.length} staff members</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={18} color="#6A4A3C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.role}>{item.role_position}</Text>
                <Text style={styles.meta}>Monthly Salary: ₹{item.monthly_salary || 0}</Text>
              </View>
              <Text style={styles.shift}>{item.shift}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { backgroundColor: '#6A4A3C', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  small: { color: '#667085', fontWeight: '800', marginBottom: 10 },
  card: { flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#EAECF0', borderRadius: 12, padding: 12, marginBottom: 10 },
  avatar: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '900', color: '#101828' },
  role: { color: '#667085', fontWeight: '700', marginTop: 2, fontSize: 12 },
  meta: { marginTop: 6, color: '#344054', fontWeight: '700', fontSize: 11 },
  shift: { color: '#667085', fontWeight: '800', fontSize: 11 },
});

