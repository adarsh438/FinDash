import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Target, Calendar } from 'lucide-react';
import './PromptSuggestions.css';

interface PromptSuggestionsProps {
    onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
    {
        icon: <TrendingUp size={16} />,
        title: 'Analyze Spending',
        prompt: 'Why did my expenses increase this month?'
    },
    {
        icon: <AlertTriangle size={16} />,
        title: 'Check Overspending',
        prompt: 'Where am I overspending and how can I reduce it?'
    },
    {
        icon: <Calendar size={16} />,
        title: 'Upcoming Bills',
        prompt: 'What bills are due soon?'
    },
    {
        icon: <Target size={16} />,
        title: 'Savings Goals',
        prompt: 'Am I on track to reach my savings goals?'
    }
];

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
    return (
        <div className="prompt-suggestions-container">
            <div className="prompt-suggestions-header">
                <Sparkles size={20} className="sparkles-icon" />
                <h3>How can Findash AI help you today?</h3>
                <p>Select a quick topic or type your custom financial question below.</p>
            </div>

            <div className="prompt-suggestions-grid">
                {SUGGESTIONS.map((s, idx) => (
                    <button
                        key={idx}
                        className="prompt-card"
                        onClick={() => onSelectPrompt(s.prompt)}
                    >
                        <div className="prompt-card-icon">{s.icon}</div>
                        <div className="prompt-card-content">
                            <h4>{s.title}</h4>
                            <p>"{s.prompt}"</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PromptSuggestions;
