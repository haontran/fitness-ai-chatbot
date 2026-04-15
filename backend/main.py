from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print("API KEY LOADED:", api_key)

genai.configure(api_key=api_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatInput(BaseModel):
    message: str

@app.get("/")
def root():
    return {"message": "backend is running"}

@app.get("/models")
def list_models():
    models = []
    for m in genai.list_models():
        methods = getattr(m, "supported_generation_methods", [])
        models.append({
            "name": m.name,
            "methods": methods
        })
    return {"models": models}

@app.post("/chat")
def chat(user_input: ChatInput):
    try:
        prompt = f"""
        You are a helpful fitness chatbot.
        Answer the user's question clearly and safely.

        User message: {user_input.message}
        """

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)

        return {"reply": response.text}

    except Exception as e:
        return {"error": str(e)}