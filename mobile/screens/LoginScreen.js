import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

// ⚠️ CHANGE THIS to your Vercel frontend URL
const APP_URL = 'https://your-frontend.vercel.app';
// ⚠️ CHANGE THIS to your Render backend URL
const API_URL = 'https://your-backend.onrender.com';

export default function LoginScreen({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBioAvailable(ok && enrolled);
    })();
  }, []);

  const handleBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Login to TeamBuilder', disableDeviceFallback: false });
    if (result.success) onSuccess();
    else Alert.alert('Failed', 'Use email/password instead.');
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Fill both fields');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) onSuccess();
      else Alert.alert('Error', data.error || 'Login failed');
    } catch { Alert.alert('Error', 'Cannot reach server'); }
    setLoading(false);
  };

  return (
    <View style={s.container}>
      <Text style={s.emoji}>⚡</Text>
      <Text style={s.title}>TeamBuilder AI</Text>
      <Text style={s.sub}>Find your dream hackathon team</Text>
      {bioAvailable && (
        <TouchableOpacity style={s.bioBtn} onPress={handleBiometric}>
          <Text style={s.bioText}>🔐  Login with Biometrics</Text>
        </TouchableOpacity>
      )}
      {bioAvailable && <Text style={s.or}>— or use email —</Text>}
      <TextInput style={s.input} placeholder="Email" placeholderTextColor="#6b7280" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={s.input} placeholder="Password" placeholderTextColor="#6b7280" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Login</Text>}
      </TouchableOpacity>
      <Text style={s.hint}>Demo: priya@demo.com / demo123</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117', justifyContent: 'center', paddingHorizontal: 32 },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '700', color: '#e4e4e7', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 14, color: '#8b8fa3', textAlign: 'center', marginBottom: 36 },
  bioBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1d27', borderWidth: 1, borderColor: '#6366f1', borderRadius: 10, padding: 16, marginBottom: 20 },
  bioText: { color: '#a5b4fc', fontSize: 16, fontWeight: '600' },
  or: { color: '#6b7280', textAlign: 'center', marginBottom: 20, fontSize: 13 },
  input: { backgroundColor: '#1a1d27', borderWidth: 1, borderColor: '#2a2d3a', borderRadius: 8, padding: 14, color: '#e4e4e7', fontSize: 15, marginBottom: 12 },
  btn: { backgroundColor: '#6366f1', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hint: { color: '#6b7280', textAlign: 'center', marginTop: 20, fontSize: 12 },
});
