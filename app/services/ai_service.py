from google import genai
from google.genai import types
from app.core.config import settings

client = genai.Client(api_key=settings.API_KEY)

# Dictionary to store history lists
# Each entry will be a list of {'role': '...', 'parts': [{'text': '...'}]}
sessions_db = {}

async def get_chat_response(user_input: str, session_id: str):
    # 1. Get or create history
    if session_id not in sessions_db:
        sessions_db[session_id] = []
    
    # 2. Add User message to the local history
    sessions_db[session_id].append(
        types.Content(role="user", parts=[types.Part(text=user_input)])
    )

    # 3. Request generation from Gemini with history
    response = client.models.generate_content(
        model=settings.MODEL_NAME,
        contents=sessions_db[session_id], # Pass the whole list
        config=types.GenerateContentConfig(
            system_instruction=settings.SYSTEM_INSTRUCTION,
            temperature=0.3,
        )
    )

    # 4. Add Model response to the local history
    sessions_db[session_id].append(
        types.Content(role="model", parts=[types.Part(text=response.text)])
    )

    # 5. Production Scalability: Keep only last 10 turns (20 messages)
    # This prevents the prompt from getting too long/expensive
    if len(sessions_db[session_id]) > 20:
        sessions_db[session_id] = sessions_db[session_id][-20:]
    
    return response.text