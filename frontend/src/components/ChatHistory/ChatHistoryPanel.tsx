import { useContext } from 'react'
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
  StackItem,
  Text
} from '@fluentui/react'
import { useBoolean } from '@fluentui/react-hooks'

import { ChatHistoryLoadingState, historyDeleteAll } from '../../api'
import { AppStateContext } from '../../state/AppProvider'

import ChatHistoryList from './ChatHistoryList'

import styles from './ChatHistoryPanel.module.css'

interface ChatHistoryPanelProps { }

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

export function ChatHistoryPanel(_props: ChatHistoryPanelProps) {
  const appStateContext = useContext(AppStateContext)
  const [showContextualMenu, setShowContextualMenu] = React.useState(false)
  const [hideClearAllDialog, { toggle: toggleClearAllDialog }] = useBoolean(true)
  const [clearing, setClearing] = React.useState(false)
  const [clearingError, setClearingError] = React.useState(false)

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
    appStateContext?.dispatch({ type: 'TOGGLE_CHAT_HISTORY' })
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
      appStateContext?.dispatch({ type: 'DELETE_CHAT_HISTORY' })
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

  //Renders Chat History Panel and its items
  React.useEffect(() => { }, [appStateContext?.state.chatHistory, clearingError])

  return (
    <Stack className={styles.container} data-is-scrollable aria-label={'chat history panel'}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center" wrap aria-label="chat history header">
        <StackItem> {/* Aqui es donde vas a editar el padding Joshua!!!!  */}
          <Text
            role="heading"
            aria-level={2}
            style={{
              alignSelf: 'center',
              fontWeight: '600',
              fontSize: '18px',
              marginRight: 'auto',
              paddingLeft: '20px',
              paddingTop: "1rem",
              color: "black"
            }}>
            Historial
          </Text>
        </StackItem>
      </Stack>
    </Stack>
  )
}
