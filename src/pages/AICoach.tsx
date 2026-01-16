import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { expenseService, type Expense } from '../services/expenseService';
import { aiService, type ChatMessage } from '../services/aiService';
import './AICoach.css';

const AICoach = () => {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    // ... existing state ...

    // Premium Check
    if (!userProfile?.isPremium) {
        return (
            <div className="coach-containerWrapper" style={{ padding: '2rem', textAlign: 'center' }}>
                <Card style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
                    <Bot size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                    <h2>AI Coach is a Premium Feature</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Upgrade your account to get personalized financial advice powered by AI.
                    </p>
                    <Button onClick={() => navigate('/premium')} variant="primary">
                        Unlock AI Coach
                    </Button>
                </Card>
            </div>
        );
    }

    // ... existing implementation ...
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'init',
            text: "Hi! I'm your AI Finance Coach. Ask me about your spending, generic savings tips, or how to budget better!",
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
            setIsTyping(false);
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
        </div>
    );
};

export default AICoach;
