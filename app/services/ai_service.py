from google import genai
from google.genai import types
from openai import OpenAI
from app.core.config import settings

# Initialize Clients
gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Separate history stores for different data structures
sessions_db = {}

async def get_chat_response(user_input: str, session_id: str, user_name: str, company_name: str, phone: str, email: str):
    """Main router to select between Gemini and OpenAI."""
    
    # 1. Determine if it's a new session
    is_new_session = session_id not in sessions_db
    
    # 2. Setup the processed_input (Your specific logic)
    processed_input = user_input
    if is_new_session:
        processed_input = f"[You are talking to {user_name} from {company_name}. User Email: {email}, Phone: {phone}] {user_input}"

    # 3. Route to the active provider
    if settings.ACTIVE_LLM == "openai":
        return await _get_openai_response(processed_input, session_id, is_new_session)
    else:
        return await _get_gemini_response(processed_input, session_id, is_new_session)

# --- OPENAI STRATEGY ---
async def _get_openai_response(processed_input, session_id, is_new):
    if is_new:
        # Initialize OpenAI List with System Prompt
        sessions_db[session_id] = [
            {"role": "system", "content": f"{settings.SYSTEM_INSTRUCTION}\nNote: Use the user's name naturally once, but do not repeat it in every response."}
        ]
    
    # Add User message
    sessions_db[session_id].append({"role": "user", "content": processed_input})
    
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=sessions_db[session_id],
        temperature=0.3
    )
    
    reply = response.choices[0].message.content
    sessions_db[session_id].append({"role": "assistant", "content": reply})
    
    # Safety: Trim history while keeping System (0) and First Context Message (1)
    if len(sessions_db[session_id]) > 21:
        sessions_db[session_id] = sessions_db[session_id][:2] + sessions_db[session_id][-19:]
        
    return reply

# --- GEMINI STRATEGY ---
async def _get_gemini_response(processed_input, session_id, is_new):
    if is_new:
        sessions_db[session_id] = []

    # Add User message
    sessions_db[session_id].append(
        types.Content(role="user", parts=[types.Part(text=processed_input)])
    )
    
    response = gemini_client.models.generate_content(
        model=settings.GEMINI_MODEL_NAME,
        contents=sessions_db[session_id],
        config=types.GenerateContentConfig(
            system_instruction=f"{settings.SYSTEM_INSTRUCTION}\nNote: Use the user's name naturally once, but do not repeat it in every response.",
            temperature=0.3,
        )
    )
    
    reply = response.text
    sessions_db[session_id].append(
        types.Content(role="model", parts=[types.Part(text=reply)])
    )
    
    # Safety: Trim history while keeping the First Context Message (0)
    if len(sessions_db[session_id]) > 20:
        sessions_db[session_id] = [sessions_db[session_id][0]] + sessions_db[session_id][-19:]
        
    return reply