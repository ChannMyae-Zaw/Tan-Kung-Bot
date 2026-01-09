from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.services.ai_service import get_chat_response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    session_id: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        reply = await get_chat_response(request.message, request.session_id)
        return {"reply": reply}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Tan-kung is taking a nap. Try again later.")

# Serve the test frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse('static/index.html')