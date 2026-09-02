import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

const FILTER_TABS = ['All', 'Animals', 'Staff', 'Inventory', 'Crops', 'Sales'];

export const SearchScreen = ({ navigation }) => {
  const [q, setQ] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState({
    animals: [],
    staff: [],
    inventory: [],
    crops: [],
    sales: [],
    totalMatches: 0,
  });

  const search = React.useCallback(async (query) => {
    if (!query.trim()) {
      setResults({ animals: [], staff: [], inventory: [], crops: [], sales: [], totalMatches: 0 });
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get(`/reports/search?q=${encodeURIComponent(query.trim())}`);
      setResults(res.data || {});
    } catch (e) {
      console.log('Search error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => {
      search(q);
    }, 300);
    return () => clearTimeout(t);
  }, [q, search]);

  // Combine results according to activeFilter
  const combinedList = React.useMemo(() => {
    const list = [];
    if (activeFilter === 'All' || activeFilter === 'Animals') {
      (results.animals || []).forEach((it) => list.push({ ...it, type: 'animal' }));
    }
    if (activeFilter === 'All' || activeFilter === 'Staff') {
      (results.staff || []).forEach((it) => list.push({ ...it, type: 'staff' }));
    }
    if (activeFilter === 'All' || activeFilter === 'Inventory') {
      (results.inventory || []).forEach((it) => list.push({ ...it, type: 'inventory' }));
    }
    if (activeFilter === 'All' || activeFilter === 'Crops') {
      (results.crops || []).forEach((it) => list.push({ ...it, type: 'crop' }));
    }
    if (activeFilter === 'All' || activeFilter === 'Sales') {
      (results.sales || []).forEach((it) => list.push({ ...it, type: 'sale' }));
    }
    return list;
  }, [results, activeFilter]);

  const handleItemPress = (item) => {
    if (item.type === 'animal') {
      navigation.navigate('LiveStock');
    } else if (item.type === 'staff') {
      navigation.navigate('StaffManagement');
    } else if (item.type === 'inventory') {
      navigation.navigate('InventoryManagement');
    } else if (item.type === 'crop') {
      navigation.navigate('CropsDetail');
    } else if (item.type === 'sale') {
      navigation.navigate('ProductionSales');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Universal Farm Search</Text>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={22} color="#98A2B3" />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search animals, staff, stock, crops, buyers..."
          style={styles.input}
          placeholderTextColor="#98A2B3"
          autoFocus={false}
        />
        {q ? (
          <TouchableOpacity onPress={() => setQ('')}>
            <MaterialIcons name="close" size={20} color="#98A2B3" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Category Tabs */}
      <View style={styles.filterChips}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTER_TABS.map((tab) => {
            const active = tab === activeFilter;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveFilter(tab)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Results List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4FA765" />
        </View>
      ) : !q.trim() ? (
        <View style={styles.center}>
          <MaterialIcons name="manage-search" size={56} color="#D0D5DD" />
          <Text style={styles.emptyTitle}>Live Farm Search</Text>
          <Text style={styles.emptySub}>
            Type any keyword to instantly look up animals, team members, feed stock, crops, or milk buyers
          </Text>
        </View>
      ) : combinedList.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="search-off" size={48} color="#D0D5DD" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySub}>Try searching with a different keyword or filter tab</Text>
        </View>
      ) : (
        <FlatList
          data={combinedList}
          keyExtractor={(it, idx) => `${it.type}-${it.id || idx}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const info = getEntityInfo(item);
            return (
              <TouchableOpacity
                style={styles.resultCard}
                activeOpacity={0.8}
                onPress={() => handleItemPress(item)}
              >
                <View style={[styles.resultIcon, { backgroundColor: info.tint }]}>
                  <MaterialIcons name={info.icon} size={20} color={info.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.resultTitle}>{info.title}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: info.tint }]}>
                      <Text style={[styles.typeBadgeText, { color: info.color }]}>{info.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.resultSub}>{info.subtitle}</Text>
                </View>

                <MaterialIcons name="chevron-right" size={20} color="#D0D5DD" />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

function getEntityInfo(item) {
  if (item.type === 'animal') {
    return {
      title: item.animal_code,
      subtitle: `${item.category} • ${item.breed || 'Breed N/A'} • ${item.health_status}`,
      icon: 'pets',
      color: '#4FA765',
      tint: '#E9F5EE',
      tag: 'Animal',
    };
  }
  if (item.type === 'staff') {
    return {
      title: item.full_name,
      subtitle: `${item.role_position} • ${item.phone_number || 'No phone'}`,
      icon: 'person',
      color: '#6A4A3C',
      tint: '#F7F2EF',
      tag: 'Staff',
    };
  }
  if (item.type === 'inventory') {
    return {
      title: item.item_name,
      subtitle: `${item.category} • Stock: ${item.quantity} ${item.unit}`,
      icon: 'inventory-2',
      color: '#2C4D5F',
      tint: '#EAF3FF',
      tag: 'Inventory',
    };
  }
  if (item.type === 'crop') {
    return {
      title: item.crop_name,
      subtitle: `${item.land_size} ${item.land_unit} • Status: ${item.status}`,
      icon: 'grass',
      color: '#4FA765',
      tint: '#E9F5EE',
      tag: 'Crop',
    };
  }
  return {
    title: `Sale to ${item.buyer_name}`,
    subtitle: `${item.liters_sold}L • Total: Rs.${item.total_amount}`,
    icon: 'receipt',
    color: '#0284C7',
    tint: '#E0F2FE',
    tag: 'Sale',
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  topBar: {
    backgroundColor: '#4FA765',
    paddingTop: 42,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  searchBox: {
    margin: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  input: { flex: 1, fontSize: 14, color: '#101828' },
  filterChips: { paddingHorizontal: 14, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  filterChipActive: { backgroundColor: '#4FA765', borderColor: '#4FA765' },
  filterChipText: { fontSize: 12, color: '#475467', fontWeight: '700' },
  filterChipTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 17, fontWeight: '900', color: '#344054', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#667085', marginTop: 6, textAlign: 'center', lineHeight: 18 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: { fontSize: 15, fontWeight: '900', color: '#101828' },
  resultSub: { fontSize: 12, color: '#667085', fontWeight: '600', marginTop: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  typeBadgeText: { fontSize: 10, fontWeight: '900' },
});
