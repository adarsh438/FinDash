import React, { useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import './ChatInputArea.css';

interface ChatInputAreaProps {
    value: string;
    onChange: (val: string) => void;
    onSend: () => void;
    onStop?: () => void;
    isGenerating: boolean;
    disabled?: boolean;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
    value,
    onChange,
    onSend,
    onStop,
    isGenerating,
    disabled = false
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea height up to 160px
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isGenerating && !disabled) {
                onSend();
            }
        }
    };

    return (
        <div className="chat-input-wrapper">
            <div className="chat-input-box">
                <textarea
                    ref={textareaRef}
                    className="chat-textarea"
                    placeholder="Ask Findash AI about your spending, budget, bills, or goals..."
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={disabled}
                />

                <div className="chat-input-actions">
                    {isGenerating ? (
                        <button
                            className="input-btn stop-btn"
                            onClick={onStop}
                            title="Stop generating"
                            type="button"
                        >
                            <Square size={14} fill="currentColor" />
                        </button>
                    ) : (
                        <button
                            className="input-btn send-btn"
                            onClick={onSend}
                            disabled={!value.trim() || disabled}
                            title="Send message (Enter)"
                            type="button"
                        >
                            <Send size={15} />
                        </button>
                    )}
                </div>
            </div>
            <div className="chat-input-footer">
                <span>Findash AI uses your authentic transaction data. Press <strong>Shift + Enter</strong> for line break.</span>
            </div>
        </div>
    );
};

export default ChatInputArea;
