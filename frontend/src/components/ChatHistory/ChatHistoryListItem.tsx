import * as React from 'react';
import styles from './ChatHistoryPanel.module.css'

type ChatHistoryListProps = {
  conversation: {
    id: string;
    userId: string;
    userAsk: string;
    answer: string;
  };
  onConversationSelected: (conversationId: string) => void;
};

export const ChatHistoryListItem: React.FC<ChatHistoryListProps> = ({ conversation, onConversationSelected }) => {
  
  const handleClicked = (conversationId: string) => {
  onConversationSelected(conversationId);
}

  return (
    <div className={styles.itemCell} onClick={() => {handleClicked(conversation.id)}}>
      <div className={styles.itemText}>{conversation.id}</div>
    </div>
  );
};
