import * as React from 'react';

type ChatHistoryListProps = {
  conversation: {
    id: string;
    userId: string;
    userAsk: string;
    answer: string;
  };
};

export const ChatHistoryListItem: React.FC<ChatHistoryListProps> = ({ conversation }) => {
  return (
    <div>
      <p><strong>Conversation ID:</strong> {conversation.id}</p>
      <p><strong>User ID:</strong> {conversation.userId}</p>
      <p><strong>User Ask:</strong> {conversation.userAsk}</p>
      <p><strong>Answer:</strong> {conversation.answer}</p>
    </div>
  );
};
