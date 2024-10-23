import { AskRequest, AskResponse, AskResponseGpt, ChatRequest, ChatRequestGpt, ChatMessage, Conversation, CosmosDBHealth, CosmosDBStatus } from "./models";



export async function chatApiGpt(options: ChatRequestGpt): Promise<AskResponseGpt> {
  const response = await fetch("/chatgpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      history: options.history,
      approach: options.approach,
      conversation_id: options.conversation_id,
      query: options.query,
      overrides: {
        semantic_ranker: options.overrides?.semanticRanker,
        semantic_captions: options.overrides?.semanticCaptions,
        top: options.overrides?.top,
        temperature: options.overrides?.temperature,
        prompt_template: options.overrides?.promptTemplate,
        prompt_template_prefix: options.overrides?.promptTemplatePrefix,
        prompt_template_suffix: options.overrides?.promptTemplateSuffix,
        exclude_category: options.overrides?.excludeCategory,
        suggest_followup_questions: options.overrides?.suggestFollowupQuestions
      }
    })
  });

  const parsedResponse: AskResponseGpt = await response.json();
  if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
  }

  return parsedResponse;
}

export function getCitationFilePath(citation: string): string {
  var storage_account = "please_check_if_storage_account_is_in_frontend_app_settings";

  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/api/get-storage-account", false);
  xhr.send();

  if (xhr.status > 299) {
    console.log("Please check if STORAGE_ACCOUNT is in frontend app settings");
    return storage_account
  } else {
    const parsedResponse = JSON.parse(xhr.responseText);
    storage_account = parsedResponse['storageaccount'];
  }
  console.log('storage account:' + storage_account);

  return `https://${storage_account}.blob.core.windows.net/attachments/${citation}`;
}

export const frontendSettings = async (): Promise<Response | null> => {
  const response = await fetch('/frontend_settings', {
    method: 'GET'
  })
    .then(res => {
      return res.json()
    })
    .catch(_err => {
      console.error('There was an issue fetching your data.')
      return null
    })

  return response
}

export const historyEnsure = async (): Promise<CosmosDBHealth> => {
  const response = await fetch('/history/ensure', {
    method: 'GET'
  })
    .then(async res => {
      const respJson = await res.json()
      let formattedResponse
      if (respJson.message) {
        formattedResponse = CosmosDBStatus.Working
      } else {
        if (res.status === 500) {
          formattedResponse = CosmosDBStatus.NotWorking
        } else if (res.status === 401) {
          formattedResponse = CosmosDBStatus.InvalidCredentials
        } else if (res.status === 422) {
          formattedResponse = respJson.error
        } else {
          formattedResponse = CosmosDBStatus.NotConfigured
        }
      }
      if (!res.ok) {
        return {
          cosmosDB: false,
          status: formattedResponse
        }
      } else {
        return {
          cosmosDB: true,
          status: formattedResponse
        }
      }
    })
    .catch(err => {
      console.error('There was an issue fetching your data.')
      return {
        cosmosDB: false,
        status: err
      }
    })
  return response
}

export const historyRead = async (convId: string): Promise<ChatMessage[]> => {
  const response = await fetch('/history/read', {
    method: 'POST',
    body: JSON.stringify({
      conversation_id: convId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async res => {
      if (!res) {
        return []
      }
      const payload = await res.json()
      const messages: ChatMessage[] = []
      if (payload?.messages) {
        payload.messages.forEach((msg: any) => {
          const message: ChatMessage = {
            id: msg.id,
            role: msg.role,
            date: msg.createdAt,
            content: msg.content,
            feedback: msg.feedback ?? undefined
          }
          messages.push(message)
        })
      }
      return messages
    })
    .catch(_err => {
      console.error('There was an issue fetching your data.')
      return []
    })
  return response
}

export const historyList = async (offset = 0): Promise<Conversation[] | null> => {
  const response = await fetch(`/history/list?offset=${offset}`, {
    method: 'GET'
  })
    .then(async res => {
      const payload = await res.json()
      if (!Array.isArray(payload)) {
        console.error('There was an issue fetching your data.')
        return null
      }
      const conversations: Conversation[] = await Promise.all(
        payload.map(async (conv: any) => {
          let convMessages: ChatMessage[] = []
          convMessages = await historyRead(conv.id)
            .then(res => {
              return res
            })
            .catch(err => {
              console.error('error fetching messages: ', err)
              return []
            })
          const conversation: Conversation = {
            id: conv.id,
            title: conv.title,
            date: conv.createdAt,
            messages: convMessages
          }
          return conversation
        })
      )
      return conversations
    })
    .catch(_err => {
      console.error('There was an issue fetching your data.')
      return null
    })

  return response
}
export const historyDeleteAll = async (): Promise<Response> => {
  const response = await fetch('/history/delete_all', {
    method: 'DELETE',
    body: JSON.stringify({}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      return res
    })
    .catch(_err => {
      console.error('There was an issue fetching your data.')
      const errRes: Response = {
        ...new Response(),
        ok: false,
        status: 500
      }
      return errRes
    })
  return response
}

export const historyDelete = async (convId: string): Promise<Response> => {
  const response = await fetch('/history/delete', {
    method: 'DELETE',
    body: JSON.stringify({
      conversation_id: convId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      return res
    })
    .catch(_err => {
      console.error('There was an issue fetching your data.')
      const errRes: Response = {
        ...new Response(),
        ok: false,
        status: 500
      }
      return errRes
    })
  return response
}

export const historyRename = async (convId: string, title: string): Promise<Response> => {
  const response = await fetch('/history/rename', {
    method: 'POST',
    body: JSON.stringify({
      conversation_id: convId,
      title: title
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      return res
    })
    .catch(_err => {
      console.error('There was an issue fetching your data.')
      const errRes: Response = {
        ...new Response(),
        ok: false,
        status: 500
      }
      return errRes
    })
  return response
}

export const get_ChatHistory = async () => {
  try {
    const response = await fetch('/get_ChatHistory', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch chat history');
    }

    const data = await response.json();
    // console.log("API data")
    // console.log(data)
    return data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};
