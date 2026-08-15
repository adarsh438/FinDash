import React from 'react';
import { TrendingUp, ShieldAlert, Target, Calendar, Activity } from 'lucide-react';
import { type InsightCardData } from '../../services/conversationService';
import './InsightCard.css';

interface InsightCardProps {
    card: InsightCardData;
}

const InsightCard: React.FC<InsightCardProps> = ({ card }) => {
    const getIcon = () => {
        switch (card.type) {
            case 'spending':
                return <ShieldAlert size={18} className="insight-icon alert" />;
            case 'savings':
                return <TrendingUp size={18} className="insight-icon success" />;
            case 'bill':
                return <Calendar size={18} className="insight-icon warning" />;
            case 'goal':
                return <Target size={18} className="insight-icon goal" />;
            case 'health':
            default:
                return <Activity size={18} className="insight-icon health" />;
        }
    };

    return (
        <div className={`insight-card insight-${card.type}`}>
            <div className="insight-card-top">
                <div className="insight-title-group">
                    {getIcon()}
                    <div>
                        <h4 className="insight-title">{card.title}</h4>
                        <p className="insight-subtitle">{card.subtitle}</p>
                    </div>
                </div>
                <div className="insight-value">{card.value}</div>
            </div>
            <div className="insight-detail">{card.detail}</div>
        </div>
    );
};

export default InsightCard;
