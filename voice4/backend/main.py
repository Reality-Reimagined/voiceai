from fastapi import FastAPI, HTTPException, Depends, UploadFile, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, List, Union
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
import json
from datetime import datetime
from f5_tts.infer.cli import TTSInference
from f5_tts.socket_server import RealTimeInference
from f5_tts.infer.speech_edit import SpeechEditor

load_dotenv()

app = FastAPI(title="VoiceAI API", version="1.0.0")
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY")
)

# Enhanced models
class WebhookConfig(BaseModel):
    url: HttpUrl
    events: List[str]
    is_active: bool = True

class VoiceConfig(BaseModel):
    name: str
    language: str
    gender: str
    accent: Optional[str]
    style_tags: List[str] = []
    description: Optional[str]

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    style: Optional[str] = None
    language: str = "en"
    speed: float = 1.0
    pitch: float = 1.0
    energy: float = 1.0

class SpeechEditRequest(BaseModel):
    audio_url: str
    edit_type: str
    parameters: Dict[str, float]
    segments: Optional[List[Dict[str, Union[float, str]]]] = None

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Enhanced TTSManager
class TTSManager:
    def __init__(self):
        self.tts_models: Dict[str, TTSInference] = {}
        self.realtime_tts = RealTimeInference()
        self.speech_editor = SpeechEditor()
        self.load_voice_configs()
        self.webhook_configs: Dict[str, WebhookConfig] = {}

    def load_voice_configs(self):
        self.tts_models["default"] = TTSInference()
        config_dir = Path("voice_configs")
        if config_dir.exists():
            for config_file in config_dir.glob("*.toml"):
                with open(config_file, "rb") as f:
                    config = tomli.load(f)
                    voice_id = config_file.stem
                    self.tts_models[voice_id] = TTSInference(config=config)

    async def send_webhook(self, event: str, data: dict):
        for config in self.webhook_configs.values():
            if config.is_active and event in config.events:
                try:
                    async with httpx.AsyncClient() as client:
                        await client.post(str(config.url), json={
                            "event": event,
                            "timestamp": datetime.utcnow().isoformat(),
                            "data": data
                        })
                except Exception as e:
                    print(f"Webhook delivery failed: {e}")

tts_manager = TTSManager()

# Enhanced endpoints
@app.post("/api/tts")
async def text_to_speech(
    request: TTSRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    try:
        tts_model = tts_manager.tts_models.get(request.voice_id, tts_manager.tts_models["default"])
        
        audio_path = tts_model.generate(
            text=request.text,
            voice_id=request.voice_id,
            style=request.style,
            language=request.language,
            speed=request.speed,
            pitch=request.pitch,
            energy=request.energy
        )
        
        with open(audio_path, "rb") as f:
            file_path = f"tts_output/{current_user.id}/{os.path.basename(audio_path)}"
            supabase.storage.from_("audio").upload(file_path, f)
            
        audio_url = supabase.storage.from_("audio").get_public_url(file_path)
        
        background_tasks.add_task(
            tts_manager.send_webhook,
            "tts.completed",
            {"user_id": current_user.id, "audio_url": audio_url}
        )
        
        return {"audio_url": audio_url}
    except Exception as e:
        background_tasks.add_task(
            tts_manager.send_webhook,
            "tts.failed",
            {"user_id": current_user.id, "error": str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/webhooks")
async def configure_webhook(
    config: WebhookConfig,
    current_user = Depends(get_current_user)
):
    try:
        webhook_id = f"webhook_{current_user.id}"
        tts_manager.webhook_configs[webhook_id] = config
        return {"status": "success", "webhook_id": webhook_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voices")
async def list_voices(current_user = Depends(get_current_user)):
    try:
        voices = []
        config_dir = Path("voice_configs")
        if config_dir.exists():
            for config_file in config_dir.glob("*.toml"):
                with open(config_file, "rb") as f:
                    config = tomli.load(f)
                    voice_config = VoiceConfig(
                        name=config.get("name", config_file.stem),
                        language=config.get("language", "en"),
                        gender=config.get("gender", "unknown"),
                        accent=config.get("accent"),
                        style_tags=config.get("style_tags", []),
                        description=config.get("description")
                    )
                    voices.append(voice_config.dict())
        return voices
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speech-edit")
async def edit_speech(
    request: SpeechEditRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    try:
        # Download audio from URL
        response = await supabase.storage.from_("audio").download(request.audio_url)
        
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(response.data)
            input_path = temp_file.name
        
        # Apply speech editing
        output_path = tts_manager.speech_editor.edit_speech(
            input_path,
            request.edit_type,
            request.parameters,
            segments=request.segments
        )
        
        # Upload edited audio
        with open(output_path, "rb") as f:
            file_path = f"edited/{current_user.id}/{os.path.basename(output_path)}"
            supabase.storage.from_("audio").upload(file_path, f)
            
        audio_url = supabase.storage.from_("audio").get_public_url(file_path)
        
        background_tasks.add_task(
            tts_manager.send_webhook,
            "speech.edited",
            {"user_id": current_user.id, "audio_url": audio_url}
        )
        
        # Cleanup
        os.unlink(input_path)
        os.unlink(output_path)
        
        return {"audio_url": audio_url}
    except Exception as e:
        background_tasks.add_task(
            tts_manager.send_webhook,
            "speech.edit_failed",
            {"user_id": current_user.id, "error": str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))