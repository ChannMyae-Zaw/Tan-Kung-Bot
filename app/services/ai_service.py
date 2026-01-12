from google import genai
from google.genai import types
from app.core.config import settings

client = genai.Client(api_key=settings.API_KEY)

# Dictionary to store history lists
sessions_db = {}

async def get_chat_response(user_input: str, session_id: str, user_name: str):
    # 1. Get or create history
    is_new_session = session_id not in sessions_db
    if is_new_session:
        sessions_db[session_id] = []
    
    # 2. If it's the first message, prepend the name context
    # This ensures Gemini knows who it is talking to from the start
    processed_input = user_input
    if is_new_session:
        processed_input = f"[Context: The user's name is {user_name}] {user_input}"

    # 3. Add User message to the local history
    sessions_db[session_id].append(
        types.Content(role="user", parts=[types.Part(text=processed_input)])
    )

    # 4. Request generation from Gemini with history
    response = client.models.generate_content(
        model=settings.MODEL_NAME,
        contents=sessions_db[session_id],
        config=types.GenerateContentConfig(
            system_instruction=settings.SYSTEM_INSTRUCTION,
            temperature=0.3,
        )
    )

    # 5. Add Model response to the local history
    sessions_db[session_id].append(
        types.Content(role="model", parts=[types.Part(text=response.text)])
    )

    # 6. Safety: Keep only last 10 turns (20 messages)
    if len(sessions_db[session_id]) > 20:
        # If we trim history, we should try to preserve the first message 
        # (which contains the name context) if possible, or update the system prompt.
        sessions_db[session_id] = sessions_db[session_id][-20:]
    
    return response.text