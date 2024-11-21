import styles from './ChatHistoryPanel.module.css'
import css from '../Common/Button.module.css'
import { AskResponse, delete_Conversation } from '../../api';
import React, { useState, useEffect } from 'react';
import { DefaultButton, PrimaryButton, Dialog, DialogFooter, DialogType } from '@fluentui/react';
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
  onDelete: (id: string) => void; // Callback to update parent component
};

export const ChatHistoryListItem: React.FC<ChatHistoryListProps> = ({ conversation, isActive, onClick, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const result = await delete_Conversation(conversation.id);
    setIsDeleting(false);

    if (result.success) {
      closeModal();
      setIsSuccessModalOpen(true); // Show success modal
    } else {
      alert(result.message || "Failed to delete the conversation.");
    }
  };

  useEffect(() => {
    if (isSuccessModalOpen) {
      const timer = setTimeout(() => setIsSuccessModalOpen(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccessModalOpen]);

  return (
    <div className={styles.itemCell} style={{ background: isActive ? "#9ac4e3" : "" }}>
      <div
        className={styles.itemContent}
        onClick={onClick}
        role="button"
        aria-pressed={isActive}>
        <div className={styles.itemText}>{conversation.content}</div>
      </div>
      <div
        className={styles.itemDelete}
        onClick={openModal}
        role="button"
        aria-label={`Delete conversation ${conversation.id}`}
        tabIndex={0}
      >
        <Delete24Regular color='white' />
      </div>

      {/* **Modal for Delete Confirmation** */}
      <Dialog
        hidden={!isModalOpen}
        onDismiss={isDeleting ? () => { } : closeModal}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Confirmar',
          closeButtonAriaLabel: 'Close',
          subText: 'Seguro que quieres borrar esta conversación? No se puede recuperar.'
        }}
        modalProps={{
          isBlocking: true,
          styles: { main: { maxWidth: 450, borderRadius: 20 } }
        }}
      >
        <DialogFooter>
          <PrimaryButton className={css.modalBtn} onClick={handleConfirmDelete} disabled={isDeleting} text="Borrar" style={{ background: 'red', color: 'white' }} />
          <DefaultButton className={css.modalBtn} onClick={closeModal} disabled={isDeleting} text="Cancelar" style={{ background: 'white' }} />
        </DialogFooter>
      </Dialog>

      <Dialog
        hidden={!isSuccessModalOpen}
        onDismiss={() => setIsSuccessModalOpen(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Success',
          subText: 'La conversación fue eliminada con éxito',
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={() => setIsSuccessModalOpen(false)} text="Cerrar" />
        </DialogFooter>
      </Dialog>
    </div>
  );
};