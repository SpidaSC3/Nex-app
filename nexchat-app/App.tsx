// App.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, SafeAreaView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { mockLogin, mockRegister } from './src/mockApi';
import ChatScreen from './src/ChatScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    if (!username || !password) return Alert.alert("Error", "Fill in all fields");

    try {
      let data;
      if (isRegistering) {
        data = await mockRegister(username, password);
        Alert.alert("SAVE THIS RECOVERY CODE", data.recovery_code);
      } else {
        data = await mockLogin(username, password);
      }

      if (data.userid) {
        await SecureStore.setItemAsync('userID', data.userid);
        setIsLoggedIn(true);
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  if (isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ChatScreen />
        <Button title="Logout" onPress={() => setIsLoggedIn(false)} color="red" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{isRegistering ? 'Create Account' : 'Login'}</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      
      <Button title={isRegistering ? 'Sign Up' : 'Log In'} onPress={handleAuth} />
      <View style={{ marginTop: 10 }}>
        <Button title={isRegistering ? 'Switch to Login' : 'Switch to Register'} onPress={() => setIsRegistering(!isRegistering)} color="#666" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 15, borderRadius: 8, fontSize: 16 }
});