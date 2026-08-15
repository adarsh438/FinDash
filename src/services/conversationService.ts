import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

export interface InsightCardData {
    type: 'spending' | 'savings' | 'bill' | 'goal' | 'health';
    title: string;
    subtitle: string;
    value: string;
    detail: string;
}

export interface ConversationMessage {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    toolsExecuted?: string[];
    insightCard?: InsightCardData;
}

export interface Conversation {
    id: string;
    userId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    lastMessage?: string;
}

const CONVERSATIONS_COLLECTION = 'conversations';
const DEMO_CONVERSATIONS_KEY = 'findash_demo_conversations';
const DEMO_MESSAGES_KEY = 'findash_demo_messages';

let demoListeners: Array<() => void> = [];

const notifyDemoListeners = () => {
    demoListeners.forEach(cb => cb());
};

const getDemoConversations = (): Conversation[] => {
    try {
        const saved = localStorage.getItem(DEMO_CONVERSATIONS_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Failed to parse demo conversations", e);
    }
    return [{
        id: 'demo-conv-1',
        userId: 'demo-user-123',
        title: 'Monthly Spending Overview',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: 'How am I doing this month?'
    }];
};

const saveDemoConversations = (list: Conversation[]) => {
    try {
        localStorage.setItem(DEMO_CONVERSATIONS_KEY, JSON.stringify(list));
    } catch (e) {
        console.error("Failed to save demo conversations", e);
    }
    notifyDemoListeners();
};

const getDemoMessages = (convId: string): ConversationMessage[] => {
    try {
        const saved = localStorage.getItem(`${DEMO_MESSAGES_KEY}_${convId}`);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Failed to parse demo messages", e);
    }
    if (convId === 'demo-conv-1') {
        return [
            {
                id: 'm1',
                conversationId: 'demo-conv-1',
                role: 'assistant',
                content: "Hi! I'm your Findash AI Financial Copilot. I analyze your real transactions, budgets, goals, and upcoming bills to give you personalized insights.",
                timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 'm2',
                conversationId: 'demo-conv-1',
                role: 'user',
                content: "How am I doing this month?",
                timestamp: new Date(Date.now() - 3000000).toISOString()
            },
            {
                id: 'm3',
                conversationId: 'demo-conv-1',
                role: 'assistant',
                content: "Here is your current financial summary for this month:\n\n* **Total Spent**: ₹12,450\n* **Top Category**: Food & Dining (₹4,200)\n* **Budget Status**: You've used 62% of your monthly budget with 15 days remaining.",
                timestamp: new Date(Date.now() - 2900000).toISOString(),
                insightCard: {
                    type: 'spending',
                    title: 'Monthly Spending Rate',
                    subtitle: '62% of budget used',
                    value: '₹12,450',
                    detail: 'On track to save ₹7,550 by month end'
                }
            }
        ];
    }
    return [];
};

const saveDemoMessages = (convId: string, messages: ConversationMessage[]) => {
    try {
        localStorage.setItem(`${DEMO_MESSAGES_KEY}_${convId}`, JSON.stringify(messages));
    } catch (e) {
        console.error("Failed to save demo messages", e);
    }
    notifyDemoListeners();
};

export const conversationService = {
    // Generate conversation title from prompt
    generateTitle: (firstPrompt: string): string => {
        const clean = firstPrompt.trim().replace(/[^\w\s]/gi, '');
        if (clean.length === 0) return 'New Conversation';
        const words = clean.split(/\s+/).slice(0, 5);
        const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        return capitalized.length > 30 ? capitalized.substring(0, 30) + '...' : capitalized;
    },

    // Create a new conversation
    createConversation: async (userId: string, initialPrompt?: string): Promise<Conversation> => {
        const title = initialPrompt ? conversationService.generateTitle(initialPrompt) : 'New Conversation';
        const now = new Date().toISOString();

        if (userId === 'demo-user-123') {
            const list = getDemoConversations();
            const newConv: Conversation = {
                id: 'demo_conv_' + Date.now(),
                userId,
                title,
                createdAt: now,
                updatedAt: now,
                lastMessage: initialPrompt || ''
            };
            saveDemoConversations([newConv, ...list]);
            return newConv;
        }

        const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), {
            userId,
            title,
            createdAt: now,
            updatedAt: now,
            lastMessage: initialPrompt || ''
        });

        return {
            id: docRef.id,
            userId,
            title,
            createdAt: now,
            updatedAt: now,
            lastMessage: initialPrompt || ''
        };
    },

    // Subscribe to user conversations
    subscribeToConversations: (userId: string, callback: (conversations: Conversation[]) => void) => {
        if (userId === 'demo-user-123') {
            callback(getDemoConversations());
            const listener = () => callback(getDemoConversations());
            demoListeners.push(listener);
            return () => {
                demoListeners = demoListeners.filter(cb => cb !== listener);
            };
        }

        const q = query(
            collection(db, CONVERSATIONS_COLLECTION),
            where("userId", "==", userId)
        );

        return onSnapshot(q, (snapshot) => {
            const list = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as Conversation))
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            callback(list);
        });
    },

    // Subscribe to messages in a conversation
    subscribeToMessages: (userId: string, conversationId: string, callback: (messages: ConversationMessage[]) => void) => {
        if (userId === 'demo-user-123') {
            callback(getDemoMessages(conversationId));
            const listener = () => callback(getDemoMessages(conversationId));
            demoListeners.push(listener);
            return () => {
                demoListeners = demoListeners.filter(cb => cb !== listener);
            };
        }

        const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, 'messages');
        return onSnapshot(messagesRef, (snapshot) => {
            const list = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as ConversationMessage))
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            callback(list);
        });
    },

    // Add message to conversation
    addMessage: async (
        userId: string,
        conversationId: string,
        role: 'user' | 'assistant' | 'system',
        content: string,
        toolsExecuted?: string[],
        insightCard?: InsightCardData
    ): Promise<ConversationMessage> => {
        const timestamp = new Date().toISOString();

        if (userId === 'demo-user-123') {
            const currentMsgs = getDemoMessages(conversationId);
            const newMsg: ConversationMessage = {
                id: 'demo_msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                conversationId,
                role,
                content,
                timestamp,
                toolsExecuted,
                insightCard
            };
            saveDemoMessages(conversationId, [...currentMsgs, newMsg]);

            // Update conversation lastMessage & updatedAt
            const convs = getDemoConversations();
            const updatedConvs = convs.map(c => {
                if (c.id === conversationId) {
                    const title = (c.title === 'New Conversation' && role === 'user') ? conversationService.generateTitle(content) : c.title;
                    return { ...c, title, updatedAt: timestamp, lastMessage: content.substring(0, 60) };
                }
                return c;
            });
            saveDemoConversations(updatedConvs);

            return newMsg;
        }

        const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, 'messages');
        const docRef = await addDoc(messagesRef, {
            conversationId,
            role,
            content,
            timestamp,
            toolsExecuted: toolsExecuted || [],
            ...(insightCard ? { insightCard } : {})
        });

        // Update main conversation document
        const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
        const convSnap = await getDoc(convRef);
        if (convSnap.exists()) {
            const data = convSnap.data();
            const updatePayload: any = {
                updatedAt: timestamp,
                lastMessage: content.substring(0, 60)
            };
            if (data.title === 'New Conversation' && role === 'user') {
                updatePayload.title = conversationService.generateTitle(content);
            }
            await updateDoc(convRef, updatePayload);
        }

        return {
            id: docRef.id,
            conversationId,
            role,
            content,
            timestamp,
            toolsExecuted,
            insightCard
        };
    },

    // Rename conversation
    renameConversation: async (userId: string, conversationId: string, newTitle: string) => {
        if (userId === 'demo-user-123') {
            const convs = getDemoConversations();
            const updated = convs.map(c => c.id === conversationId ? { ...c, title: newTitle } : c);
            saveDemoConversations(updated);
            return;
        }

        const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
        await updateDoc(convRef, { title: newTitle, updatedAt: new Date().toISOString() });
    },

    // Delete conversation
    deleteConversation: async (userId: string, conversationId: string) => {
        if (userId === 'demo-user-123') {
            const convs = getDemoConversations();
            saveDemoConversations(convs.filter(c => c.id !== conversationId));
            localStorage.removeItem(`${DEMO_MESSAGES_KEY}_${conversationId}`);
            return;
        }

        // Delete subcollection messages first
        const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, 'messages');
        const msgsSnap = await getDocs(messagesRef);
        const deletePromises = msgsSnap.docs.map(d => deleteDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId, 'messages', d.id)));
        await Promise.all(deletePromises);

        // Delete parent conversation
        await deleteDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId));
    }
};
