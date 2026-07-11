import React from 'react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
}

export const ChatMessageItem: React.FC<{ message: ChatMessage, isMe: boolean }> = ({ message, isMe }) => {
  const date = message.timestamp?.toDate?.() || new Date();
  
  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}>
      <div className={`max-w-[80%] p-3 rounded-2xl ${
        isMe 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-gray-100 text-gray-900 rounded-tl-none'
      }`}>
        {!isMe && <p className="text-[10px] font-black opacity-60 mb-1">{message.senderName}</p>}
        <p className="text-xs leading-relaxed">{message.text}</p>
      </div>
      <p className="text-[9px] font-bold text-gray-400 mt-1">
        {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};
