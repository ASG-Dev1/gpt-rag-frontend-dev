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
  List,
  StackItem,
  Text
} from '@fluentui/react'
import { useBoolean } from '@fluentui/react-hooks'

import { ChatHistoryLoadingState, historyDeleteAll } from '../../api'


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


  const onShowContextualMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault() // don't navigate
    setShowContextualMenu(true)
  }, [])

  const onHideContextualMenu = React.useCallback(() => setShowContextualMenu(false), [])



  const onHideClearAllDialog = () => {
    toggleClearAllDialog()
    setTimeout(() => {
      setClearingError(false)
    }, 2000)
  }

  //Renders Chat History Panel and its items
  React.useEffect(() => { },)

  return (
    <Stack className={styles.container} data-is-scrollable aria-label={'chat history panel'}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center" wrap aria-label="chat history header">
        <StackItem style={{ paddingTop: '1rem' }}> {/* Aqui es donde vas a editar el padding Joshua!!!!  */}
          <Text
            className={styles.headingText}
            role="heading"
            aria-level={2}>
            Historial
          </Text>
        </StackItem>
        <Stack verticalAlign="start">
          {/* Chat History Control buttons  */}
          <Stack horizontal styles={commandBarButtonStyle} >

            <CommandBarButton
              iconProps={{ iconName: 'More' }}
              title={'Borrar todo el historia'}
              onClick={onShowContextualMenu}
              aria-label={'clear all chat history'}
              styles={
                {
                  root: { backgroundColor: "transparent" },
                  rootHovered: { backgroundColor: '#9ac4e3' },
                  rootPressed: { backgroundColor: "#9ac4e3" },
                  icon: { color: 'black' },
                  iconHovered: { color: 'black' },
                  iconPressed: { color: 'black' }
                }}
              role="button"
              id="moreButton"
            />

            {/* Items in the more options button (...) drop down */}
            <ContextualMenu
              items={menuItems}
              hidden={!showContextualMenu}
              target={'#moreButton'}
              onItemClick={toggleClearAllDialog}
              onDismiss={onHideContextualMenu}
              styles={{
                subComponentStyles: {
                  menuItem: {
                    root: {
                      backgroundColor: "#d6ecfb",
                      color: "black",
                      selectors: {
                        ":hover": {
                          backgroundColor: '#9ac4e3', color: "black",
                          ".ms-ContextualMenu-icon": {
                            color: "black",
                          },
                          ":active .ms-ContextualMenu-icon": {
                            color: "black",
                          }
                        },
                        ":active": {
                          backgroundColor: "#9ac4e3"
                        }
                      }
                    },
                    rootPressed: { backgroundColor: "#9ac4e3" },
                    icon: { color: "#000" },
                  }
                }
              }}
            />

            {/* X button */}
            <CommandBarButton
              iconProps={{ iconName: 'Cancel' }}
              title={'Esconder'}
              aria-label={'hide button'}
              styles={{ root: { backgroundColor: "transparent" }, rootHovered: { backgroundColor: '#9ac4e3' }, rootPressed: { backgroundColor: "#9ac4e3" }, icon: { color: 'black' }, iconHovered: { color: 'black' }, iconPressed: { color: 'black' } }}
              role="button"
            />
          </Stack>
        </Stack>
      </Stack>
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
        }}>
      </Stack>
      <Dialog
        hidden={hideClearAllDialog}
        onDismiss={clearing ? () => { } : onHideClearAllDialog}
        dialogContentProps={clearAllDialogContentProps}
        modalProps={modalProps}>
        <DialogFooter>
          {!clearingError && <PrimaryButton disabled={clearing} text="Borrar todo" />}
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
