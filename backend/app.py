import os
import mimetypes
import time
import logging
import json
import uuid
from quart import Quart, request, jsonify
from quart_cors import cors
from dotenv import load_dotenv
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential
from azure.cosmos.aio import CosmosClient
import aiohttp  # Async HTTP client

load_dotenv()

SPEECH_REGION = os.getenv('SPEECH_REGION')
ORCHESTRATOR_ENDPOINT = os.getenv('ORCHESTRATOR_ENDPOINT')
ORCHESTRATOR_URI = os.getenv('ORCHESTRATOR_URI')
STORAGE_ACCOUNT = os.getenv('STORAGE_ACCOUNT')
LOGLEVEL = os.environ.get('LOGLEVEL', 'INFO').upper()
logging.basicConfig(level=LOGLEVEL)

# Env for COSMOSDB Connection
AZURE_DB_NAME = os.environ.get("AZURE_DB_NAME")
COSMOSDB_KEY = os.environ.get("COSMOSDB_KEY")
COSMOSDB_CONTAINER = os.environ.get("COSMOSDB_CONTAINER")
COSMOSDB_URI = os.environ.get("COSMOSDB_URI")

def get_secret(secretName):
    keyVaultName = os.environ["AZURE_KEY_VAULT_NAME"]
    KVUri = f"https://{keyVaultName}.vault.azure.net"
    credential = DefaultAzureCredential()
    client = SecretClient(vault_url=KVUri, credential=credential)
    logging.info(f"[webbackend] retrieving {secretName} secret from {keyVaultName}.")
    retrieved_secret = client.get_secret(secretName)
    return retrieved_secret.value


SPEECH_KEY = get_secret('speechKey')

SPEECH_RECOGNITION_LANGUAGE = os.getenv('SPEECH_RECOGNITION_LANGUAGE')
SPEECH_SYNTHESIS_LANGUAGE = os.getenv('SPEECH_SYNTHESIS_LANGUAGE')
SPEECH_SYNTHESIS_VOICE_NAME = os.getenv('SPEECH_SYNTHESIS_VOICE_NAME')

app = cors(Quart(__name__))

# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

@app.route("/", defaults={"path": "index.html"})
# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

@app.route("/<path:path>")
async def static_file(path):
    return await app.send_static_file(path)

# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

@app.route("/chatgpt", methods=["POST"])
async def chatgpt():
    try:
        # Correctly get JSON asynchronously
        data = await request.get_json()
        conversation_id = data.get("conversation_id", None)
        question = data["query"]
        client_principal_id = request.headers.get('X-MS-CLIENT-PRINCIPAL-ID')
        client_principal_name = request.headers.get('X-MS-CLIENT-PRINCIPAL-NAME')

        if conversation_id is None:
            conversation_id = str(uuid.uuid4())  # Generate new conversation ID

        logging.info(f"[webbackend] conversation_id: {conversation_id}")
        logging.info(f"[webbackend] question: {question}")
        logging.info(f"[webbackend] User principal: {client_principal_id}")
        logging.info(f"[webbackend] User name: {client_principal_name}")

        # Make asynchronous HTTP request using aiohttp
        functionKey = get_secret('orchestrator-host--functionKey')
        url = ORCHESTRATOR_ENDPOINT
        payload = {
            "conversation_id": conversation_id,
            "question": question,
            "client_principal_id": client_principal_id,
            "client_principal_name": client_principal_name
        }
        headers = {
            'Content-Type': 'application/json',
            'x-functions-key': functionKey
        }

        # Async HTTP POST request
# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as response:
                response_text = await response.text()
                logging.info(f"[webbackend] response status code: {response.status}")
                logging.info(f"[webbackend] response text: {response_text[:500]}...")

                if response.status != 200:
                    logging.error(f"[webbackend] Error response from orchestrator: {response.status}")
                    return jsonify({
                        "conversation_id": conversation_id,
                        "error": f"Orchestrator returned status code {response.status}",
                        "details": response_text[:500]
                    }), response.status

                # Ensure the response is JSON
                try:
                    response_json = await response.json()
                except aiohttp.ContentTypeError:
                    logging.error(f"[webbackend] Failed to decode JSON response.")
                    return jsonify({
                        "conversation_id": conversation_id,
                        "error": "Failed to decode JSON response from orchestrator"
                    }), 500

        return jsonify({"conversation_id": conversation_id, **response_json})

    except Exception as e:
        logging.exception("[webbackend] exception in /chatgpt")
        return jsonify({"error": str(e)}), 500


