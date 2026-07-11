import { createContext, useContext, useState, ReactNode } from 'react';
import { Message } from '../types';

interface MessageContextType {
  messages: Message[];
  sendMessage: (recipient: string, content: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = (recipient: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'Admin', // Prototype: current user is Admin
      recipient,
      content,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  return (
    <MessageContext.Provider value={{ messages, sendMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) throw new Error('useMessages must be used within a MessageProvider');
  return context;
};
