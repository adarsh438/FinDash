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
        const systemPrompt = `You are Findash AI, a world-class personal financial copilot and general AI assistant.
User Financial Context:
${contextAnalysis.contextBlock}

Rules:
- Be helpful, concise, analytical, and friendly.
- You CAN answer both personal financial questions using the user's Findash data AND general financial, economic, educational, and conversational questions.
- Always format currency in Indian Rupees (₹) when amounts are in INR. Format numbers cleanly (e.g. ₹24,500).
- NEVER hallucinate or invent user transactions, balances, bills, or goals not present in the user's data context.
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

    // Deterministic, zero-hallucination local financial & general intelligence engine
    generateLocalResponse: (userMessage: string, data: UserFinancialData): string => {
        const lower = userMessage.toLowerCase().trim();
        const snapshot = aiTools.get_financial_snapshot(data);
        const { currentMonthSummary, topCategories, monthOverMonth, budget, upcomingBills } = snapshot;

        // A. Greeting & General Chat
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower === 'who are you') {
            return `Hello! I'm **Findash AI**, your conversational financial copilot. 

I can answer questions about **your personal Findash account** (spending, budgets, goals, bills) as well as **general financial concepts, budgeting frameworks, and money advice**.

What would you like to ask or explore today?`;
        }

        // B. Concept Explanation Prompts (General Financial Knowledge)
        if (lower.includes('compound interest')) {
            return `### 📈 What is Compound Interest?

Compound interest is the concept of earning interest on both your initial principal amount **and** the accumulated interest from previous periods. 

#### 💡 The Formula:
$$A = P \\left(1 + \\frac{r}{n}\\right)^{nt}$$

- **P**: Initial principal amount
- **r**: Annual interest rate (decimal)
- **n**: Number of times interest compounds per year
- **t**: Number of years

#### 🌟 Why it Matters:
Start early! Small amounts invested regularly (e.g. via Monthly SIPs) grow exponentially over 10–20 years due to compounding.`;
        }

        if (lower.includes('50/30/20') || lower.includes('50 30 20')) {
            return `### 📊 The 50/30/20 Budgeting Rule

The **50/30/20 Rule** is an easy-to-follow framework for managing your income:

1. **50% Needs**: Essential expenses like rent, utilities, groceries, and minimum bill payments.
2. **30% Wants**: Discretionary spending like dining out, shopping, hobbies, and entertainment.
3. **20% Savings & Debt**: Direct allocations to emergency funds, investments (SIPs/Mutual Funds), or extra debt payments.

*Tip: You can use Findash to categorize your monthly expenses into Needs vs. Wants to track your adherence!*`;
        }

        if (lower.includes('inflation')) {
            return `### 💸 What is Inflation?

Inflation is the rate at which the general level of prices for goods and services rises over time, reducing the purchasing power of your money.

- **Example**: If annual inflation is 6%, an item that costs ₹100 today will cost ₹106 next year.
- **Key Takeaway**: Keeping all your money in a basic savings account (earning ~3%) means your real purchasing power decreases over time. Investing in assets that beat inflation (like equities or mutual funds) protects your wealth.`;
        }

        if (lower.includes('emergency fund')) {
            return `### 🛡️ What is an Emergency Fund?

An **Emergency Fund** is a stash of liquid cash set aside to cover unexpected medical bills, job transitions, or urgent repairs.

- **Recommended Size**: 3 to 6 months of essential living expenses.
- **Where to Keep It**: High-yield savings accounts or liquid mutual funds for instant accessibility.
- **In Findash**: Create a goal titled *"Emergency Fund"* under your **Goals** tab to track your progress!`;
        }

        if (lower.includes('sip') || lower.includes('mutual fund') || lower.includes('stock')) {
            return `### 💹 Stocks vs. Mutual Funds & SIPs

- **Stocks**: Direct ownership in individual companies. High potential return, but requires research and has higher volatility.
- **Mutual Funds**: Pooled investments managed by professionals across a diversified portfolio of companies.
- **SIP (Systematic Investment Plan)**: Investing a fixed amount (e.g. ₹2,000/month) on a set date into a mutual fund. It builds long-term discipline and averages out market fluctuations (*rupee cost averaging*).`;
        }

        // C. Personal Spending & Increase analysis
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

        // D. Category breakdown
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

        // E. Budget status
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

        // F. Goals status
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

        // G. Upcoming Bills
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

        // H. General Knowledge & Fallback
        return `I am Findash AI, your personal financial copilot! You can ask me:\n\n` +
            `* **Personal Data Questions**: *"Why did my expenses increase?"*, *"Am I overspending?"*, *"What bills are due soon?"*\n` +
            `* **Financial Concepts**: *"What is compound interest?"*, *"Explain the 50/30/20 rule"*, *"What is an emergency fund?"*\n` +
            `* **Money Management**: *"How to start saving?"*, *"Stocks vs Mutual Funds"*\n\n` +
            `What would you like to know?`;
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
