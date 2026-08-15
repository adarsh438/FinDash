import { aiTools, type UserFinancialData } from './aiTools';

export interface ContextAnalysisResult {
    intent: string;
    toolsExecuted: string[];
    contextBlock: string;
    snapshot: any;
}

export const financialContextService = {
    // Detect intent and assemble optimized data context for LLM prompt
    buildContextForQuery: (query: string, data: UserFinancialData): ContextAnalysisResult => {
        const lower = query.toLowerCase().trim();
        const toolsExecuted: string[] = [];
        const contextParts: string[] = [];

        // 1. Spending analysis / increase intent
        if (lower.includes('increase') || lower.includes('more money') || lower.includes('spending higher') || lower.includes('why spent')) {
            const comparison = aiTools.get_monthly_comparison(data);
            const categories = aiTools.get_expense_by_category(data);
            const summary = aiTools.get_transaction_summary(data, 'current_month');
            toolsExecuted.push('get_monthly_comparison', 'get_expense_by_category', 'get_transaction_summary');

            contextParts.push(`Monthly Comparison: Spent ₹${comparison.currentMonthSpent} this month vs ₹${comparison.prevMonthSpent} last month (${comparison.percentageChange} change).`);
            contextParts.push(`Top Categories: ${(categories.categories || []).slice(0, 5).map(c => `${c.category}: ₹${c.amount} (${c.percentage})`).join(', ')}`);
            contextParts.push(`Current Month Summary: Income ₹${summary.totalIncome}, Expenses ₹${summary.totalExpenses}, Net Savings ₹${summary.netSavings}.`);
        }
        // 2. Category spending intent
        else if (lower.includes('food') || lower.includes('dining') || lower.includes('shopping') || lower.includes('rent') || lower.includes('travel') || lower.includes('category') || lower.includes('spent on')) {
            const categories = aiTools.get_expense_by_category(data);
            toolsExecuted.push('get_expense_by_category');
            contextParts.push(`Category Breakdown: ${(categories.categories || []).map(c => `${c.category}: ₹${c.amount} (${c.percentage})`).join('; ')}`);
        }
        // 3. Budget / overspending intent
        else if (lower.includes('budget') || lower.includes('overspending') || lower.includes('limit') || lower.includes('afford')) {
            const budgetStatus = aiTools.get_budget_status(data);
            toolsExecuted.push('get_budget_status');
            contextParts.push(`Budget Status: Limit ₹${budgetStatus.budgetLimit}, Spent ₹${budgetStatus.currentMonthSpent}, Remaining ₹${budgetStatus.remaining} (${budgetStatus.percentageUsed} used, ${budgetStatus.daysRemaining} days left).`);
        }
        // 4. Goals intent
        else if (lower.includes('goal') || lower.includes('saving target') || lower.includes('reach') || lower.includes('laptop') || lower.includes('trip')) {
            const goals = aiTools.get_goals(data);
            toolsExecuted.push('get_goals');
            contextParts.push(`Goals Progress: ${goals.goals.map(g => `"${g.title}": Saved ₹${g.currentAmount}/₹${g.targetAmount} (${g.progressPercentage}, Deadline: ${g.deadline})`).join('; ')}`);
        }
        // 5. Bills intent
        else if (lower.includes('bill') || lower.includes('due') || lower.includes('recurring') || lower.includes('subscription')) {
            const upcoming = aiTools.get_upcoming_bills(data, 30);
            toolsExecuted.push('get_upcoming_bills', 'get_bill_summary');
            contextParts.push(`Upcoming Bills (30d): Total ₹${upcoming.totalDue} across ${upcoming.count} bills.`);
            contextParts.push(`Bill Details: ${upcoming.bills.map(b => `${b.title}: ₹${b.amount} due in ${b.daysLeft} days (${b.dueDate})`).join('; ')}`);
        }
        // 6. Default full snapshot for general question
        else {
            const snapshot = aiTools.get_financial_snapshot(data);
            toolsExecuted.push('get_financial_snapshot');
            contextParts.push(`Current Month Spent: ₹${snapshot.currentMonthSummary.totalExpenses}, Income: ₹${snapshot.currentMonthSummary.totalIncome}`);
            contextParts.push(`Top Categories: ${snapshot.topCategories.map(c => `${c.category}: ₹${c.amount}`).join(', ')}`);
            contextParts.push(`Month over Month: ${snapshot.monthOverMonth.percentageChange} change`);
            contextParts.push(`Budget: ₹${snapshot.budget.currentMonthSpent}/₹${snapshot.budget.budgetLimit} (${snapshot.budget.percentageUsed})`);
            contextParts.push(`Active Goals: ${snapshot.goalsOverview.total} goals (${snapshot.goalsOverview.completed} completed)`);
            contextParts.push(`Upcoming Bills: ${snapshot.upcomingBills.count} bills due (₹${snapshot.upcomingBills.totalDue})`);
        }

        const snapshot = aiTools.get_financial_snapshot(data);

        return {
            intent: toolsExecuted.join('+'),
            toolsExecuted,
            contextBlock: contextParts.join('\n'),
            snapshot
        };
    }
};
