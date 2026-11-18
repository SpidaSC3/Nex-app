import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ListRenderItem } from 'react-native';

// 1. Define the shape of a message
interface Message {
  id: string;
  text: string;
  sender: 'me' | 'system' | 'them';
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Welcome to NexChat!', sender: 'system' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage: Message = { 
      id: Date.now().toString(), 
      text: input, 
      sender: 'me' 
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  // 2. Explicitly type the render function for FlatList
  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'me' ? styles.myMessage : styles.theirMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
      />
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={input} 
          onChangeText={setInput} 
          placeholder="Type a message..." 
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: '#f5f5f5' 
  },
  messageBubble: { 
    padding: 10, 
    borderRadius: 10, 
    marginVertical: 5, 
    maxWidth: '80%' 
  },
  myMessage: { 
    backgroundColor: '#DCF8C6', 
    alignSelf: 'flex-end' 
  },
  theirMessage: { 
    backgroundColor: '#FFF', 
    alignSelf: 'flex-start' 
  },
  messageText: { 
    fontSize: 16 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 20, 
    padding: 10, 
    marginRight: 10, 
    backgroundColor: '#fff' 
  },
});