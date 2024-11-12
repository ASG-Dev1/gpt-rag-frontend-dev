import styles from './ChatHistoryPanel.module.css'
import { AskResponse, delete_Conversation } from '../../api';
import { Delete24Regular } from "@fluentui/react-icons";

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

  // const handleDeleteConversation = (conversation_Id: string) => {
    
  //   delete_Conversation(conversation_Id)

  // }

    return (
      <div
      className={styles.itemCell}
      style={{ background: isActive ? "#9ac4e3" : "" }}
      onClick={onClick}
      role="button"
      aria-pressed={isActive}
    >
      <div className={styles.itemText}>{conversation.content}</div>
      {/* <div className={styles.itemDelete} onClick={() => {handleDeleteConversation(conversation.id)}}><Delete24Regular /></div> */}
    </div>
  );
};