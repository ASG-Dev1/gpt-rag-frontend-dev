import { useContext, useState, useEffect } from 'react'
import React from 'react'
import {
  CommandBarButton,
  ContextualMenu,
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  ICommandBarStyles,
  IContextualMenuItem,
  IStackStyles,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Stack,
  List,
  StackItem,
  Text,
  Separator
} from '@fluentui/react'
import { useBoolean } from '@fluentui/react-hooks'

import { ChatHistoryLoadingState, historyDeleteAll } from '../../api'

import { ChatHistoryListItem } from './ChatHistoryListItem'
import { get_ChatHistory } from '../../api'; // Fetch Chat History JAMR
import { AskResponse } from '../../api'
import styles from './ChatHistoryPanel.module.css'


// Define a type for the chat history items
interface ChatHistoryItem {
  id: string;
  content: string;
  user_id: string;
  user_ask: string;
  // answer: string;
  answer: AskResponse;
}

interface ChatHistoryPanelProps {
  onConversationSelected: (conversationId: string) => void;
}

export enum ChatHistoryPanelTabs {
  History = 'History'
}

const commandBarStyle: ICommandBarStyles = {
  root: {
    padding: '0',
    display: 'flex',
    justifyContent: 'center',
  }
}

const commandBarButtonStyle: Partial<IStackStyles> = { root: { height: '50px' } }

export function ChatHistoryPanel({ onConversationSelected }: ChatHistoryPanelProps) {
  const [showContextualMenu, setShowContextualMenu] = React.useState(false)
  const [hideClearAllDialog, { toggle: toggleClearAllDialog }] = useBoolean(true)
  const [clearing, setClearing] = React.useState(false)
  const [clearingError, setClearingError] = React.useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

  const clearAllDialogContentProps = {
    type: DialogType.close,
    title: !clearingError ? '¿Estás seguro de que quieres borrar todo el historial de chat?' : 'Error al eliminar todo el historial de chat',
    closeButtonAriaLabel: 'Close',
    subText: !clearingError
      ? 'Todo el historial de chat se eliminará permanentemente.'
      : 'Por favor inténtalo de nuevo. Si el problema persiste, comuníquese con el administrador del sitio.'
  }

  const modalProps = {
    titleAriaId: 'labelId',
    subtitleAriaId: 'subTextId',
    isBlocking: true,
    styles: { main: { maxWidth: 450 } }
  }

  const menuItems: IContextualMenuItem[] = [
    { key: 'clearAll', text: 'Clear all chat history', iconProps: { iconName: 'Delete' } }
  ]

  const handleHistoryClick = () => {
    console.log("I got clicked ChatHistoryPanel")
  }

  const onShowContextualMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault() // don't navigate
    setShowContextualMenu(true)
  }, [])

  const onHideContextualMenu = React.useCallback(() => setShowContextualMenu(false), [])

  const onClearAllChatHistory = async () => {
    setClearing(true)
    const response = await historyDeleteAll()
    if (!response.ok) {
      setClearingError(true)
    } else {
      toggleClearAllDialog()
    }
    setClearing(false)
  }

  const onHideClearAllDialog = () => {
    toggleClearAllDialog()
    setTimeout(() => {
      setClearingError(false)
    }, 2000)
  }

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data: ChatHistoryItem[] = await get_ChatHistory(); // Explicitly type the fetched data
        console.log("Fetched chat history:", data);

        // Filter for unique conversation_ids
        const uniqueHistory: ChatHistoryItem[] = Array.from(
          new Map(data.map((item: ChatHistoryItem) => [item.id, item])).values()
        );

        setChatHistory(uniqueHistory); // Now TypeScript knows this is ChatHistoryItem[]
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    fetchHistory();
  }, []);


  return (
    <Stack className={styles.container} data-is-scrollable aria-label="chat history panel">

      {/* Header */}
      <Stack verticalAlign="start" wrap aria-label="chat history header" style={{ height: '3rem' }}>
        <StackItem style={{ paddingTop: '1rem' }}>
          {/* Aqui es donde vas a editar el padding Joshua!!!! */}
          <Text className={styles.headingText} role="heading" aria-level={2}>
            Historial
          </Text>
        </StackItem>
      </Stack>

      {/* Separator below Historial heading */}
      <div className={styles.separatorDiv}>
        <Separator
          styles={{
            root: {
              width: '95%',
              '::before': {
                backgroundColor: '#000'
              }
            }
          }}
        />
      </div>

      {/* Chat history list */}
      <Stack>
        <Stack>
          {chatHistory.map((item: ChatHistoryItem) => (
            <div key={item.id} onClick={() => onConversationSelected(item.id)}>
              <ChatHistoryListItem conversation={item} />
            </div>
          ))}
        </Stack>

      </Stack>

      {/* Content Stack */}
      <Stack
        aria-label="chat history panel content"
        styles={{
          root: {
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            paddingTop: '2.5px',
            maxWidth: '100%'
          }
        }}
        style={{
          display: 'flex',
          flexGrow: 1,
          flexDirection: 'column',
          flexWrap: 'wrap',
          padding: '1px'
        }}
      />

      {/* Dialog */}
      <Dialog
        hidden={hideClearAllDialog}
        onDismiss={clearing ? () => { } : onHideClearAllDialog}
        dialogContentProps={clearAllDialogContentProps}
        modalProps={modalProps}
      >
        <DialogFooter>
          {!clearingError && (
            <PrimaryButton onClick={onClearAllChatHistory} disabled={clearing} text="Borrar todo" />
          )}
          <DefaultButton
            onClick={onHideClearAllDialog}
            disabled={clearing}
            text={!clearingError ? 'Cancelar' : 'Cerrar'}
          />
        </DialogFooter>
      </Dialog>
    </Stack>

  )
}
