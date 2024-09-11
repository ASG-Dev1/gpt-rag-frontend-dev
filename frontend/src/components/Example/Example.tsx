import styles from "./Example.module.css";
import btnStyles from '../../components/Common/Button.module.css'

interface Props {
    text: string;
    value: string;
    onClick: (value: string) => void;
}

export const Example = ({ text, value, onClick }: Props) => {
    return (
        <div className={btnStyles.faqOptions} onClick={() => onClick(value)}>
            <p className={styles.exampleText}>{text}</p>
        </div>
    );
};
