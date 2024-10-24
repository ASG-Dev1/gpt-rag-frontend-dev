import { useRef, useState, useEffect, useContext } from "react";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, Stack } from "@fluentui/react";
import { SparkleFilled } from "@fluentui/react-icons";

import styles from "./Chat.module.css";
import btnStyles from '../../components/Common/Button.module.css'

import { chatApiGpt, Approaches, AskResponse, ChatRequest, ChatRequestGpt, ChatTurn, CosmosDBStatus } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { ClearChatButton } from "../../components/ClearChatButton";
import { getTokenOrRefresh } from '../../components/QuestionInput/token_util';
import { SpeechConfig, AudioConfig, SpeechSynthesizer, ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { ChatHistoryPanel } from "../../components/ChatHistory/ChatHistoryPanel";

import { useMenu } from '../../context/MenuContext'; // Toggle Chat History JAMR

interface HistoryItem {
    userAsk: string;         // User's question
    answer: AskResponse;     // The answer returned from the API
}

const userLanguage = navigator.language;
let error_message_text = '';
if (userLanguage.startsWith('pt')) {
    error_message_text = 'Desculpe, tive um problema técnico com a solicitação. Por favor informar o erro a equipe de suporte. ';
} else if (userLanguage.startsWith('es')) {
    error_message_text = 'Lo siento, yo tuve un problema con la solicitud. Por favor informe el error al equipo de soporte. ';
} else {
    error_message_text = "I'm sorry, I had a problem with the request. Please report the error to the support team. ";
}


const Chat = () => {
    const [currentConversation, setCurrentConversation] = useState<ChatTurn[]>([]);
    const [historyConversation, setHistoryConversation] = useState<ChatTurn[]>([]);
    const [isViewingHistory, setIsViewingHistory] = useState<boolean>(false);


    // speech synthesis is disabled by default
    const speechSynthesisEnabled = false;

    const [placeholderText, setPlaceholderText] = useState('');
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [retrieveCount, setRetrieveCount] = useState<number>(3);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [excludeCategory, setExcludeCategory] = useState<string>("");
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(false);


    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    // Update the `answers` state to be an array of `ChatTurn` objects
    const [answers, setAnswers] = useState<ChatTurn[]>([]);
    const [userId, setUserId] = useState<string>("");
    const triggered = useRef(false);

    const { isMenuOpen } = useMenu(); // Toggle Chat History Panel JAMR
    console.log('Is menu open in Chat:', isMenuOpen);


    const makeApiRequestGpt = async (question: string) => {
        if (isViewingHistory) {
            return;  // Prevent adding new messages when viewing history
        }

        lastQuestionRef.current = question;
        setError(undefined);
        setIsLoading(true);

        try {
            const history: ChatTurn[] = currentConversation.map(a => ({ user: a.user, bot: a.bot }));
            const request: ChatRequestGpt = {
                history: [...history, { user: question, bot: undefined }],
                approach: Approaches.ReadRetrieveRead,
                conversation_id: "",
                query: question,
                overrides: {
                    promptTemplate: promptTemplate || undefined,
                    excludeCategory: excludeCategory || undefined,
                    top: retrieveCount,
                    semanticRanker: useSemanticRanker,
                    semanticCaptions: useSemanticCaptions,
                    suggestFollowupQuestions: useSuggestFollowupQuestions
                }
            };
            const result = await chatApiGpt(request);

            if (!result.answer) {
                throw new Error("No answer received from API");
            }

            setCurrentConversation([...currentConversation, { user: question, bot: result }]);

        } catch (error) {
            console.error('Error during API request:', error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };





    // const makeApiRequestGpt = async (question: string) => {
    //     lastQuestionRef.current = question;
    //     setError(undefined); // Clear any previous error
    //     setIsLoading(true);
    //     setActiveCitation(undefined);
    //     setActiveAnalysisPanelTab(undefined);

    //     try {
    //         const history: ChatTurn[] = answers.map(a => ({ user: a[0], bot: a[1].answer })); // Ensure this is correct
    //         const request: ChatRequestGpt = {
    //             history: [...history, { user: question, bot: undefined }],
    //             approach: Approaches.ReadRetrieveRead,
    //             conversation_id: userId,
    //             query: question,
    //             overrides: {
    //                 promptTemplate: promptTemplate || undefined,
    //                 excludeCategory: excludeCategory || undefined,
    //                 top: retrieveCount,
    //                 semanticRanker: useSemanticRanker,
    //                 semanticCaptions: useSemanticCaptions,
    //                 suggestFollowupQuestions: useSuggestFollowupQuestions
    //             }
    //         };

    //         const result = await chatApiGpt(request);

    //         if (!result.answer) {
    //             console.error('API response does not contain answer:', result);
    //             throw new Error("No answer received from API");
    //         }

    //         setAnswers([...answers, [question, result]]);
    //         setUserId(result.conversation_id);
    //     } catch (e) {
    //         console.error('Error during request:', e);
    //         setError(e);

    //         // Voice Synthesis
    //         if (speechSynthesisEnabled) {
    //             const tokenObj = await getTokenOrRefresh();
    //             const speechConfig = SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    //             const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
    //             speechConfig.speechSynthesisLanguage = tokenObj.speechSynthesisLanguage;
    //             speechConfig.speechSynthesisVoiceName = tokenObj.speechSynthesisVoiceName;
    //             const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

    //             synthesizer.speakTextAsync(result.answer.replace(/ *\[[^)]*\] */g, ""),
    //                 function (result) {
    //                     if (result.reason === ResultReason.SynthesizingAudioCompleted) {
    //                         console.log("synthesis finished.");
    //                     } else {
    //                         console.error("Speech synthesis canceled, " + result.errorDetails + "\nDid you update the subscription info?");
    //                     }
    //                     synthesizer.close();
    //                 },
    //                 function (err) {
    //                     console.trace("err - " + err);
    //                     synthesizer.close();
    //                 });
    //         }


    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    const onConversationSelected = async (conversationId: string) => {
        console.log('Conversation selected with ID:', conversationId);
        setIsViewingHistory(true);
        try {
            const result = await fetchConversationById(conversationId);
            console.log("OnConversationSelected result:", result);

            if (result && result.history) {
                const conversationHistory = result.history.map((item: HistoryItem) => ({
                    user: item.userAsk,
                    bot: item.answer
                }));
                setHistoryConversation(conversationHistory);
            } else {
                console.error("Invalid conversation structure");
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };


    const fetchConversationById = async (conversationId: string) => {
        try {
            const response = await fetch(`/api/conversations/${conversationId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch conversation');
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching conversation:', error);
            throw error;
        }
    };

    const clearChat = () => {
        lastQuestionRef.current = "";
        setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setCurrentConversation([]);
        setHistoryConversation([]);
        setIsViewingHistory(false);
    };

    useEffect(() => {
        chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" });
        const language = navigator.language;
        if (language.startsWith('pt')) {
            setPlaceholderText('Escreva aqui sua pergunta');
        } else if (language.startsWith('es')) {
            setPlaceholderText('Escribe tu pregunta aqui');
        } else {
            setPlaceholderText('Write your question here');
        }
    }, [isLoading]);

    const onPromptTemplateChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplate(newValue || "");
    };

    const onRetrieveCountChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setRetrieveCount(parseInt(newValue || "3"));
    };

    const onUseSemanticRankerChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticRanker(!!checked);
    };

    const onUseSemanticCaptionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticCaptions(!!checked);
    };

    const onExcludeCategoryChanged = (_ev?: React.FormEvent, newValue?: string) => {
        setExcludeCategory(newValue || "");
    };

    const onUseSuggestFollowupQuestionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSuggestFollowupQuestions(!!checked);
    };

    const onExampleClicked = (example: string) => {
        makeApiRequestGpt(example);
    };

    const onShowCitation = (citation: string, index: number) => {

        if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveCitation(citation);
            setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
        }

        setSelectedAnswer(index);
    };

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };






    return (
        <>

            <div className={styles.container}>
                <div className={styles.chatRoot}>
                    <div className={styles.chatContainer}>
                        {/* Conditional rendering: Show the "Back to Current Conversation" button only when viewing history */}
                        {isViewingHistory && (
                            <DefaultButton onClick={() => setIsViewingHistory(false)}>
                                Back to Current Conversation
                            </DefaultButton>
                        )}
                        {!lastQuestionRef.current ? (
                            <div className={styles.chatEmptyState}>
                                {
                                    <img height="120px" src="https://asgwebpageprodstorage.blob.core.windows.net/static/assets/images/Blue%20White%20Robot%20Technology%20Logo.png"></img>
                                    /* <SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" /> */}
                                <h1 className={styles.chatEmptyStateTitle}>¡Adquisiciones en un click!</h1>
                                <h2 className={styles.chatEmptyStateSubtitle}>Haz cualquier pregunta o utiliza uno de los siguientes ejemplos</h2>
                                <ExampleList onExampleClicked={onExampleClicked} />
                                {/*<SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />
                                <h1 className={styles.chatEmptyStateTitle}>Conversación con datos</h1>*/}
                            </div>

                        ) : (

                            <div className={styles.chatMessageStream}>
                                {(isViewingHistory ? historyConversation : currentConversation).map((item: ChatTurn, index: number) => (
                                    <div key={index}>
                                        <UserChatMessage message={item.user} />
                                        <div className={styles.chatMessageGpt}>
                                            {item.bot ? (
                                                <Answer
                                                    key={index}
                                                    answer={item.bot}
                                                    isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                                    onCitationClicked={c => onShowCitation(c, index)}
                                                    onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                                    onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                                    onFollowupQuestionClicked={makeApiRequestGpt}
                                                    showFollowupQuestions={false}
                                                    showSources={true}
                                                />
                                            ) : (
                                                <div>No answer available</div>
                                            )}
                                        </div>
                                    </div>
                                ))}


                                {isLoading && (
                                    <>
                                        <UserChatMessage message={lastQuestionRef.current} />
                                        <div className={styles.chatMessageGptMinWidth}>
                                            <AnswerLoading />
                                        </div>
                                    </>
                                )}
                                {error ? (
                                    <>
                                        <UserChatMessage message={lastQuestionRef.current} />
                                        <div className={styles.chatMessageGptMinWidth}>
                                            <AnswerError error={error_message_text + error.toString()} onRetry={() => makeApiRequestGpt(lastQuestionRef.current)} />
                                        </div>
                                    </>
                                ) : null}
                                <div ref={chatMessageStreamEnd} />
                            </div>


                        )}

                        <div className={styles.chatInput}>
                            <ClearChatButton className={`${btnStyles.buttonStructure} ${btnStyles.deleteConversationBtn}`}
                                onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                            <QuestionInput
                                clearOnSend
                                placeholder={placeholderText}
                                disabled={isLoading}
                                onSend={question => makeApiRequestGpt(question)}
                            />
                        </div>
                    </div>

                    {/* {answers.length > 0 && activeAnalysisPanelTab && (
                        <AnalysisPanel
                            className={styles.chatAnalysisPanel}
                            activeCitation={activeCitation}
                            onActiveTabChanged={x => onToggleTab(x as AnalysisPanelTabs, selectedAnswer)}
                            citationHeight="720px"
                            answer={answers[selectedAnswer].bot!} // Use non-null assertion if you're sure bot is defined, or use a fallback
                            activeTab={activeAnalysisPanelTab}
                        />
                    )}


                    <Panel
                        headerText="Configure answer generation"
                        isOpen={isConfigPanelOpen}
                        isBlocking={false}
                        onDismiss={() => setIsConfigPanelOpen(false)}
                        closeButtonAriaLabel="Close"
                        onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                        isFooterAtBottom={true}
                    >
                        <TextField
                            className={styles.chatSettingsSeparator}
                            defaultValue={promptTemplate}
                            label="Override prompt template"
                            multiline
                            autoAdjustHeight
                            onChange={onPromptTemplateChange}
                        />

                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label="Retrieve this many documents from search:"
                            min={1}
                            max={50}
                            defaultValue={retrieveCount.toString()}
                            onChange={onRetrieveCountChange}
                        />
                        <TextField className={styles.chatSettingsSeparator} label="Exclude category" onChange={onExcludeCategoryChanged} />
                        <Checkbox
                            className={styles.chatSettingsSeparator}
                            checked={useSemanticRanker}
                            label="Use semantic ranker for retrieval"
                            onChange={onUseSemanticRankerChange}
                        />
                        <Checkbox
                            className={styles.chatSettingsSeparator}
                            checked={useSemanticCaptions}
                            label="Use query-contextual summaries instead of whole documents"
                            onChange={onUseSemanticCaptionsChange}
                            disabled={!useSemanticRanker}
                        />
                        <Checkbox
                            className={styles.chatSettingsSeparator}
                            checked={useSuggestFollowupQuestions}
                            label="Suggest follow-up questions"
                            onChange={onUseSuggestFollowupQuestionsChange}
                        />
                    </Panel>

                    <Stack horizontal horizontalAlign="center">
                        {isMenuOpen && <ChatHistoryPanel onConversationSelected={onConversationSelected} />}
                    </Stack>
                </div>
            </div> */}

                    {(isViewingHistory ? historyConversation : currentConversation).length > 0 && activeAnalysisPanelTab && (
                        <AnalysisPanel
                            className={styles.chatAnalysisPanel}
                            activeCitation={activeCitation}
                            onActiveTabChanged={x => onToggleTab(x as AnalysisPanelTabs, selectedAnswer)}
                            citationHeight="720px"
                            answer={(isViewingHistory ? historyConversation : currentConversation)[selectedAnswer]?.bot!} // Ensure the correct conversation is shown
                            activeTab={activeAnalysisPanelTab}
                        />
                    )}
                    <Panel
                        headerText="Configure answer generation"
                        isOpen={isConfigPanelOpen}
                        isBlocking={false}
                        onDismiss={() => setIsConfigPanelOpen(false)}
                        closeButtonAriaLabel="Close"
                        onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                        isFooterAtBottom={true}
                    >
                        <TextField
                            className={styles.chatSettingsSeparator}
                            defaultValue={promptTemplate}
                            label="Override prompt template"
                            multiline
                            autoAdjustHeight
                            onChange={onPromptTemplateChange}
                        />
                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label="Retrieve this many documents from search:"
                            min={1}
                            max={50}
                            defaultValue={retrieveCount.toString()}
                            onChange={onRetrieveCountChange}
                        />
                        <TextField className={styles.chatSettingsSeparator} label="Exclude category" onChange={onExcludeCategoryChanged} />
                        <Checkbox
                            className={styles.chatSettingsSeparator}
                            checked={useSemanticRanker}
                            label="Use semantic ranker for retrieval"
                            onChange={onUseSemanticRankerChange}
                        />
                        <Checkbox
                            className={styles.chatSettingsSeparator}
                            checked={useSemanticCaptions}
                            label="Use query-contextual summaries instead of whole documents"
                            onChange={onUseSemanticCaptionsChange}
                            disabled={!useSemanticRanker}
                        />
                        <Checkbox
                            className={styles.chatSettingsSeparator}
                            checked={useSuggestFollowupQuestions}
                            label="Suggest follow-up questions"
                            onChange={onUseSuggestFollowupQuestionsChange}
                        />
                    </Panel>

                    <Stack horizontal horizontalAlign="center">
                        {isMenuOpen && <ChatHistoryPanel onConversationSelected={onConversationSelected} />}
                    </Stack>
                </div>
            </div>


        </>
    );
};

export default Chat;
