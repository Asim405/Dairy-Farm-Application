import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ReportsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.text}>
        This tab will show production & sales reports (as in the design). For now, open Production & Sales from Home.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  text: { color: '#667085', lineHeight: 20 },
});

