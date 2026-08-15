import { financialContextService } from './financialContextService';
import { aiTools, type UserFinancialData } from './aiTools';
import { type ConversationMessage, type InsightCardData } from './conversationService';

export interface OrchestratorResponse {
    text: string;
    toolsExecuted: string[];
    insightCard?: InsightCardData;
}

export const aiOrchestrator = {
    // Generate streaming or full AI response using financial context & tool execution
    processUserMessage: async (
        userMessage: string,
        history: ConversationMessage[],
        financialData: UserFinancialData,
        onChunk?: (chunk: string) => void
    ): Promise<OrchestratorResponse> => {
        // 1. Build targeted financial context & tool results
        const contextAnalysis = financialContextService.buildContextForQuery(userMessage, financialData);

        // 2. Format conversation history context window (last 6 messages for short-term memory)
        const recentHistory = history
            .slice(-6)
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n');

        // 3. System prompt construction with strict behavior rules
        const systemPrompt = `You are Findash AI, a world-class personal financial copilot.
User Financial Context:
${contextAnalysis.contextBlock}

Rules:
- Be helpful, concise, analytical, and encouraging.
- Always format currency in Indian Rupees (₹) when amounts are in INR. Format numbers cleanly (e.g. ₹24,500).
- NEVER hallucinate or invent transactions, balances, bills, or goals not present in the user's data context.
- If data is unavailable, clearly state: "I don't have enough information in your Findash data to determine that."
- Use markdown tables, bold highlights, and bullet lists for clarity.`;

        const geminiApiKey = (import.meta.env as any).VITE_GEMINI_API_KEY || (import.meta.env as any).GEMINI_API_KEY || '';

        let fullText = '';
        let insightCard: InsightCardData | undefined = undefined;

        // Try calling Gemini API if key is present
        if (geminiApiKey) {
            try {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${geminiApiKey}`;
                const payload = {
                    contents: [
                        { role: 'user', parts: [{ text: `${systemPrompt}\n\nRecent History:\n${recentHistory}\n\nUser Question: ${userMessage}` }] }
                    ]
                };

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok && response.body) {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value, { stream: true });

                        // Extract text parts from SSE stream
                        const matches = chunk.match(/"text":\s*"([^"]+)"/g);
                        if (matches) {
                            for (const match of matches) {
                                const parsed = match.replace(/"text":\s*"/, '').replace(/"$/, '').replace(/\\n/g, '\n');
                                fullText += parsed;
                                if (onChunk) onChunk(parsed);
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn('[Findash AI] Gemini API call failed, using intelligent local engine:', err);
            }
        }

        // 4. Intelligent Local Engine (Fallback / Primary Offline Execution)
        if (!fullText) {
            fullText = aiOrchestrator.generateLocalResponse(userMessage, financialData);

            // Simulate progressive streaming effect for smooth UX
            if (onChunk) {
                const words = fullText.split(' ');
                let current = '';
                for (let i = 0; i < words.length; i++) {
                    const word = words[i] + (i === words.length - 1 ? '' : ' ');
                    current += word;
                    onChunk(word);
                    await new Promise(r => setTimeout(r, 20));
                }
            }
        }

        // 5. Generate appropriate Insight Card if relevant
        insightCard = aiOrchestrator.generateInsightCard(userMessage, financialData);

        return {
            text: fullText,
            toolsExecuted: contextAnalysis.toolsExecuted,
            insightCard
        };
    },

    // Deterministic, zero-hallucination local financial reasoning engine
    generateLocalResponse: (userMessage: string, data: UserFinancialData): string => {
        const lower = userMessage.toLowerCase().trim();
        const snapshot = aiTools.get_financial_snapshot(data);
        const { currentMonthSummary, topCategories, monthOverMonth, budget, goalsOverview, upcomingBills } = snapshot;

        // A. Greeting
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return `Hello! I'm **Findash AI**, your personal financial copilot. I'm connected to your real transactions, budgets, goals, and bills.\n\nHere's what I can do for you:\n* **Analyze spending trends & overspending**\n* **Check budget status & savings rate**\n* **Track financial goals & deadline progress**\n* **Remind you of upcoming bills**\n\nWhat would you like to explore today?`;
        }

        // B. Spending & Increase analysis
        if (lower.includes('increase') || lower.includes('more money') || lower.includes('spending higher') || lower.includes('why spent') || lower.includes('why am i spending')) {
            let res = `### 📊 Monthly Spending Analysis\n\n`;
            res += `This month you have spent **₹${currentMonthSummary.totalExpenses.toLocaleString()}**, compared to **₹${monthOverMonth.prevMonthSpent.toLocaleString()}** last month.`;

            if (monthOverMonth.difference > 0) {
                res += ` That's an increase of **${monthOverMonth.percentageChange}** (+₹${monthOverMonth.difference.toLocaleString()}).\n\n`;
            } else {
                res += ` That's a decrease of **${Math.abs(parseFloat(monthOverMonth.percentageChange))}%** (-₹${Math.abs(monthOverMonth.difference).toLocaleString()}). Great job keeping outflows down!\n\n`;
            }

            const cats = topCategories || [];
            if (cats.length > 0) {
                res += `#### Top Spending Categories:\n`;
                res += `| Category | Amount | % of Total |\n| :--- | :--- | :--- |\n`;
                cats.forEach(c => {
                    res += `| **${c.category.charAt(0).toUpperCase() + c.category.slice(1)}** | ₹${c.amount.toLocaleString()} | ${c.percentage} |\n`;
                });
                res += `\n**Key Finding**: The **${cats[0].category}** category accounts for the highest portion of your spending.`;
            }

            return res;
        }

        // C. Category breakdown
        if (lower.includes('food') || lower.includes('dining') || lower.includes('shopping') || lower.includes('rent') || lower.includes('category') || lower.includes('spent on')) {
            const categories = aiTools.get_expense_by_category(data);

            const catList = categories.categories || [];
            if (catList.length === 0) {
                return "I don't see any recorded category expenses for this month in your Findash data.";
            }

            let res = `### 🛒 Category Spending Breakdown\n\nTotal Category Outflow: **₹${(categories.totalSpent || 0).toLocaleString()}**\n\n`;
            res += `| Category | Amount | Share |\n| :--- | :--- | :--- |\n`;
            catList.forEach(c => {
                res += `| ${c.category.charAt(0).toUpperCase() + c.category.slice(1)} | ₹${c.amount.toLocaleString()} | ${c.percentage} |\n`;
            });

            return res;
        }

        // D. Budget status
        if (lower.includes('budget') || lower.includes('overspending') || lower.includes('limit') || lower.includes('am i overspending')) {
            if (budget.budgetLimit === 0) {
                return `You haven't set a monthly budget limit yet in Findash.\n\nCurrently, you've spent **₹${budget.currentMonthSpent.toLocaleString()}** this month. Go to **Expenses** to configure your monthly budget goal!`;
            }

            let res = `### 🎯 Budget Adherence Status\n\n`;
            res += `* **Monthly Budget**: ₹${budget.budgetLimit.toLocaleString()}\n`;
            res += `* **Spent so far**: ₹${budget.currentMonthSpent.toLocaleString()} (${budget.percentageUsed})\n`;
            res += `* **Remaining**: ₹${budget.remaining.toLocaleString()}\n`;
            res += `* **Days Left in Month**: ${budget.daysRemaining} days\n\n`;

            if (budget.isOverBudget) {
                res += `⚠️ **Alert**: You have exceeded your monthly budget by **₹${(budget.currentMonthSpent - budget.budgetLimit).toLocaleString()}**. Consider pausing non-essential purchases for the remainder of the month.`;
            } else {
                const dailyAllowance = budget.daysRemaining > 0 ? Math.round(budget.remaining / budget.daysRemaining) : 0;
                res += `✅ You are within budget! You can spend up to **₹${dailyAllowance.toLocaleString()}/day** for the rest of the month.`;
            }

            return res;
        }

        // E. Goals status
        if (lower.includes('goal') || lower.includes('saving target') || lower.includes('reach') || lower.includes('laptop') || lower.includes('trip')) {
            const goals = aiTools.get_goals(data);

            if (goals.totalGoals === 0) {
                return "You don't have any financial goals created yet. Head over to the **Goals** tab to set up a new target!";
            }

            let res = `### 🏆 Financial Goals Progress\n\n`;
            res += `You have **${goals.totalGoals} active goal(s)** (${goals.completedGoals} completed):\n\n`;
            goals.goals.forEach(g => {
                const status = g.isCompleted ? '🎉 Complete!' : `${g.progressPercentage} funded`;
                res += `* **${g.title}**: Saved **₹${g.currentAmount.toLocaleString()}** of ₹${g.targetAmount.toLocaleString()} (${status}) — *Deadline: ${g.deadline}*\n`;
            });

            return res;
        }

        // F. Upcoming Bills
        if (lower.includes('bill') || lower.includes('due') || lower.includes('recurring') || lower.includes('subscription')) {
            if (upcomingBills.count === 0) {
                return "Good news! You have no upcoming unpaid bills recorded for the next 30 days.";
            }

            let res = `### 📅 Upcoming Bills & Payments\n\n`;
            res += `You have **${upcomingBills.count} bill(s)** due soon, totaling **₹${upcomingBills.totalDue.toLocaleString()}**:\n\n`;
            res += `| Bill Title | Amount | Due Date | Status |\n| :--- | :--- | :--- | :--- |\n`;
            upcomingBills.bills.forEach(b => {
                const dueText = b.daysLeft === 0 ? '⚠️ Due Today' : b.daysLeft < 0 ? `🚨 ${Math.abs(b.daysLeft)}d Overdue` : `${b.daysLeft} days left`;
                res += `| **${b.title}** | ₹${b.amount.toLocaleString()} | ${b.dueDate} | ${dueText} |\n`;
            });

            return res;
        }

        // G. General Financial Health / Snapshot
        return `### 💡 Findash Financial Health Snapshot\n\n` +
            `* **This Month's Spending**: ₹${currentMonthSummary.totalExpenses.toLocaleString()}\n` +
            `* **This Month's Income**: ₹${currentMonthSummary.totalIncome.toLocaleString()}\n` +
            `* **Month-over-Month Trend**: ${monthOverMonth.percentageChange}\n` +
            `* **Budget Used**: ${budget.percentageUsed} (${budget.daysRemaining} days left)\n` +
            `* **Active Goals**: ${goalsOverview.total} (${goalsOverview.completed} completed)\n` +
            `* **Upcoming Bills**: ${upcomingBills.count} bills (₹${upcomingBills.totalDue.toLocaleString()})\n\n` +
            `Ask me anything specific like: *"Why did my expenses increase?"*, *"Am I overspending?"*, or *"What bills are due soon?"*`;
    },

    // Structure a visual InsightCard based on context
    generateInsightCard: (userMessage: string, data: UserFinancialData): InsightCardData | undefined => {
        const lower = userMessage.toLowerCase();
        const snapshot = aiTools.get_financial_snapshot(data);

        if (lower.includes('increase') || lower.includes('spend') || lower.includes('more money') || lower.includes('overspending')) {
            const topCat = (snapshot.topCategories || [])[0];
            return {
                type: 'spending',
                title: 'Spending Pattern Alert',
                subtitle: `Month-over-month trend: ${snapshot.monthOverMonth.percentageChange}`,
                value: `₹${snapshot.currentMonthSummary.totalExpenses.toLocaleString()}`,
                detail: topCat ? `Top outflow: ${topCat.category} (₹${topCat.amount.toLocaleString()})` : 'Calculated from Findash transactions'
            };
        }

        if (lower.includes('budget')) {
            return {
                type: 'savings',
                title: 'Monthly Budget Status',
                subtitle: `${snapshot.budget.percentageUsed} of budget used`,
                value: `₹${snapshot.budget.remaining.toLocaleString()} left`,
                detail: `${snapshot.budget.daysRemaining} days remaining in cycle`
            };
        }

        if (lower.includes('bill') || lower.includes('due')) {
            return {
                type: 'bill',
                title: 'Bill Reminder',
                subtitle: `${snapshot.upcomingBills.count} bills due within 30 days`,
                value: `₹${snapshot.upcomingBills.totalDue.toLocaleString()}`,
                detail: snapshot.upcomingBills.bills[0] ? `Next due: ${snapshot.upcomingBills.bills[0].title} on ${snapshot.upcomingBills.bills[0].dueDate}` : 'All bills up to date'
            };
        }

        if (lower.includes('goal')) {
            return {
                type: 'goal',
                title: 'Goals Progress',
                subtitle: `${snapshot.goalsOverview.completed} of ${snapshot.goalsOverview.total} goals completed`,
                value: `${snapshot.goalsOverview.total} Active Goals`,
                detail: 'Track your targets on the Goals tab'
            };
        }

        return undefined;
    }
};
