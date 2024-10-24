import * as React from 'react';
import styles from './ChatHistoryPanel.module.css'
import { AskResponse } from '../../api';

type ChatHistoryListProps = {
  conversation: {
    id: string;
    userId: string;
    userAsk: string;
    // answer: string;
    answer: AskResponse
  };
};

export const ChatHistoryListItem: React.FC<ChatHistoryListProps> = ({ conversation }) => {
  return (
    <div className={styles.itemCell}>
      <div className={styles.itemText}>{conversation.id}</div>
    </div>
  );
};
