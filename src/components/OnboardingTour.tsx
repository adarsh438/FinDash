import React, { useEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';

const OnboardingTour = () => {
    const [showTour, setShowTour] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('fin_app_tour_seen');
        if (!hasSeenTour) {
            // Delay slightly to let page load
            setTimeout(() => setShowTour(true), 1500);
        }
    }, []);

    const handleDismiss = () => {
        setShowTour(false);
        localStorage.setItem('fin_app_tour_seen', 'true');
    };

    const steps = [
        {
            title: "Welcome to FinDash! 🚀",
            desc: "Your new financial command center. Let's take a quick look around.",
            position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        },
        {
            title: "AI Coach 🧠",
            desc: "Get personalized insights and savings tips here. It learns from your spending!",
            position: { top: '200px', left: '260px' } // Approx sidebar location
        },
        {
            title: "Quick Actions ⚡",
            desc: "Add expenses or income instantly with the + button.",
            position: { top: '100px', right: '50px' }
        }
    ];

    if (!showTour) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            pointerEvents: 'none' // Allow clicking through backdrop? No, blocking is better for focus.
        }}>
            {/* Dimmed Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                pointerEvents: 'auto'
            }} onClick={handleDismiss} />

            {/* Tour Card */}
            <div style={{
                position: 'absolute',
                ...steps[step].position,
                background: 'rgba(30, 30, 40, 0.95)',
                border: '1px solid var(--accent-primary)',
                padding: '1.5rem',
                borderRadius: '16px',
                width: '320px',
                color: 'white',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                pointerEvents: 'auto',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <button
                    onClick={handleDismiss}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    <X size={18} />
                </button>

                <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.2rem' }}>{steps[step].title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>{steps[step].desc}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {steps.map((_, i) => (
                            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === step ? 'var(--accent-primary)' : 'var(--glass-border)' }} />
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            if (step < steps.length - 1) setStep(step + 1);
                            else handleDismiss();
                        }}
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
                        }}
                    >
                        {step < steps.length - 1 ? 'Next' : 'Got it!'} <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
