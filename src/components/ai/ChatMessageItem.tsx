import React, { useState } from 'react';
import { Bot, User as UserIcon, Copy, Check, ThumbsUp, ThumbsDown, RotateCw } from 'lucide-react';
import { type ConversationMessage } from '../../services/conversationService';
import InsightCard from './InsightCard';
import './ChatMessageItem.css';

interface ChatMessageItemProps {
    message: ConversationMessage;
    isLast: boolean;
    onRegenerate?: () => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, isLast, onRegenerate }) => {
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to render basic Markdown content (Bold, Lists, Code, Tables) safely
    const renderMarkdown = (content: string) => {
        const lines = content.split('\n');
        const elements: React.ReactNode[] = [];
        let inTable = false;
        let tableRows: string[][] = [];

        lines.forEach((line, lineIdx) => {
            const trimmed = line.trim();

            // Table parsing
            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                inTable = true;
                const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
                tableRows.push(cells);
                return;
            } else if (inTable) {
                // Render accumulated table
                elements.push(renderTable(tableRows, `table-${lineIdx}`));
                inTable = false;
                tableRows = [];
            }

            // Headers
            if (trimmed.startsWith('### ')) {
                elements.push(<h4 key={lineIdx} className="md-h3">{renderFormattedInline(trimmed.substring(4))}</h4>);
                return;
            }
            if (trimmed.startsWith('#### ')) {
                elements.push(<h5 key={lineIdx} className="md-h4">{renderFormattedInline(trimmed.substring(5))}</h5>);
                return;
            }

            // Bullet list
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                elements.push(
                    <li key={lineIdx} className="md-li">
                        {renderFormattedInline(trimmed.substring(2))}
                    </li>
                );
                return;
            }

            // Empty line
            if (trimmed === '') {
                elements.push(<div key={lineIdx} className="md-spacer" />);
                return;
            }

            // Paragraph
            elements.push(<p key={lineIdx} className="md-p">{renderFormattedInline(line)}</p>);
        });

        if (inTable && tableRows.length > 0) {
            elements.push(renderTable(tableRows, 'table-end'));
        }

        return elements;
    };

    // Render table
    const renderTable = (rows: string[][], key: string) => {
        if (rows.length < 2) return null;
        const header = rows[0];
        const isDelimiter = (r: string[]) => r.every(c => c.includes('---') || c.includes(':---'));
        const bodyRows = rows.slice(1).filter(r => !isDelimiter(r));

        return (
            <div key={key} className="md-table-wrapper">
                <table className="md-table">
                    <thead>
                        <tr>
                            {header.map((col, idx) => (
                                <th key={idx}>{renderFormattedInline(col)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bodyRows.map((row, rIdx) => (
                            <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx}>{renderFormattedInline(cell)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Render inline bold & highlights
    const renderFormattedInline = (text: string): React.ReactNode => {
        const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={idx} className="md-code">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    const isUser = message.role === 'user';
    const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className={`chat-message-row ${isUser ? 'user' : 'assistant'} animate-fade-in`}>
            <div className="message-avatar">
                {isUser ? <UserIcon size={16} /> : <Bot size={16} />}
            </div>

            <div className="message-bubble-container">
                <div className="message-bubble">
                    {renderMarkdown(message.content)}

                    {message.insightCard && (
                        <InsightCard card={message.insightCard} />
                    )}

                    <span className="message-timestamp">{formattedTime}</span>
                </div>

                {!isUser && (
                    <div className="message-actions-bar">
                        <button className="action-btn" onClick={handleCopy} title="Copy message">
                            {copied ? <Check size={13} className="success-icon" /> : <Copy size={13} />}
                        </button>
                        <button
                            className={`action-btn ${feedback === 'liked' ? 'active' : ''}`}
                            onClick={() => setFeedback(feedback === 'liked' ? null : 'liked')}
                            title="Good response"
                        >
                            <ThumbsUp size={13} />
                        </button>
                        <button
                            className={`action-btn ${feedback === 'disliked' ? 'active' : ''}`}
                            onClick={() => setFeedback(feedback === 'disliked' ? null : 'disliked')}
                            title="Bad response"
                        >
                            <ThumbsDown size={13} />
                        </button>

                        {isLast && onRegenerate && (
                            <button className="action-btn" onClick={onRegenerate} title="Regenerate response">
                                <RotateCw size={13} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessageItem;
