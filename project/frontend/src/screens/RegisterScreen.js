import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const { signUp } = React.useContext(AuthContext);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await signUp({ fullName, email, phoneNumber, password });
      setSuccess('Account created. Please sign in.');
      setTimeout(() => navigation.navigate('Login'), 900);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialIcons name="person-add" size={26} color="#4FA765" />
        </View>
        <Text style={styles.appTitle}>Join Dairy Farm Manager</Text>
        <Text style={styles.subtitle}>Create your account</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign Up</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="person" size={20} color="#98A2B3" />
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="mail" size={20} color="#98A2B3" />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="phone" size={20} color="#98A2B3" />
          <TextInput
            style={styles.input}
            placeholder="Enter your phone"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            editable={!loading}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="lock" size={20} color="#98A2B3" />
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>{loading ? 'Creating...' : 'Create Account  →'}</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Sign In
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4FA765',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  appTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#667085',
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: '#4FA765',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#B42318',
    marginBottom: 6,
  },
  success: {
    color: '#027A48',
    marginBottom: 6,
  },
  bottomText: {
    textAlign: 'center',
    marginTop: 14,
    color: '#667085',
  },
  link: {
    color: '#4FA765',
    fontWeight: '700',
  },
});
