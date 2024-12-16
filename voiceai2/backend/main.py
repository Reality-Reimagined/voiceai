from fastapi import FastAPI, HTTPException, Depends, UploadFile, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
import os
from dotenv import load_dotenv
import stripe
from supabase import create_client, Client
import asyncio
import numpy as np
import tomli
from pathlib import Path
import tempfile
import wave
from f5_tts.infer.cli import TTSInference
from f5_tts.socket_server import RealTimeInference

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

# Initialize F5-TTS with different configurations
class TTSManager:
    def __init__(self):
        self.tts_models: Dict[str, TTSInference] = {}
        self.realtime_tts = RealTimeInference()
        self.load_voice_configs()

    def load_voice_configs(self):
        # Load default model
        self.tts_models["default"] = TTSInference()
        
        # Load voice configurations from TOML files
        config_dir = Path("voice_configs")
        if config_dir.exists():
            for config_file in config_dir.glob("*.toml"):
                with open(config_file, "rb") as f:
                    config = tomli.load(f)
                    voice_id = config_file.stem
                    self.tts_models[voice_id] = TTSInference(config=config)

tts_manager = TTSManager()

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    style: Optional[str] = None
    language: Optional[str] = "en"

class VoiceCloneRequest(BaseModel):
    name: str
    reference_text: Optional[str] = None

@app.websocket("/ws/tts")
async def websocket_tts(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            request = TTSRequest.parse_raw(data)
            
            # Use realtime TTS inference
            audio_generator = tts_manager.realtime_tts.generate_stream(
                text=request.text,
                voice_id=request.voice_id,
                style=request.style,
                language=request.language
            )
            
            async for audio_chunk in audio_generator:
                # Convert numpy array to bytes
                audio_bytes = audio_chunk.astype(np.float32).tobytes()
                await websocket.send_bytes(audio_bytes)
                
            # Send end marker
            await websocket.send_text("END_OF_AUDIO")
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    try:
        # Get appropriate TTS model
        tts_model = tts_manager.tts_models.get(request.voice_id, tts_manager.tts_models["default"])
        
        # Generate audio
        audio_path = tts_model.generate(
            text=request.text,
            voice_id=request.voice_id,
            style=request.style,
            language=request.language
        )
        
        # Upload to Supabase storage
        with open(audio_path, "rb") as f:
            file_path = f"tts_output/{os.path.basename(audio_path)}"
            supabase.storage.from_("audio").upload(file_path, f)
            
        # Get public URL
        audio_url = supabase.storage.from_("audio").get_public_url(file_path)
        
        return {"audio_url": audio_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clone-voice")
async def clone_voice(
    request: VoiceCloneRequest,
    audio_file: UploadFile
):
    try:
        # Create temporary file for the uploaded audio
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        # Create TOML configuration for the new voice
        voice_config = {
            "model": "F5-TTS",
            "ref_audio": temp_path,
            "ref_text": request.reference_text or "",
            "remove_silence": True,
            "output_dir": "voice_models"
        }

        # Save voice configuration
        config_path = Path("voice_configs") / f"{request.name}.toml"
        config_path.parent.mkdir(exist_ok=True)
        
        with open(config_path, "wb") as f:
            tomli.dump(voice_config, f)

        # Initialize new voice model
        tts_manager.tts_models[request.name] = TTSInference(config=voice_config)

        return {
            "status": "success",
            "message": f"Voice '{request.name}' created successfully",
            "voice_id": request.name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temporary file
        if 'temp_path' in locals():
            os.unlink(temp_path)

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