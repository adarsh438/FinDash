import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { expenseService, type Expense } from '../services/expenseService';
import { aiService, type ChatMessage } from '../services/aiService';
import UpgradeModal from '../components/UpgradeModal';
import './AICoach.css';

const AICoach = () => {
    const { currentUser, userProfile } = useAuth();
    // navigate removed

    // ... existing state ...

    // Premium Check
    // Premium Check
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // If just checking loading state...
    // logic below

    // We can keep the "return" logic but make it a nice overlay similar to Analytics
    // But since `AICoach.tsx` currently returns early, let's keep that structure but use the Modal.

    // TEASER MODE: Allow access but intercept messages
    const isPremium = userProfile?.isPremium;

    // ... existing implementation ...
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'init',
            text: isPremium
                ? "Hi! I'm your AI Finance Coach. Ask me about your spending, trends, or savings!"
                : "Hi! I'm your AI Finance Coach. I can analyze your transactions and find hidden savings. Ask me 'How am I doing?' to see what I can do!",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load recent expenses for context
    useEffect(() => {
        if (!currentUser) return;
        const unsubscribe = expenseService.subscribeToExpenses(currentUser.uid, (data) => {
            setRecentExpenses(data);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // FREE USER INTERCEPTION
        if (!isPremium) {
            setTimeout(() => {
                setIsTyping(false);
                const teaserMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    text: "🔒 I've analyzed your recent transactions and found 3 key insights about your spending trends. Upgrade to Premium to unlock your full financial report and personalized savings advice!",
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, teaserMsg]);
                setIsUpgradeModalOpen(true);
            }, 1000);
            return;
        }

        try {
            const aiResponseText = await aiService.generateResponse(userMsg.text, { expenses: recentExpenses });

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Error:", error);
            // Optional: Error message
        } finally {
            // Only stop typing if we didn't hit the free user block (which handles it manually)
            if (isPremium) setIsTyping(false);
        }
    };

    return (
        <div className="coach-container">
            <div className="coach-header">
                <div>
                    <h1>AI Finance Coach</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Your smart assistant for financial wisdom.</p>
                </div>
                <div style={{ background: 'var(--accent-gradient)', padding: '0.5rem', borderRadius: '50%' }}>
                    <Bot size={24} color="white" />
                </div>
            </div>

            <Card className="chat-window">
                <div className="messages-list">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                            <div className="message-avatar">
                                {msg.sender === 'ai' ? <Bot size={18} /> : <UserIcon size={18} />}
                            </div>
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message-wrapper ai">
                            <div className="message-avatar"><Bot size={18} /></div>
                            <div className="message-bubble typing-indicator">
                                <span>•</span><span>•</span><span>•</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSend}>
                    <Input
                        placeholder="Ask about your spending..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                    <Button type="submit" disabled={!inputValue.trim() || isTyping} icon={<Send size={18} />}>
                        Send
                    </Button>
                </form>
            </Card>

            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </div>
    );
};

export default AICoach;
