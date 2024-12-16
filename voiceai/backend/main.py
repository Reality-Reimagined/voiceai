from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import stripe
from supabase import create_client, Client
from f5_tts.infer.cli import TTSInference

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Initialize Supabase
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY")
)

# Initialize F5-TTS
tts_model = TTSInference()

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    style: Optional[str] = None
    language: Optional[str] = "en"

@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    try:
        # Process TTS request using F5-TTS
        audio_path = tts_model.generate(
            text=request.text,
            voice_id=request.voice_id,
            style=request.style,
            language=request.language
        )
        
        # Upload to storage and return URL
        # Implementation depends on your storage solution
        return {"audio_url": audio_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clone-voice")
async def clone_voice(audio_file: UploadFile):
    try:
        # Implement voice cloning logic using F5-TTS
        # This is a placeholder - implement according to F5-TTS documentation
        return {"status": "processing"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/create-checkout-session")
async def create_checkout_session():
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": os.getenv("STRIPE_PRICE_ID"),
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url="http://localhost:5173/dashboard?success=true",
            cancel_url="http://localhost:5173/dashboard?canceled=true",
        )
        return {"sessionId": checkout_session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))