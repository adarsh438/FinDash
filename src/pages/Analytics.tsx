import { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Lock, Sparkles, PieChart } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import DonutChart from '../components/DonutChart';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import './Analytics.css';

const CATEGORY_COLORS: Record<string, string> = {
    food:            '#f59e0b',
    rent_hostel:     '#8b5cf6',
    travel:          '#06b6d4',
    subscriptions:   '#ec4899',
    study_materials: '#f472b6',
    other:           '#64748b',
};

const Analytics = () => {
    const { userProfile } = useAuth();
    const { formatCurrency } = useCurrency();
    const { expenses, currentMonthExpenses, currentMonthSpend, currentMonthIncome } = useExpenses();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const isPremium = userProfile?.isPremium;

    // Weekly spending (last 7 days)
    const weeklyData = (() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const total = expenses
                .filter(e => e.date === dateStr && e.category !== 'income')
                .reduce((s, e) => s + e.amount, 0);
            return {
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                amount: total,
                date: dateStr,
            };
        });
        return days;
    })();

    const maxWeekly = Math.max(...weeklyData.map(d => d.amount), 1);

    // Category breakdown
    const categoryTotals = currentMonthExpenses
        .filter(e => e.category !== 'income')
        .reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {} as Record<string, number>);

    const donutSegments = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, val]) => ({
            value: val,
            color: CATEGORY_COLORS[cat] || '#64748b',
            label: cat.replace('_', ' '),
        }));

    const savingsRate = currentMonthIncome > 0
        ? ((currentMonthIncome - currentMonthSpend) / currentMonthIncome) * 100
        : 0;

    const budgetUtilisation = (() => {
        const topCat = donutSegments[0];
        return topCat ? Math.round((topCat.value / currentMonthSpend) * 100) : 0;
    })();

    return (
        <div className="analytics-page animate-fade-in">
            <PageHeader
                title="Analytics"
                subtitle="Understand your spending patterns at a glance."
                icon={<BarChart3 size={22} />}
            />

            {!isPremium && (
                <div className="analytics-gate">
                    <div className="gate-card animate-fade-in-scale">
                        <div className="gate-icon">
                            <Lock size={28} />
                        </div>
                        <h2>Unlock Full Analytics</h2>
                        <p>Get rich charts, savings insights, category breakdowns, and trend analysis — all with Premium.</p>
                        <Button onClick={() => setIsUpgradeModalOpen(true)} size="lg">
                            Upgrade to Premium
                        </Button>
                    </div>
                    <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
                </div>
            )}

            <div className={`analytics-content ${!isPremium ? 'blurred' : ''}`}>
                {/* Summary Stats */}
                <div className="analytics-stats stagger-children">
                    <StatCard
                        label="This Month's Spend"
                        value={formatCurrency(currentMonthSpend)}
                        icon={<Calendar size={18} />}
                        accentColor="var(--accent-danger)"
                    />
                    <StatCard
                        label="Savings Rate"
                        value={`${Math.max(savingsRate, 0).toFixed(1)}%`}
                        icon={<TrendingUp size={18} />}
                        accentColor={savingsRate >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'}
                        trend={savingsRate}
                    />
                    <StatCard
                        label="Top Category"
                        value={donutSegments[0]?.label || '—'}
                        icon={<Sparkles size={18} />}
                        accentColor={donutSegments[0]?.color || 'var(--accent-primary)'}
                    />
                </div>

                {/* Charts Row */}
                <div className="analytics-charts">
                    {/* Weekly Bar Chart */}
                    <Card className="chart-card flat">
                        <h3 className="chart-title">
                            <BarChart3 size={16} /> Spending — Last 7 Days
                        </h3>
                        <div className="bar-chart">
                            {weeklyData.map((day) => {
                                const pct = maxWeekly > 0 ? (day.amount / maxWeekly) * 100 : 0;
                                const isToday = day.date === new Date().toISOString().split('T')[0];
                                return (
                                    <div key={day.date} className="bar-col">
                                        {day.amount > 0 && (
                                            <span className="bar-value">{formatCurrency(day.amount)}</span>
                                        )}
                                        <div className="bar-track">
                                            <div
                                                className={`bar-fill ${isToday ? 'today' : ''}`}
                                                style={{ height: `${Math.max(pct, 2)}%` }}
                                                title={`${day.day}: ${formatCurrency(day.amount)}`}
                                            />
                                        </div>
                                        <span className={`bar-label ${isToday ? 'today' : ''}`}>{day.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Category Donut */}
                    <Card className="chart-card flat">
                        <h3 className="chart-title">
                            <PieChart size={16} /> Category Breakdown
                        </h3>
                        {donutSegments.length > 0 ? (
                            <div className="donut-section">
                                <DonutChart
                                    segments={donutSegments}
                                    size={180}
                                    strokeWidth={20}
                                    centerValue={formatCurrency(currentMonthSpend)}
                                    centerLabel="total"
                                />
                                <div className="donut-legend">
                                    {donutSegments.map((seg) => {
                                        const pct = currentMonthSpend > 0
                                            ? ((seg.value / currentMonthSpend) * 100).toFixed(1)
                                            : '0';
                                        return (
                                            <div key={seg.label} className="legend-item">
                                                <span className="legend-dot" style={{ backgroundColor: seg.color }} />
                                                <span className="legend-label">{seg.label}</span>
                                                <span className="legend-pct">{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="chart-empty">
                                <PieChart size={36} style={{ opacity: 0.2 }} />
                                <p>No expense data yet</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Insights */}
                {donutSegments.length > 0 && (
                    <Card className="insights-card flat">
                        <h3 className="chart-title">
                            <Sparkles size={16} /> Key Insights
                        </h3>
                        <div className="insights-grid">
                            <div className="insight-item">
                                <span className="insight-emoji">📊</span>
                                <div>
                                    <strong>{donutSegments[0]?.label}</strong> is your biggest category
                                    at <strong>{budgetUtilisation}%</strong> of spending.
                                </div>
                            </div>
                            <div className="insight-item">
                                <span className="insight-emoji">
                                    {savingsRate >= 20 ? '🚀' : savingsRate >= 0 ? '💡' : '⚠️'}
                                </span>
                                <div>
                                    {savingsRate >= 20
                                        ? `Excellent! You're saving ${savingsRate.toFixed(1)}% of your income.`
                                        : savingsRate >= 0
                                        ? `You're saving ${savingsRate.toFixed(1)}%. Try to reach 20%.`
                                        : `You're spending more than you earn. Review your budget.`}
                                </div>
                            </div>
                            <div className="insight-item">
                                <span className="insight-emoji">🗓️</span>
                                <div>
                                    {weeklyData.filter(d => d.amount > 0).length} active spending
                                    days out of the last 7.
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Analytics;