# Async methods to provide access to speech services and blob storage account blobs
# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

@app.route("/api/get-speech-token", methods=["GET"])
async def getGptSpeechToken():
    try:
        fetch_token_url = f"https://{SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
        headers = {
            'Ocp-Apim-Subscription-Key': SPEECH_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(fetch_token_url, headers=headers) as response:
                access_token = await response.text()
                return json.dumps({
                    'token': access_token,
                    'region': SPEECH_REGION,
                    'speechRecognitionLanguage': SPEECH_RECOGNITION_LANGUAGE,
                    'speechSynthesisLanguage': SPEECH_SYNTHESIS_LANGUAGE,
                    'speechSynthesisVoiceName': SPEECH_SYNTHESIS_VOICE_NAME
                })
    except Exception as e:
        logging.exception("[webbackend] exception in /api/get-speech-token")
        return jsonify({"error": str(e)}), 500

# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

@app.route("/api/get-storage-account", methods=["GET"])
async def getStorageAccount():
    if STORAGE_ACCOUNT is None or STORAGE_ACCOUNT == '':
        return jsonify({"error": "Add STORAGE_ACCOUNT to frontend app settings"}), 500
    try:
        return json.dumps({'storageaccount': STORAGE_ACCOUNT})
    except Exception as e:
        logging.exception("[webbackend] exception in /api/get-storage-account")
        return jsonify({"error": str(e)}), 500

# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

@app.route("/get_ChatHistory", methods=["GET"])
async def fetch_chat_history():
    logging.info("Fetching Chat History")
    try:
        logging.info("Inside Chat History")
        async with CosmosClient(COSMOSDB_URI, COSMOSDB_KEY) as client:
            database = client.get_database_client(AZURE_DB_NAME)
            container = database.get_container_client(COSMOSDB_CONTAINER)
            print(database)
            print(container)

            query = "SELECT c.id, i.user_id, i.user_ask, i.answer, (SELECT VALUE ARRAY( SELECT VALUE h.content FROM h IN c.history WHERE h.role = 'user')) AS content FROM c JOIN i IN c.conversation_data.interactions"
            items = container.query_items(query=query, partition_key=None)

            result = []
            async for item in items:
                if 'title' in item and isinstance(item['title'], list) and len(item['title']) == 1:
                    item['title'] = item['title'][0]
                result.append(item)

            print("This is a jsonify test of result APP")
            print(result)
            return jsonify(result)

    except Exception as e:
        logging.error("Error fetching chat history: %s", e)
        return jsonify([])
    
# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

@app.route("/api/conversations/<conversation_id>", methods=["GET"])
async def get_conversation(conversation_id):
    logging.info(f"Fetching conversation with ID: {conversation_id}")
    try:
        async with CosmosClient(COSMOSDB_URI, COSMOSDB_KEY) as client:
            database = client.get_database_client(AZURE_DB_NAME)
            container = database.get_container_client(COSMOSDB_CONTAINER)

            query = f"SELECT * FROM c WHERE c.id = '{conversation_id}'"
            items = container.query_items(query=query, partition_key=None)

            result = []
            logging.info(f"Fetched conversation: {result}, Query: {query}, PartitionKey: {conversation_id}, Items of Query: {items}")

            async for item in items:
                result.append(item)

            if len(result) == 0:
                return jsonify({"error": "Conversation not found"}), 404

            return jsonify(result[0])  # return the matching conversation

    except Exception as e:
        logging.error(f"Error fetching conversation with ID {conversation_id}: {e}")
        return jsonify({"error": str(e)}), 500

# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# @app.route("/editOrDeleteConversation/<conversation_id>/<mode>")
# async def editOrDeleteConversation(conversationID, newConversationID, mode):
    
#     if(mode == "edit"):
#         try:
#             item = container.read_item(item=conversation_id)
#             item.update(newConversationID)
#     elif(mode == "delete"):
#         try: 
#             async with CosmosClient(COSMOSDB_URI, COSMOSDB_KEY) as client:
#                 database = client.get_database_client(AZURE_DB_NAME)
#                 container = database.get_container_client(COSMOSDB_CONTAINER)
#                 container.delete_item(item=conversation_id)
#         except exceptions.CosmosResourceNotFoundError:
#             print(f"Item with ID {id} not found.")
#             return False
#         except exceptions.CosmosHttpResponseError as e:
#             print(f"An error occurred: {e}")
#             return False      

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000)
