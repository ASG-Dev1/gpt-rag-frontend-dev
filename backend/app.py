import os
import mimetypes
import time
import logging
import requests
import json
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

load_dotenv()

SPEECH_REGION = os.getenv('SPEECH_REGION')
ORCHESTRATOR_ENDPOINT = os.getenv('ORCHESTRATOR_ENDPOINT')
ORCHESTRATOR_URI = os.getenv('ORCHESTRATOR_URI')
STORAGE_ACCOUNT = os.getenv('STORAGE_ACCOUNT')
LOGLEVEL = os.environ.get('LOGLEVEL', 'INFO').upper()
logging.basicConfig(level=LOGLEVEL)

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

app = Flask(__name__)
CORS(app)

@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def static_file(path):
    return app.send_static_file(path)
@app.route("/chatgpt", methods=["POST"])
def chatgpt():
    conversation_id = request.json.get("conversation_id", None)
    question = request.json["query"]
    client_principal_id = request.headers.get('X-MS-CLIENT-PRINCIPAL-ID')
    client_principal_name = request.headers.get('X-MS-CLIENT-PRINCIPAL-NAME')

    # If conversation_id is None, generate a new conversation ID (e.g., using UUID)
    if conversation_id is None:
        conversation_id = str(uuid.uuid4())  # Generate new conversation ID

    logging.info(f"[webbackend] conversation_id: {conversation_id}")    
    logging.info(f"[webbackend] question: {question}")
    logging.info(f"[webbackend] User principal: {client_principal_id}")
    logging.info(f"[webbackend] User name: {client_principal_name}")

    # Process the request and call the orchestrator with the conversation ID
    # Ensure to return the conversation_id in the response
    try:
        functionKey = get_secret('orchestrator-host--functionKey')
        url = ORCHESTRATOR_ENDPOINT
        payload = json.dumps({
            "conversation_id": conversation_id,
            "question": question,
            "client_principal_id": client_principal_id,
            "client_principal_name": client_principal_name
        })
        headers = {
            'Content-Type': 'application/json',
            'x-functions-key': functionKey
        }
        response = requests.post(url, headers=headers, data=payload)
        logging.info(f"[webbackend] response status code: {response.status_code}")
        logging.info(f"[webbackend] response text: {response.text[:500]}...")
        
        if response.status_code != 200:
            logging.error(f"[webbackend] Error response from orchestrator: {response.status_code} {response.reason}")
            return jsonify({
                "conversation_id": conversation_id,
                "error": f"Orchestrator returned status code {response.status_code}",
                "details": response.text[:500]  # Include a snippet of the response text
            }), response.status_code

        try:
                response_json = response.json()
        except json.JSONDecodeError as e:
            logging.error(f"[webbackend] Failed to decode JSON response: {str(e)}")
            logging.error(f"[webbackend] Response text: {response.text[:500]}...")
            return jsonify({
                "conversation_id": conversation_id,
                "error": "Failed to decode JSON response from orchestrator"
            }), 500

        return jsonify({"conversation_id": conversation_id, **response_json})

    except Exception as e:
        logging.exception("[webbackend] exception in /chatgpt")
        return jsonify({"error": str(e)}), 500



@app.route("/api/get-speech-token", methods=["GET"])
def getGptSpeechToken():
    try:
        fetch_token_url = f"https://{SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
        headers = {
            'Ocp-Apim-Subscription-Key': SPEECH_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        response = requests.post(fetch_token_url, headers=headers)
        access_token = str(response.text)
        return json.dumps({'token': access_token, 'region': SPEECH_REGION, 'speechRecognitionLanguage': SPEECH_RECOGNITION_LANGUAGE, 'speechSynthesisLanguage': SPEECH_SYNTHESIS_LANGUAGE, 'speechSynthesisVoiceName': SPEECH_SYNTHESIS_VOICE_NAME})
    except Exception as e:
        logging.exception("[webbackend] exception in /api/get-speech-token")
        return jsonify({"error": str(e)}), 500

@app.route("/api/get-storage-account", methods=["GET"])
def getStorageAccount():
    if STORAGE_ACCOUNT is None or STORAGE_ACCOUNT == '':
        return jsonify({"error": "Add STORAGE_ACCOUNT to frontend app settings"}), 500
    try:
        return json.dumps({'storageaccount': STORAGE_ACCOUNT})
    except Exception as e:
        logging.exception("[webbackend] exception in /api/get-storage-account")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000)
