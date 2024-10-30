import { AddFilled } from "@fluentui/react-icons";
import styles from "./NewChatButton.module.css";

interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

const userLanguage = navigator.language;
let reiniciar_text = '';
if (userLanguage.startsWith('pt')) {
    reiniciar_text = 'Nova conversa';
} else if (userLanguage.startsWith('es')) {
    reiniciar_text = 'Nueva conversación';
} else {
    reiniciar_text = 'New conversation';
}

export const NewChatButton = ({ className, disabled, onClick }: Props) => {
    return (
        <a className={`${styles.container} ${className ?? ""} ${disabled && styles.disabled}`} onClick={onClick}>
            <AddFilled className={styles.icon} />
        </a>
    );
};
