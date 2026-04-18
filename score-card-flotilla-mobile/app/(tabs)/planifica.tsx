import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { THEME } from '@/constants/Theme';
import { Send, Compass } from 'lucide-react-native';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function PlanificaScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Mock response for this prototype (integration with real API would go here)
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Para ir a tu destino, te sugiero tomar la Línea 1 del Metro hacia Pantitlán y transbordar en Balderas a la Línea 3. El tiempo estimado es de 35 minutos.`,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1500);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.role === 'user' ? styles.userBubble : styles.assistantBubble
    ]}>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <View style={styles.chatContainer}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Compass size={64} color="#444" />
            <Text style={styles.emptyTitle}>Planifica tu ruta</Text>
            <Text style={styles.emptySubtitle}>¿A dónde quieres ir hoy?</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu destino..."
          placeholderTextColor="#666"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity 
          onPress={sendMessage}
          disabled={!input.trim() || isLoading}
          style={[styles.sendButton, (!input.trim() || isLoading) && styles.disabledButton]}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  chatContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  listContent: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: THEME.accent,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: THEME.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#fff',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: THEME.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
