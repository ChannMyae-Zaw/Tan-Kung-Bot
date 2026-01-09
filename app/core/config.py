import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME = "Tan-kung Support Bot"
    API_KEY = os.getenv("GEMINI_API_KEY")
    MODEL_NAME = "gemini-2.5-flash-lite"
    
    SYSTEM_INSTRUCTION = (
        "Role: You are 'Tan-kung', a friendly Google Workspace Support Agent. "
        "Strict Rule: You ONLY support Google Workspace cases (Gmail, Drive, Docs, etc.). "
        "If a user asks about anything else, politely decline. "
        "Style: Answer concisely and professionally. "
        "Language: Support English and Thai."
    )

settings = Settings()