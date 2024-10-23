import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your context state
interface ChatHistoryContextType {
    isHistoryVisible: boolean;
    toggleHistoryVisibility: () => void;
}

// Create the context
const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

// Create a provider component
export const ChatHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    const toggleHistoryVisibility = () => {
        setIsHistoryVisible(prev => !prev);
    };

    return (
        <ChatHistoryContext.Provider value={{ isHistoryVisible, toggleHistoryVisibility }}>
            {children}
        </ChatHistoryContext.Provider>
    );
};

// Create a custom hook for easy access to the context
export const useChatHistory = () => {
    const context = useContext(ChatHistoryContext);
    if (!context) {
        throw new Error('useChatHistory must be used within a ChatHistoryProvider');
    }
    return context;
};