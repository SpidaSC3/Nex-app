import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { mockLogin, mockRegister } from './src/mockApi';
import ChatScreen from './src/ChatScreen';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signedInAs, setSignedInAs] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError('Enter your username and password to continue.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      if (isRegistering) {
        await mockRegister(trimmedUsername, password);
      } else {
        await mockLogin(trimmedUsername, password);
      }
      setSignedInAs(trimmedUsername);
    } catch {
      setError('We could not sign you in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {signedInAs ? (
          <ChatScreen
            username={signedInAs}
            onLogout={() => {
              setSignedInAs('');
              setPassword('');
            }}
          />
        ) : (
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.loginScroll}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.loginContent}>
                <View style={styles.brandLockup}>
                  <View style={styles.brandMark}>
                    <Text style={styles.brandMarkText}>N</Text>
                  </View>
                  <Text style={styles.brandName}>nexchat</Text>
                </View>

                <Text style={styles.eyebrow}>PRIVATE BY DESIGN</Text>
                <Text style={styles.heading}>
                  Your conversations,{'\n'}your own space.
                </Text>
                <Text style={styles.intro}>
                  Sign in with a username and password. No phone number or email required.
                </Text>

                <View style={styles.demoNotice}>
                  <View style={styles.noticeDot} />
                  <Text style={styles.demoNoticeText}>
                    Prototype mode · This sign-in is a local demo, not a real account.
                  </Text>
                </View>

                <View style={styles.form}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Choose a username"
                    placeholderTextColor="#849392"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="username"
                    returnKeyType="next"
                  />

                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#849392"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    textContentType={isRegistering ? 'newPassword' : 'password'}
                    onSubmitEditing={handleAuth}
                    returnKeyType="go"
                  />

                  {error ? <Text style={styles.errorText}>{error}</Text> : null}

                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.buttonPressed,
                      isLoading && styles.buttonDisabled,
                    ]}
                    onPress={handleAuth}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {isRegistering ? 'Create account' : 'Sign in'}
                      </Text>
                    )}
                  </Pressable>

                  <View style={styles.switchRow}>
                    <Text style={styles.switchText}>
                      {isRegistering ? 'Already have an account?' : 'New to NexChat?'}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                      }}
                      accessibilityRole="button"
                    >
                      <Text style={styles.switchAction}>
                        {isRegistering ? ' Sign in' : ' Create account'}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <Text style={styles.footerText}>
                  Messages are not transmitted or encrypted in this prototype.
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1D20',
  },
  keyboardView: {
    flex: 1,
  },
  loginScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  loginContent: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 52,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#B9E6D7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandMarkText: {
    color: '#0B2926',
    fontSize: 21,
    fontWeight: '800',
  },
  brandName: {
    color: '#F3F7F5',
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  eyebrow: {
    color: '#8FCAB6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 14,
  },
  heading: {
    color: '#F3F7F5',
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1.4,
    lineHeight: 44,
  },
  intro: {
    color: '#A8B9B7',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 380,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17302F',
    borderRadius: 10,
    padding: 12,
    marginTop: 24,
  },
  noticeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8C77A',
    marginRight: 10,
  },
  demoNoticeText: {
    flex: 1,
    color: '#D5E0DC',
    fontSize: 12,
    lineHeight: 18,
  },
  form: {
    marginTop: 28,
  },
  label: {
    color: '#E7EFEB',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#38504D',
    backgroundColor: '#132827',
    borderRadius: 10,
    color: '#F3F7F5',
    fontSize: 15,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  errorText: {
    color: '#FFB5A9',
    fontSize: 13,
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#B9E6D7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#0B2926',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    color: '#A8B9B7',
    fontSize: 13,
  },
  switchAction: {
    color: '#B9E6D7',
    fontSize: 13,
    fontWeight: '700',
  },
  footerText: {
    color: '#718784',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 42,
  },
});
