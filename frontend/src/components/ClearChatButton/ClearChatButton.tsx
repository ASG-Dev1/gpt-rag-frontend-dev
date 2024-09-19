import { Text } from "@fluentui/react";
import { Delete24Regular } from "@fluentui/react-icons";

import styles from "./ClearChatButton.module.css";
import btnStyles from '../../components/Common/Button.module.css'

interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

const userLanguage = navigator.language;
let reiniciar_text = '';
if (userLanguage.startsWith('pt')) {
  reiniciar_text = 'Reiniciar conversa';
} else if (userLanguage.startsWith('es')) {
  reiniciar_text = 'Reiniciar conversación';
} else {
  reiniciar_text = 'Restart conversation';
}

export const ClearChatButton = ({ className, disabled, onClick }: Props) => {
    return (
        <a className={`${styles.container} ${className ?? ""} ${disabled && styles.disabled}`} onClick={onClick}>
            <Delete24Regular />
            {/* <Text className={btnStyles.btnText}>{reiniciar_text}</Text> */}
        </a>
    );
};
