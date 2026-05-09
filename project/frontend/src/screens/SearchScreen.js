import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

export const SearchScreen = () => {
  const [q, setQ] = React.useState('');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search animals by ID or breed..."
        style={styles.input}
      />
      <Text style={styles.hint}>Tip: For livestock search, use Live Stock screen filters.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  input: {
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hint: { marginTop: 12, color: '#667085' },
});

