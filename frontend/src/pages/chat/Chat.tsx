import { useRef, useState, useEffect } from "react";
import { useMenu } from "../../context/MenuContext";
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
import { v4 as uuidv4 } from 'uuid';
import { NewChatButton } from "../../components/NewChatButton/NewChatButton";


interface HistoryItem {
    user_ask: string;
    answer: AskResponse;
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
    const [isEmptyStateVisible, setIsEmptyStateVisible] = useState<boolean>(true);
    const [activeConversation, setActiveConversation] = useState<ChatTurn[]>([]);
    const conversation = isViewingHistory ? historyConversation : currentConversation;


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

    const [hasStartedConversation, setHasStartedConversation] = useState<boolean>(false);

    useEffect(() => {
        setHasStartedConversation(false);
    }, []);

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<ChatTurn[]>([]);
    const [userId, setUserId] = useState<string>("");
    const triggered = useRef(false);

    const { isMenuOpen } = useMenu();
    console.log('Is menu open in Chat:', isMenuOpen);

    const [conversationId, setConversationId] = useState<string | null>(null);


    const makeApiRequestGpt = async (question: string) => {


        setIsEmptyStateVisible(false);
        setError(undefined);
        setIsLoading(true);

        const newConversationTurn: ChatTurn = { user: question, bot: undefined };

        if (isViewingHistory) {
            setHistoryConversation([...historyConversation, newConversationTurn]);
        } else {
            setCurrentConversation([...currentConversation, newConversationTurn]);
        }
        lastQuestionRef.current = question;

        try {
            const currentConversationId = conversationId || uuidv4();
            if (!conversationId) setConversationId(currentConversationId);

            const conversation = isViewingHistory ? historyConversation : currentConversation;

            const request: ChatRequestGpt = {
                history: conversation.map(c => ({ user: c.user, bot: c.bot })),
                conversation_id: currentConversationId,
                query: question,
                approach: Approaches.ReadRetrieveRead
            };

            const result = await chatApiGpt(request);

            if (isViewingHistory) {
                setHistoryConversation(prev =>
                    prev.map((c, index) =>
                        index === prev.length - 1 ? { ...c, bot: result } : c
                    )
                );
            } else {
                setCurrentConversation(prev =>
                    prev.map((c, index) =>
                        index === prev.length - 1 ? { ...c, bot: result } : c
                    )
                );
            }
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };




    const onConversationSelected = async (conversationId: string) => {
        setIsViewingHistory(true);
        setIsEmptyStateVisible(false);
        try {
            const result = await fetchConversationById(conversationId);
            if (result && result.conversation_data && result.conversation_data.interactions) {
                // const mappedConversation = result.conversation_data.interactions.map((interaction: any) => ({
                //     user: interaction.user_ask,
                //     bot: { answer: interaction.answer || "No answer available" }
                // }));
                const mappedConversation = result.conversation_data.interactions.map((interaction: any) => ({
                    user: interaction.user_ask,
                    bot: {
                        answer: interaction.answer || "No answer available",
                        thoughts: interaction.thoughts || interaction.conversation_history_summary || "",
                        data_points: interaction.sources || [],
                        error: interaction.error || undefined
                    }
                }));

                setHistoryConversation(mappedConversation);
                setConversationId(conversationId);
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
        setCurrentConversation([]);
        setHistoryConversation([]);
        setIsEmptyStateVisible(true);
        setIsViewingHistory(false);
        setConversationId(null);
    };

    const goBackToCurrentConversation = () => {
        setIsViewingHistory(false);
        setHistoryConversation([]);
        setIsEmptyStateVisible(true);
        setActiveConversation(currentConversation); // Reset to current conversation
        setConversationId(null); //Reset conversationId

        // navigateToMainPage();
        setIsChatInputVisible(true);

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

    const [isChatInputVisible, setIsChatInputVisible] = useState(false);



    useEffect(() => {
        setIsChatInputVisible(false);
    }, []);






    return (
        <>
            <div className={styles.container}>
                <div className={styles.chatRoot}>
                    <div className={styles.chatContainer}>
                        {isEmptyStateVisible ? (
                            <div className={styles.chatEmptyState}>
                                {
                                    <img height="120px" src="https://asgwebpageprodstorage.blob.core.windows.net/static/assets/images/Blue%20White%20Robot%20Technology%20Logo.png"></img>
                                }
                                <h1 className={styles.chatEmptyStateTitle}>¡Adquisiciones en un click!</h1>
                                <h2 className={styles.chatEmptyStateSubtitle}>Haz cualquier pregunta o utiliza uno de los siguientes ejemplos</h2>
                                <ExampleList onExampleClicked={onExampleClicked} />
                            </div>
                        ) : (

                            <div className={styles.chatMessageStream}>
                                {isViewingHistory && (
                                    <div className={styles.historyBanner}>
                                        Esta es una conversación del Historial de Conversaciones
                                    </div>
                                )}

                                {conversation.map((item, index) => (
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

                                                // CHANGED currentConversation.length - 1 ? (     TO      conversation.length - 1 ? (
                                                // This Generates the response of an answer
                                                isLoading && index === conversation.length - 1 ? (
                                                    <AnswerLoading />
                                                ) : (
                                                    <div>No answer available</div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}

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

                        {/* This is for viewing the ChatInput Section wether you are in a Current State or History */}
                        {/* {(isViewingHistory ? historyConversation : currentConversation) && ( */}
                        {(!isViewingHistory || historyConversation.length > 0) && (
                            <div className={styles.chatInput}>

                                <div className={btnStyles.chatButtons}>
                                    {/* Create a New Conversations  */}
                                    <NewChatButton className={`${btnStyles.buttonStructure} ${btnStyles.backBtn}`} onClick={goBackToCurrentConversation} />
                                    <ClearChatButton className={`${btnStyles.buttonStructure} ${btnStyles.deleteConversationBtn}`} onClick={clearChat} />
                                </div>

                                <QuestionInput
                                    clearOnSend
                                    placeholder={placeholderText}
                                    disabled={isLoading}
                                    onSend={makeApiRequestGpt}
                                />
                            </div>

                        )}
                    </div>

                    {/* This Opens AnalysisPanel when Sources is clicked in History State  */}
                    {(isViewingHistory ? historyConversation : currentConversation).length > 0 && activeAnalysisPanelTab && (
                        <AnalysisPanel
                            className={styles.chatAnalysisPanel}
                            activeCitation={activeCitation}
                            onActiveTabChanged={x => onToggleTab(x as AnalysisPanelTabs, selectedAnswer)}
                            citationHeight="720px"
                            answer={(isViewingHistory ? historyConversation : currentConversation)[selectedAnswer]?.bot!}
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



