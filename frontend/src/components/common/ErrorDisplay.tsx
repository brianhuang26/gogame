import React, { useEffect, useState } from 'react';

interface ErrorDisplayProps {
    message: string | null;
    onClose: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for fade out animation
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message && !isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: `translateX(-50%) translateY(${isVisible ? '0' : '-20px'})`,
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.3s ease-in-out',
                zIndex: 1000,
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                color: '#b91c1c',
                padding: '12px 24px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {message}
        </div>
    );
};
