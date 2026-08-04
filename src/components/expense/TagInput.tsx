import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

const SUGGESTED_TAGS = ['Office', 'Friends', 'Trip', 'Personal', 'Family'];

const TagInput: React.FC<TagInputProps> = ({ tags, onChange }) => {
    const [inputValue, setInputValue] = useState('');

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInputValue('');
    };

    const removeTag = (tag: string) => {
        onChange(tags.filter(t => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    const availableSuggestions = SUGGESTED_TAGS.filter(t => !tags.includes(t));

    return (
        <div>
            <p className="expense-section-label">🔖 Tags</p>
            <div className="tag-input-container">
                <AnimatePresence>
                    {tags.map(tag => (
                        <motion.span
                            key={tag}
                            className="tag-chip"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                            {tag}
                            <button
                                className="tag-chip-remove"
                                onClick={() => removeTag(tag)}
                                type="button"
                                aria-label={`Remove tag ${tag}`}
                            >
                                ×
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>
                <input
                    className="tag-text-input"
                    placeholder={tags.length === 0 ? 'Add tags...' : ''}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Add tag"
                />
            </div>
            {availableSuggestions.length > 0 && (
                <div className="tag-suggestions">
                    {availableSuggestions.map(tag => (
                        <button
                            key={tag}
                            className="tag-suggest-btn"
                            onClick={() => addTag(tag)}
                            type="button"
                        >
                            + {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagInput;
