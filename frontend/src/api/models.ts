export const enum Approaches {
  RetrieveThenRead = "rtr",
  ReadRetrieveRead = "rrr",
  ReadDecomposeAsk = "rda"
}

export type AskRequestOverrides = {
  semanticRanker?: boolean;
  semanticCaptions?: boolean;
  excludeCategory?: string;
  top?: number;
  temperature?: number;
  promptTemplate?: string;
  promptTemplatePrefix?: string;
  promptTemplateSuffix?: string;
  suggestFollowupQuestions?: boolean;
};

export type AskRequest = {
  question: string;
  approach: Approaches;
  overrides?: AskRequestOverrides;
};

export type AskResponse = {
  answer: string;
  thoughts: string | null;
  data_points: string[];
  error?: string;
};

export type TransactionData = {
  cuenta_origen: string;
  monto: string;
  telefono_destino: string;
}

export type AskResponseGpt = {
  conversation_id: string;
  answer: string;
  current_state: string;
  thoughts: string | null;
  data_points: string[];
  transaction_data?: TransactionData;
  error?: string;
};

export type ChatTurn = {
  user: string;
  bot?: string;
};

export type ChatRequest = {
  history: ChatTurn[];
  approach: Approaches;
  overrides?: AskRequestOverrides;
};

export type ChatRequestGpt = {
  history: ChatTurn[];
  approach: Approaches;
  conversation_id: string;
  query: string;
  overrides?: AskRequestOverrides;
};

// To add Chat History
export type ChatMessage = {
  id: string
  role: string
  content: string
  end_turn?: boolean
  date: string
  feedback?: Feedback
  context?: string
}

export enum ChatHistoryLoadingState {
  Loading = 'loading',
  Success = 'success',
  Fail = 'fail',
  NotStarted = 'notStarted'
}

export interface Conversation {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[]; // if ChatMessage is another interface
  pdfKey?: string;
}

export type CosmosDBHealth = {
  cosmosDB: boolean
  status: string
}

export enum CosmosDBStatus {
  NotConfigured = 'CosmosDB is not configured',
  NotWorking = 'CosmosDB is not working',
  InvalidCredentials = 'CosmosDB has invalid credentials',
  InvalidDatabase = 'Invalid CosmosDB database name',
  InvalidContainer = 'Invalid CosmosDB container name',
  Working = 'CosmosDB is configured and working'
}

export type FrontendSettings = {
  auth_enabled?: string | null
  feedback_enabled?: string | null
  ui?: UI
  sanitize_answer?: boolean
}

export type UI = {
  title: string
  chat_title: string
  chat_description: string
  logo?: string
  chat_logo?: string
  show_share_button?: boolean
}

export enum Feedback {
  Neutral = 'neutral',
  Positive = 'positive',
  Negative = 'negative',
  MissingCitation = 'missing_citation',
  WrongCitation = 'wrong_citation',
  OutOfScope = 'out_of_scope',
  InaccurateOrIrrelevant = 'inaccurate_or_irrelevant',
  OtherUnhelpful = 'other_unhelpful',
  HateSpeech = 'hate_speech',
  Violent = 'violent',
  Sexual = 'sexual',
  Manipulative = 'manipulative',
  OtherHarmful = 'other_harmlful'
}
