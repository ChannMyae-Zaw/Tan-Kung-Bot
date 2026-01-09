import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.services.ai_service import get_chat_response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Get absolute path to the directory containing main.py
current_dir = os.path.dirname(os.path.abspath(__file__))
# Get the root directory (one level up from 'app')
root_dir = os.path.dirname(current_dir)
static_path = os.path.join(root_dir, "static")

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
        raise HTTPException(status_code=500, detail="Tan-kung is taking a nap.")

# Mount with the absolute path
app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.get("/")
async def read_index():
    # Return index.html using the absolute path
    index_file = os.path.join(static_path, "index.html")
    return FileResponse(index_file)