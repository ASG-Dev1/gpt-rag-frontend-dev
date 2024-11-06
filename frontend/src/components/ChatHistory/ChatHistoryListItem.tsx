import { useState } from 'react';
import styles from './ChatHistoryPanel.module.css'
import { AskResponse } from '../../api';

type ChatHistoryListProps = {
  conversation: {
    id: string;
    content: string;
    user_id: string;
    user_ask: string;
    answer: AskResponse;
    start_date: string;
  };
  isActive: boolean;
  onClick: () => void;
};

export const ChatHistoryListItem: React.FC<ChatHistoryListProps> = ({ conversation, isActive, onClick }) => {

  console.log("Is History Active? Panel List: ", isActive);   

    return (
      <div
      className={styles.itemCell}
      style={{ background: isActive ? "#9ac4e3" : "#6353531f" }}
      onClick={onClick}
      // 
      role="button"
      aria-pressed={isActive}
    >
      <div className={styles.itemText}>{conversation.content}</div>
    </div>
  );
};

// tabIndex={0} // Make the div focusable
//       // onKeyDown={(e) => {
//       //   if (e.key === 'Enter' || e.key === ' ') {
//       //     onClick();
//       //   }
//       // }}