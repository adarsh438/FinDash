import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Activity } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { aiService, type ChatMessage } from '../services/aiService';
import './AICoach.css';

const PROMPT_CHIPS = [
    'How am I doing this month?',
    'Where am I overspending?',
    'How can I save more?',
    'What\'s my biggest expense?',
];

const AICoach = () => {
    const { userProfile } = useAuth();
    const { expenses, budget } = useExpenses();
    const isPremium = userProfile?.isPremium;
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

    const [messages, setMessages] = useState<ChatMessage[]>([{
        id: 'init',
        text: isPremium
            ? "Hi! I'm your AI Finance Coach. Ask me anything about your spending, trends, financial health, or savings goals!"
            : "Hi! I'm your AI Finance Coach. I can analyze your transactions and provide personalized insights. Try asking me a question below!",
        sender: 'ai',
        timestamp: new Date()
    }]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Calculate Financial Health Score
    const healthScore = useMemo(() => {
        return aiService.calculateHealthScore(expenses, budget?.amount || 0);
    }, [expenses, budget]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async (text?: string) => {
        const msg = (text || inputValue).trim();
        if (!msg) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(), text: msg,
            sender: 'user', timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        if (!isPremium) {
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    text: "🔒 I've analyzed your recent transactions and found key insights about your spending patterns. Upgrade to Premium to unlock your full financial report and personalized advice!",
                    sender: 'ai', timestamp: new Date()
                }]);
                setIsUpgradeOpen(true);
            }, 1200);
            return;
        }

        try {
            const response = await aiService.generateResponse(msg, { expenses });
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: response, sender: 'ai', timestamp: new Date()
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I couldn't process that. Please try again.",
                sender: 'ai', timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    return (
        <div className="coach-page animate-fade-in">
            <PageHeader
                title="AI Finance Coach & Health Score"
                subtitle="Personalized financial intelligence and health metrics."
                icon={<Bot size={22} />}
            />

            {!isPremium && (
                <div className="coach-premium-notice">
                    <Sparkles size={14} />
                    <span>You're on the free plan. <button onClick={() => setIsUpgradeOpen(true)}>Upgrade to Premium</button> for full AI access.</span>
                </div>
            )}

            {/* Financial Health Score Gauge Banner */}
            <div className="health-score-banner animate-fade-in-scale">
                <div className="health-score-gauge">
                    <div className="score-circle">
                        <span className="score-number">{healthScore.score}</span>
                        <span className="score-max">/100</span>
                    </div>
                </div>
                <div className="health-score-details">
                    <div className="health-score-title-row">
                        <Activity size={18} className="health-icon" />
                        <h3>Financial Health: <span className={`rating-tag ${healthScore.rating.toLowerCase()}`}>{healthScore.rating}</span></h3>
                    </div>
                    <p className="health-recommendation">{healthScore.recommendation}</p>
                    <div className="health-metrics-row">
                        <div className="metric-item">
                            <span>Budget Adherence</span>
                            <strong>{healthScore.breakdown.budgetAdherence}%</strong>
                        </div>
                        <div className="metric-item">
                            <span>Savings Rate</span>
                            <strong>{healthScore.breakdown.savingsRate}%</strong>
                        </div>
                        <div className="metric-item">
                            <span>Consistency</span>
                            <strong>{healthScore.breakdown.spendingConsistency}%</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div className="coach-chat-container">
                {/* Messages */}
                <div className="messages-area">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message-row ${msg.sender}`}>
                            <div className="message-avatar">
                                {msg.sender === 'ai' ? <Bot size={16} /> : <UserIcon size={16} />}
                            </div>
                            <div className="message-bubble">
                                <p>{msg.text}</p>
                                <span className="message-time">
                                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message-row ai">
                            <div className="message-avatar"><Bot size={16} /></div>
                            <div className="message-bubble typing">
                                <span className="dot" /><span className="dot" /><span className="dot" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Prompt chips */}
                <div className="prompt-chips">
                    {PROMPT_CHIPS.map(chip => (
                        <button key={chip} className="prompt-chip"
                            onClick={() => handleSend(chip)}>
                            {chip}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="coach-input-area">
                    <textarea
                        className="coach-textarea"
                        placeholder="Ask about your finances..."
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                    <Button
                        icon={<Send size={16} />}
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isTyping}
                        size="sm"
                    >
                        Send
                    </Button>
                </div>
            </div>

            <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
        </div>
    );
};

export default AICoach;
