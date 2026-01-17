import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<Currency>('USD');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
