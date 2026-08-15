import React, { useState } from 'react';
import { MessageSquarePlus, Search, Edit3, Trash2, Check, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { type Conversation } from '../../services/conversationService';
import './ChatSidebar.css';

interface ChatSidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    onRenameConversation: (id: string, newTitle: string) => void;
    onDeleteConversation: (id: string) => void;
    isOpen: boolean;
    onToggleOpen: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    onRenameConversation,
    onDeleteConversation,
    isOpen,
    onToggleOpen
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const filteredConversations = conversations.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleStartEdit = (e: React.MouseEvent, c: Conversation) => {
        e.stopPropagation();
        setEditingId(c.id);
        setEditTitle(c.title);
    };

    const handleSaveEdit = (e: React.MouseEvent | React.FormEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        if (editTitle.trim()) {
            onRenameConversation(id, editTitle.trim());
        }
        setEditingId(null);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onDeleteConversation(id);
    };

    return (
        <>
            {/* Toggle button for mobile/collapsed view */}
            <button className="sidebar-toggle-btn" onClick={onToggleOpen} title="Toggle Chat History">
                {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            <aside className={`ai-chat-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <button className="new-chat-btn" onClick={onNewChat}>
                        <MessageSquarePlus size={16} />
                        <span>New Conversation</span>
                    </button>
                </div>

                <div className="sidebar-search">
                    <Search size={14} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                            <X size={12} />
                        </button>
                    )}
                </div>

                <div className="conversations-list">
                    {filteredConversations.length === 0 ? (
                        <div className="sidebar-empty">
                            <p>{searchQuery ? 'No matching chats' : 'No history yet'}</p>
                        </div>
                    ) : (
                        filteredConversations.map(c => {
                            const isActive = c.id === activeConversationId;
                            const isEditing = c.id === editingId;

                            return (
                                <div
                                    key={c.id}
                                    className={`conversation-item ${isActive ? 'active' : ''}`}
                                    onClick={() => onSelectConversation(c.id)}
                                >
                                    {isEditing ? (
                                        <form className="inline-edit-form" onSubmit={e => handleSaveEdit(e, c.id)}>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={e => setEditTitle(e.target.value)}
                                                autoFocus
                                            />
                                            <button type="button" onClick={e => handleSaveEdit(e, c.id)}><Check size={13} /></button>
                                            <button type="button" onClick={() => setEditingId(null)}><X size={13} /></button>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="conversation-info">
                                                <h4 className="conversation-title">{c.title}</h4>
                                                {c.lastMessage && (
                                                    <p className="conversation-preview">{c.lastMessage}</p>
                                                )}
                                            </div>

                                            <div className="conversation-actions">
                                                <button
                                                    className="action-icon-btn"
                                                    onClick={e => handleStartEdit(e, c)}
                                                    title="Rename"
                                                >
                                                    <Edit3 size={13} />
                                                </button>
                                                <button
                                                    className="action-icon-btn delete"
                                                    onClick={e => handleDelete(e, c.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </aside>
        </>
    );
};

export default ChatSidebar;
