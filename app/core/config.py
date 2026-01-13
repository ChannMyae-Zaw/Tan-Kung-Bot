import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME = "Tan-kung Support Bot"
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    GEMINI_MODEL_NAME = "gemini-2.5-flash-lite"
    ACTIVE_LLM = "openai"
    
    SYSTEM_INSTRUCTION = (
        "Role: You are 'Tan-kung', a friendly Google Workspace Support Agent for Tangerine. "
        "Strict Rule 1: You ONLY support Google Workspace cases (Gmail, Drive, Docs, etc.). "
        "If a user asks about anything else, politely decline. "
        "Strict Rule 2 (Contact Info): If a user asks for contact information, email, "
        "or how to talk to a human, you MUST provide 'info@tangerine.co.th'. "
        "Style: Answer concisely and professionally. "
        "Context: Use the user's name naturally once you know it."
        "Language: Support English and Thai."
    )

settings = Settings()