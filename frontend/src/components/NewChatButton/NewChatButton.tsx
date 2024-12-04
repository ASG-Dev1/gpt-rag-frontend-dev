import styles from "./NewChatButton.module.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

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
           <i className={`bi bi-plus-lg `} style={{color:"white"}}></i>
        </a>
    );
};
