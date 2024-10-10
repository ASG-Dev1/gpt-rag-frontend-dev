import { useMemo, useState } from "react";
import { Stack, IconButton } from "@fluentui/react";
// import { Lightbulb, LightbulbFill } from 'react-bootstrap-icons';
import DOMPurify from "dompurify";

import styles from "./Answer.module.css";

import { AskResponse, getCitationFilePath } from "../../api";
import { parseAnswerToHtml } from "./AnswerParser";
import { AnswerIcon } from "./AnswerIcon";

// const [isHovered, setIsHovered] = useState(false);

// const hovered = (bool: boolean) => {
//     setIsHovered(bool)
// }

interface Props {
    answer: AskResponse;
    isSelected?: boolean;
    onCitationClicked: (filePath: string) => void;
    onThoughtProcessClicked: () => void;
    onSupportingContentClicked: () => void;
    onFollowupQuestionClicked?: (question: string) => void;
    showFollowupQuestions?: boolean;
    showSources?: boolean;
}

function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
        return str;
    }
    const startLength = Math.ceil((maxLength - 3) / 2);
    const endLength = Math.floor((maxLength - 3) / 2);
    return str.substring(0, startLength) + "..." + str.substring(str.length - endLength);
}

export const Answer = ({
    answer,
    isSelected,
    onCitationClicked,
    onThoughtProcessClicked,
    onSupportingContentClicked,
    onFollowupQuestionClicked,
    showFollowupQuestions,
    showSources
}: Props) => {
    const parsedAnswer = useMemo(() => parseAnswerToHtml(answer.answer, !!showSources, onCitationClicked), [answer]);

    const sanitizedAnswerHtml = DOMPurify.sanitize(parsedAnswer.answerHtml);

    return (
        <Stack className={`${styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
            <Stack.Item>
                <Stack horizontal horizontalAlign="space-between">
                    <AnswerIcon />
                    <div>
                        <IconButton
                            style={{ color: "black" }}
                            iconProps={{ iconName: "Lightbulb" }}
                            title="Show thought process"
                            ariaLabel="Show thought process"
                            onClick={() => onThoughtProcessClicked()}
                            disabled={!answer.thoughts}
                        />
                        {/* // onMouseEnter={() => setIsHovered(true)}
                            // onMouseLeave={() => setIsHovered(false)} */}
                        {/* styles={{
                                root: { // Apply styles directly to the root or button element
                                    color: isHovered ? '#ffbf00' : 'red',
                                },
                            }}
                        > */}
                        {/* {isHovered ? <LightbulbFill /> : <Lightbulb />}
                        </IconButton> */}
                        {/* <IconButton
                            style={{ color: "black" }}
                            iconProps={{ iconName: "ClipboardList" }}
                            title="Show supporting content"
                            ariaLabel="Show supporting content"
                            onClick={() => onSupportingContentClicked()}
                            disabled={!answer.data_points.length}
                        /> */}
                    </div>
                </Stack>
            </Stack.Item>

            <Stack.Item grow>
                <div className={styles.answerText} dangerouslySetInnerHTML={{ __html: sanitizedAnswerHtml }}></div>
            </Stack.Item>

            {!!parsedAnswer.citations.length && showSources && (
                <Stack.Item>
                    <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                        <span className={styles.citationLearnMore}>Fuentes:</span>

                        {parsedAnswer.citations.map((x, i) => {
                            console.log(parsedAnswer.citations);
                            const path = getCitationFilePath(x);
                            console.log(x);
                            return (
                                <a key={i} className={styles.citation} title={x} onClick={() => onCitationClicked(path)}>
                                    {`${++i}. ${truncateString(x, 15)}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>
            )}

            {!!parsedAnswer.followupQuestions.length && showFollowupQuestions && onFollowupQuestionClicked && (
                <Stack.Item>
                    <Stack horizontal wrap className={`${!!parsedAnswer.citations.length ? styles.followupQuestionsList : ""}`} tokens={{ childrenGap: 6 }}>
                        <span className={styles.followupQuestionLearnMore}>Follow-up questions:</span>
                        {parsedAnswer.followupQuestions.map((x, i) => {
                            return (
                                <a key={i} className={styles.followupQuestion} title={x} onClick={() => onFollowupQuestionClicked(x)}>
                                    {`${x}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>
            )}
        </Stack>
    );
};
