import React, { useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

interface Conversation {
  id: string;
  username: string;
  messages: Message[];
}

type Tab = 'chats' | 'contacts' | 'profile';

interface ChatScreenProps {
  username: string;
  onLogout: () => void;
}

const initialConversations: Conversation[] = [];

const initialsFor = (username: string) =>
  username
    .split(/[._\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export default function ChatScreen({ username, onLogout }: ChatScreenProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newChatVisible, setNewChatVisible] = useState(false);
  const [formError, setFormError] = useState('');
  const messageListRef = useRef<FlatList<Message>>(null);

  const activeConversation = conversations.find((item) => item.id === activeId) ?? null;
  const visibleConversations = conversations.filter((item) =>
    item.username.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const showList = activeTab !== 'profile' && (!activeConversation || isWide);

  const openNewChat = () => {
    setNewUsername('');
    setFormError('');
    setNewChatVisible(true);
  };

  const createConversation = () => {
    const peerUsername = newUsername.trim().replace(/^@/, '');
    if (!peerUsername) {
      setFormError('Enter a username to continue.');
      return;
    }

    const existing = conversations.find(
      (item) => item.username.toLowerCase() === peerUsername.toLowerCase(),
    );
    if (existing) {
      setActiveId(existing.id);
    } else {
      const conversation: Conversation = {
        id: `local-${Date.now()}`,
        username: peerUsername,
        messages: [],
      };
      setConversations((items) => [conversation, ...items]);
      setActiveId(conversation.id);
    }

    setActiveTab('chats');
    setSearch('');
    setNewChatVisible(false);
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !activeConversation) return;

    const message: Message = {
      id: `local-${Date.now()}`,
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
    setConversations((items) =>
      items.map((item) =>
        item.id === activeConversation.id
          ? { ...item, messages: [...item.messages, message] }
          : item,
      ),
    );
    setDraft('');
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const lastMessage = item.messages[item.messages.length - 1];
    const selected = item.id === activeId;
    return (
      <Pressable
        style={[styles.conversationRow, selected && styles.conversationRowSelected]}
        onPress={() => setActiveId(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Open conversation with ${item.username}`}
      >
        <Avatar username={item.username} />
        <View style={styles.conversationCopy}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {item.username}
          </Text>
          <Text style={styles.conversationPreview} numberOfLines={1}>
            {lastMessage?.text ?? 'Start a conversation'}
          </Text>
        </View>
        <Text style={styles.conversationTime}>{lastMessage?.time ?? 'New'}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.appHeader, isWide && styles.appHeaderWide]}>
        <View style={styles.headerBrand}>
          <View style={styles.headerMark}>
            <Text style={styles.headerMarkText}>N</Text>
          </View>
          <Text style={styles.headerBrandName}>nexchat</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.userChip}
            onPress={() => {
              setActiveTab('profile');
              setActiveId(null);
            }}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Avatar username={username} small />
            {isWide ? <Text style={styles.userChipText}>{username}</Text> : null}
          </Pressable>
        </View>
      </View>

      <View style={[styles.content, isWide && styles.contentWide]}>
        {activeTab === 'profile' ? (
          <ProfilePanel username={username} onLogout={onLogout} />
        ) : (
          <View style={[styles.workspace, isWide && styles.workspaceWide]}>
            {showList ? (
              <View style={[styles.listPanel, isWide && styles.listPanelWide]}>
                <View style={styles.listHeading}>
                  <View>
                    <Text style={styles.panelEyebrow}>
                      {activeTab === 'chats' ? 'YOUR SPACE' : 'PEOPLE'}
                    </Text>
                    <Text style={styles.panelTitle}>
                      {activeTab === 'chats' ? 'Messages' : 'Contacts'}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.newChatButton}
                    onPress={openNewChat}
                    accessibilityRole="button"
                    accessibilityLabel="Start a conversation"
                  >
                    <Text style={styles.newChatPlus}>+</Text>
                    <Text style={styles.newChatText}>New</Text>
                  </Pressable>
                </View>

                <View style={styles.searchBox}>
                  <Text style={styles.searchGlyph}>⌕</Text>
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search usernames"
                    placeholderTextColor="#81908D"
                    style={styles.searchInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Search conversations"
                  />
                </View>

                <View style={styles.tabs}>
                  <TabButton
                    title="Chats"
                    selected={activeTab === 'chats'}
                    onPress={() => setActiveTab('chats')}
                  />
                  <TabButton
                    title="Contacts"
                    selected={activeTab === 'contacts'}
                    onPress={() => setActiveTab('contacts')}
                  />
                  <TabButton
                    title="Profile"
                    selected={false}
                    onPress={() => {
                      setActiveTab('profile');
                      setActiveId(null);
                    }}
                  />
                </View>

                <FlatList
                  data={visibleConversations}
                  renderItem={renderConversation}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.conversationList}
                  ListEmptyComponent={
                    <View style={styles.emptyList}>
                      <Text style={styles.emptyTitle}>No conversations found</Text>
                      <Text style={styles.emptyDescription}>
                        Start a conversation with a username.
                      </Text>
                    </View>
                  }
                />
                <Text style={styles.listFootnote}>Sample conversations · not connected</Text>
              </View>
            ) : null}

            {activeConversation ? (
              <ChatThread
                conversation={activeConversation}
                draft={draft}
                onDraftChange={setDraft}
                onSend={sendMessage}
                onBack={() => setActiveId(null)}
                showBack={!isWide}
                messageListRef={messageListRef}
              />
            ) : isWide ? (
              <View style={styles.emptyThread}>
                <View style={styles.emptyThreadMark}>
                  <Text style={styles.emptyThreadMarkText}>N</Text>
                </View>
                <Text style={styles.emptyThreadTitle}>A quieter kind of conversation.</Text>
                <Text style={styles.emptyThreadDescription}>
                  Choose a conversation or enter a username to start one.
                </Text>
                <Pressable style={styles.emptyThreadButton} onPress={openNewChat}>
                  <Text style={styles.emptyThreadButtonText}>Start a conversation</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      </View>

      <Modal
        visible={newChatVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNewChatVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeadingRow}>
              <View>
                <Text style={styles.modalEyebrow}>NEW CONVERSATION</Text>
                <Text style={styles.modalTitle}>Find someone</Text>
              </View>
              <Pressable
                onPress={() => setNewChatVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>
            <Text style={styles.modalDescription}>
              Enter a username to open a conversation.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="@username"
              placeholderTextColor="#81908D"
              value={newUsername}
              onChangeText={(value) => {
                setNewUsername(value);
                setFormError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={createConversation}
              accessibilityLabel="Username to chat with"
            />
            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
            <Pressable style={styles.modalPrimaryButton} onPress={createConversation}>
              <Text style={styles.modalPrimaryButtonText}>Open conversation</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Avatar({ username, small = false }: { username: string; small?: boolean }) {
  return (
    <View style={[styles.avatar, small && styles.avatarSmall]}>
      <Text style={[styles.avatarText, small && styles.avatarTextSmall]}>
        {initialsFor(username)}
      </Text>
    </View>
  );
}

function TabButton({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tabButton, selected && styles.tabButtonSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.tabButtonText, selected && styles.tabButtonTextSelected]}>
        {title}
      </Text>
    </Pressable>
  );
}

function ChatThread({
  conversation,
  draft,
  onDraftChange,
  onSend,
  onBack,
  showBack,
  messageListRef,
}: {
  conversation: Conversation;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onBack: () => void;
  showBack: boolean;
  messageListRef: React.RefObject<FlatList<Message> | null>;
}) {
  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender === 'me';
    return (
      <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
        <View style={[styles.messageBubble, isMine ? styles.messageBubbleMine : styles.messageBubbleTheirs]}>
          <Text style={[styles.messageText, isMine && styles.messageTextMine]}>{item.text}</Text>
          <Text style={[styles.messageTime, isMine && styles.messageTimeMine]}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.threadPanel}>
      <View style={styles.threadHeader}>
        {showBack ? (
          <Pressable style={styles.backButton} onPress={onBack} accessibilityRole="button">
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : null}
        <Avatar username={conversation.username} />
        <View style={styles.threadHeaderCopy}>
          <Text style={styles.threadName} numberOfLines={1}>{conversation.username}</Text>
          <Text style={styles.threadStatus}>Local preview · no server connected</Text>
        </View>
        <View style={styles.notConnectedPill}>
          <View style={styles.notConnectedDot} />
          <Text style={styles.notConnectedText}>Local</Text>
        </View>
      </View>

      <View style={styles.threadNotice}>
        <Text style={styles.threadNoticeText}>
          Local preview only. Messages are not sent or encrypted.
        </Text>
      </View>

      <FlatList
        ref={messageListRef}
        data={conversation.messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messageList,
          conversation.messages.length === 0 && styles.messageListEmpty,
        ]}
        onContentSizeChange={() => messageListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.firstMessage}>
            <Avatar username={conversation.username} />
            <Text style={styles.firstMessageTitle}>A new conversation</Text>
            <Text style={styles.firstMessageDescription}>
              Write a message to preview the interface. It will not reach {conversation.username}.
            </Text>
          </View>
        }
      />

      <View style={styles.composerArea}>
        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            value={draft}
            onChangeText={onDraftChange}
            placeholder="Type a message"
            placeholderTextColor="#81908D"
            multiline
            maxLength={2000}
            onSubmitEditing={onSend}
            accessibilityLabel="Message"
          />
          <Pressable
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
            onPress={onSend}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel="Add message locally"
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
        <Text style={styles.composerCaption}>Local preview session</Text>
      </View>
    </View>
  );
}

function ProfilePanel({ username, onLogout }: { username: string; onLogout: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.profileScroll}>
      <View style={styles.profilePanel}>
        <Text style={styles.panelEyebrow}>YOUR ACCOUNT</Text>
        <Text style={styles.panelTitle}>Profile & privacy</Text>
        <View style={styles.profileIdentity}>
          <Avatar username={username} />
          <View>
            <Text style={styles.profileUsername}>{username}</Text>
            <Text style={styles.profileSubtext}>Username-only account</Text>
          </View>
        </View>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyCardTitle}>Current preview status</Text>
          <PrivacyItem title="No personal details" detail="Only a username and password are requested." />
          <PrivacyItem title="Local sign-in preview" detail="Credentials are not currently sent to a server." />
          <PrivacyItem title="No message transport" detail="Messages are held in memory and do not leave this device." />
          <PrivacyItem title="No encryption yet" detail="Peer-to-peer WebRTC and end-to-end encryption are not implemented." />
        </View>

        <Pressable style={styles.signOutButton} onPress={onLogout} accessibilityRole="button">
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function PrivacyItem({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.privacyItem}>
      <View style={styles.privacyCheck}>
        <Text style={styles.privacyCheckText}>i</Text>
      </View>
      <View style={styles.privacyItemCopy}>
        <Text style={styles.privacyItemTitle}>{title}</Text>
        <Text style={styles.privacyItemDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6F4',
  },
  appHeader: {
    minHeight: 68,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E4EAE7',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appHeaderWide: {
    paddingHorizontal: 32,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#D5EEE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  headerMarkText: {
    color: '#173B35',
    fontSize: 19,
    fontWeight: '800',
  },
  headerBrandName: {
    color: '#18332F',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9B9',
    backgroundColor: '#FBF8EE',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  demoBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B58B39',
    marginRight: 6,
  },
  demoBadgeText: {
    color: '#80631E',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userChipText: {
    color: '#40534F',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  contentWide: {
    maxWidth: 1220,
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  workspace: {
    flex: 1,
  },
  workspaceWide: {
    flexDirection: 'row',
    gap: 18,
  },
  listPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listPanelWide: {
    flex: 0,
    width: 340,
    borderWidth: 1,
    borderColor: '#E3EAE6',
    borderRadius: 15,
    overflow: 'hidden',
  },
  listHeading: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelEyebrow: {
    color: '#77908A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 5,
  },
  panelTitle: {
    color: '#18332F',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#173B35',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
  },
  newChatPlus: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 18,
    marginRight: 5,
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchBox: {
    height: 42,
    marginHorizontal: 20,
    borderRadius: 9,
    backgroundColor: '#F3F6F4',
    borderWidth: 1,
    borderColor: '#E7ECE9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
  },
  searchGlyph: {
    color: '#71847F',
    fontSize: 23,
    marginRight: 8,
    marginTop: -4,
  },
  searchInput: {
    flex: 1,
    color: '#263D38',
    fontSize: 13,
    paddingVertical: 0,
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 10,
  },
  tabButton: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tabButtonSelected: {
    backgroundColor: '#E6F2EC',
  },
  tabButtonText: {
    color: '#74847F',
    fontSize: 12,
    fontWeight: '600',
  },
  tabButtonTextSelected: {
    color: '#27594D',
  },
  conversationList: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },
  conversationRow: {
    minHeight: 72,
    borderRadius: 11,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  conversationRowSelected: {
    backgroundColor: '#F0F6F2',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#DDEBE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 11,
  },
  avatarText: {
    color: '#356054',
    fontSize: 13,
    fontWeight: '700',
  },
  avatarTextSmall: {
    fontSize: 10,
  },
  conversationCopy: {
    flex: 1,
    marginLeft: 11,
    marginRight: 6,
  },
  conversationName: {
    color: '#243B36',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  conversationPreview: {
    color: '#788984',
    fontSize: 11,
  },
  conversationTime: {
    color: '#91A09B',
    fontSize: 10,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  emptyList: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 38,
  },
  emptyTitle: {
    color: '#38534B',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#80918B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 7,
  },
  listFootnote: {
    color: '#95A39E',
    fontSize: 10,
    textAlign: 'center',
    paddingVertical: 12,
  },
  threadPanel: {
    flex: 1,
    backgroundColor: '#FBFCFB',
  },
  threadHeader: {
    minHeight: 72,
    paddingHorizontal: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#E7ECE9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 9,
    paddingRight: 13,
  },
  backButtonText: {
    color: '#356054',
    fontSize: 12,
    fontWeight: '700',
  },
  threadHeaderCopy: {
    flex: 1,
    marginLeft: 11,
  },
  threadName: {
    color: '#203A34',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  threadStatus: {
    color: '#85948F',
    fontSize: 10,
  },
  notConnectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F1',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  notConnectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#929D99',
    marginRight: 6,
  },
  notConnectedText: {
    color: '#6E7D78',
    fontSize: 10,
    fontWeight: '600',
  },
  threadNotice: {
    backgroundColor: '#F7F4E9',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE8D7',
  },
  threadNoticeText: {
    color: '#76663D',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  messageList: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  messageListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 5,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '84%',
    minWidth: 90,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 7,
  },
  messageBubbleTheirs: {
    backgroundColor: '#EDF2EF',
    borderBottomLeftRadius: 5,
  },
  messageBubbleMine: {
    backgroundColor: '#DCEFE5',
    borderBottomRightRadius: 5,
  },
  messageText: {
    color: '#30463F',
    fontSize: 13,
    lineHeight: 19,
  },
  messageTextMine: {
    color: '#24483C',
  },
  messageTime: {
    color: '#899790',
    fontSize: 9,
    textAlign: 'right',
    marginTop: 4,
  },
  messageTimeMine: {
    color: '#658376',
  },
  firstMessage: {
    alignItems: 'center',
    paddingHorizontal: 28,
    maxWidth: 360,
    alignSelf: 'center',
  },
  firstMessageTitle: {
    color: '#2C4940',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
  },
  firstMessageDescription: {
    color: '#7C8C86',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 7,
  },
  composerArea: {
    borderTopWidth: 1,
    borderTopColor: '#E7ECE9',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  composer: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#E0E8E3',
    borderRadius: 11,
    padding: 5,
    backgroundColor: '#FBFCFB',
  },
  composerInput: {
    flex: 1,
    color: '#2A423A',
    fontSize: 12,
    minHeight: 34,
    maxHeight: 100,
    paddingHorizontal: 9,
    paddingTop: 9,
    paddingBottom: 7,
  },
  sendButton: {
    height: 34,
    paddingHorizontal: 12,
    backgroundColor: '#245A4D',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A9BDB5',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  composerCaption: {
    color: '#99A59F',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 7,
  },
  emptyThread: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 35,
    backgroundColor: '#FBFCFB',
    borderWidth: 1,
    borderColor: '#E3EAE6',
    borderRadius: 15,
  },
  emptyThreadMark: {
    width: 54,
    height: 54,
    borderRadius: 19,
    backgroundColor: '#E2F0E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 19,
  },
  emptyThreadMarkText: {
    color: '#356054',
    fontSize: 29,
    fontWeight: '800',
  },
  emptyThreadTitle: {
    color: '#203A34',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  emptyThreadDescription: {
    color: '#7C8D86',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 360,
    marginTop: 9,
  },
  emptyThreadButton: {
    backgroundColor: '#245A4D',
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 20,
  },
  emptyThreadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  profileScroll: {
    flexGrow: 1,
    padding: 18,
  },
  profilePanel: {
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAE6',
    borderRadius: 15,
    padding: 22,
  },
  profileIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 22,
    gap: 12,
  },
  profileUsername: {
    color: '#263F37',
    fontSize: 15,
    fontWeight: '700',
  },
  profileSubtext: {
    color: '#87958F',
    fontSize: 11,
    marginTop: 4,
  },
  privacyCard: {
    backgroundColor: '#F5F8F6',
    borderWidth: 1,
    borderColor: '#E8EEEA',
    borderRadius: 12,
    padding: 16,
  },
  privacyCardTitle: {
    color: '#29483E',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 13,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  privacyCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DFEEE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  privacyCheckText: {
    color: '#386452',
    fontSize: 11,
    fontWeight: '700',
  },
  privacyItemCopy: {
    flex: 1,
  },
  privacyItemTitle: {
    color: '#3A5149',
    fontSize: 11,
    fontWeight: '700',
  },
  privacyItemDetail: {
    color: '#7E8C86',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#DDE5E0',
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 18,
  },
  signOutText: {
    color: '#496158',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 25, 22, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    padding: 22,
  },
  modalHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalEyebrow: {
    color: '#77908A',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  modalTitle: {
    color: '#1E3932',
    fontSize: 21,
    fontWeight: '700',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F1F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#5D7169',
    fontSize: 21,
    lineHeight: 23,
  },
  modalDescription: {
    color: '#798A83',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    marginBottom: 17,
  },
  modalInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#DDE6E0',
    borderRadius: 9,
    paddingHorizontal: 12,
    color: '#263F37',
    fontSize: 13,
  },
  errorText: {
    color: '#A3483F',
    fontSize: 11,
    marginTop: 8,
  },
  modalPrimaryButton: {
    height: 44,
    borderRadius: 9,
    backgroundColor: '#245A4D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
