import { useState, useRef, useEffect, useMemo } from 'react';
import { Bot, Sparkles, Activity, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { goalService, type Goal } from '../services/goalService';
import { billService, type CustomBill } from '../services/billService';
import { aiService, type FinancialHealthScore } from '../services/aiService';
import { conversationService, type Conversation, type ConversationMessage } from '../services/conversationService';

import ChatSidebar from '../components/ai/ChatSidebar';
import ChatMessageItem from '../components/ai/ChatMessageItem';
import ChatInputArea from '../components/ai/ChatInputArea';
import PromptSuggestions from '../components/ai/PromptSuggestions';

import './AICoach.css';

const AICoach = () => {
    const { currentUser, userProfile } = useAuth();
    const { expenses, budget } = useExpenses();
    const isPremium = userProfile?.isPremium;
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

    // Data states for complete financial context
    const [goals, setGoals] = useState<Goal[]>([]);
    const [bills, setBills] = useState<CustomBill[]>([]);

    // Conversations state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);

    // UI & Streaming state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<boolean>(false);

    // 1. Subscribe to Goals and Bills for full context
    useEffect(() => {
        if (!currentUser) return;
        const unsubGoals = goalService.subscribeToGoals(currentUser.uid, setGoals);
        const unsubBills = billService.subscribeToBills(currentUser.uid, setBills);

        return () => {
            unsubGoals();
            unsubBills();
        };
    }, [currentUser]);

    // 2. Subscribe to user conversations
    useEffect(() => {
        if (!currentUser) return;
        const unsub = conversationService.subscribeToConversations(currentUser.uid, (list) => {
            setConversations(list);
            if (!activeConvId && list.length > 0) {
                setActiveConvId(list[0].id);
            }
        });
        return () => unsub();
    }, [currentUser, activeConvId]);

    // 3. Subscribe to active conversation messages
    useEffect(() => {
        if (!currentUser || !activeConvId) {
            setMessages([]);
            return;
        }
        const unsub = conversationService.subscribeToMessages(currentUser.uid, activeConvId, (msgs) => {
            setMessages(msgs);
        });
        return () => unsub();
    }, [currentUser, activeConvId]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingText, isGenerating]);

    // Calculate Financial Health Score
    const healthScore: FinancialHealthScore = useMemo(() => {
        return aiService.calculateHealthScore(expenses, budget?.amount || 0);
    }, [expenses, budget]);

    // Handle New Conversation
    const handleNewChat = async () => {
        if (!currentUser) return;
        const newConv = await conversationService.createConversation(currentUser.uid);
        setActiveConvId(newConv.id);
        setMessages([]);
        setStreamingText('');
    };

    // Handle Rename Conversation
    const handleRenameConversation = async (id: string, newTitle: string) => {
        if (!currentUser) return;
        await conversationService.renameConversation(currentUser.uid, id, newTitle);
    };

    // Handle Delete Conversation
    const handleDeleteConversation = async (id: string) => {
        if (!currentUser) return;
        await conversationService.deleteConversation(currentUser.uid, id);
        if (activeConvId === id) {
            const remaining = conversations.filter(c => c.id !== id);
            setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
        }
    };

    // Handle Send Message
    const handleSend = async (textToSend?: string) => {
        const text = (textToSend || inputValue).trim();
        if (!text || !currentUser || isGenerating) return;

        setInputValue('');
        setIsGenerating(true);
        setStreamingText('');
        abortRef.current = false;

        let convId = activeConvId;

        // If no active conversation exists, create one dynamically
        if (!convId) {
            const newConv = await conversationService.createConversation(currentUser.uid, text);
            convId = newConv.id;
            setActiveConvId(convId);
        }

        // Add User Message to persistence
        await conversationService.addMessage(currentUser.uid, convId, 'user', text);

        // Premium plan check (Free users get upgrade prompt)
        if (!isPremium) {
            setTimeout(async () => {
                setIsGenerating(false);
                await conversationService.addMessage(
                    currentUser.uid,
                    convId!,
                    'assistant',
                    "🔒 I've analyzed your recent financial records and generated customized recommendations. Upgrade to Findash Premium to unlock full AI Copilot responses, multi-conversation history, and deep category insights!"
                );
                setIsUpgradeOpen(true);
            }, 800);
            return;
        }

        // Financial Data context packet for tool calling & context retrieval
        const financialData = {
            expenses,
            goals,
            bills,
            budget
        };

        let currentStream = '';

        try {
            const response = await aiService.generateResponse(
                text,
                messages,
                financialData,
                (chunk) => {
                    if (abortRef.current) return;
                    currentStream += chunk;
                    setStreamingText(currentStream);
                }
            );

            if (!abortRef.current) {
                // Save AI Assistant response to persistence
                await conversationService.addMessage(
                    currentUser.uid,
                    convId,
                    'assistant',
                    response.text,
                    response.toolsExecuted,
                    response.insightCard
                );
            }
        } catch (err) {
            console.error('[Findash AI] Error generating response:', err);
            await conversationService.addMessage(
                currentUser.uid,
                convId,
                'assistant',
                "Sorry, I encountered an issue retrieving your financial context. Please try asking again."
            );
        } finally {
            setIsGenerating(false);
            setStreamingText('');
        }
    };

    const handleStopGenerating = () => {
        abortRef.current = true;
        setIsGenerating(false);
        setStreamingText('');
    };

    return (
        <div className="coach-page animate-fade-in">
            <PageHeader
                title="Findash AI Copilot"
                subtitle="Your intelligent conversational financial assistant."
                icon={<Bot size={22} />}
                action={
                    <button className="header-new-chat-btn" onClick={handleNewChat}>
                        <Plus size={15} /> New Chat
                    </button>
                }
            />

            {!isPremium && (
                <div className="coach-premium-notice">
                    <Sparkles size={14} />
                    <span>You're on the free plan. <button onClick={() => setIsUpgradeOpen(true)}>Upgrade to Premium</button> for unlimited AI Copilot access.</span>
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

            {/* Workspace: Sidebar + Chat Stream */}
            <div className="ai-workspace">
                <ChatSidebar
                    conversations={conversations}
                    activeConversationId={activeConvId}
                    onSelectConversation={setActiveConvId}
                    onNewChat={handleNewChat}
                    onRenameConversation={handleRenameConversation}
                    onDeleteConversation={handleDeleteConversation}
                    isOpen={isSidebarOpen}
                    onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <div className="ai-chat-main">
                    <div className="messages-area">
                        {messages.length === 0 && !isGenerating ? (
                            <PromptSuggestions onSelectPrompt={p => handleSend(p)} />
                        ) : (
                            messages.map((msg, idx) => (
                                <ChatMessageItem
                                    key={msg.id}
                                    message={msg}
                                    isLast={idx === messages.length - 1}
                                    onRegenerate={() => handleSend(messages[messages.length - 2]?.content || msg.content)}
                                />
                            ))
                        )}

                        {/* Streaming response display */}
                        {isGenerating && streamingText && (
                            <ChatMessageItem
                                message={{
                                    id: 'streaming-msg',
                                    conversationId: activeConvId || '',
                                    role: 'assistant',
                                    content: streamingText,
                                    timestamp: new Date().toISOString()
                                }}
                                isLast={true}
                            />
                        )}

                        {/* Typing indicator before first chunk */}
                        {isGenerating && !streamingText && (
                            <div className="chat-message-row assistant animate-fade-in">
                                <div className="message-avatar"><Bot size={16} /></div>
                                <div className="message-bubble typing">
                                    <span className="dot" /><span className="dot" /><span className="dot" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <ChatInputArea
                        value={inputValue}
                        onChange={setInputValue}
                        onSend={() => handleSend()}
                        onStop={handleStopGenerating}
                        isGenerating={isGenerating}
                    />
                </div>
            </div>

            <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
        </div>
    );
};

export default AICoach;
