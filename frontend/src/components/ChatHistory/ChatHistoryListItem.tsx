import * as React from 'react';
import styles from './ChatHistoryPanel.module.css'

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
    <div className={styles.itemCell}>
      {conversation.id}
    </div>
  );
};
