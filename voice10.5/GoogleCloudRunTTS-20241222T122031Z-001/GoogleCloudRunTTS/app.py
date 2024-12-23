from fastapi import FastAPI, UploadFile, HTTPException, File, Form, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import subprocess
import shutil
import uuid
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend origin for stricter security
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all HTTP headers
)

# Define input schemas
class TTSRequest(BaseModel):
    text: str

# Constants for file paths
BASE_DIR = "/workspace/F5-TTS"
OUTPUT_DIR = f"{BASE_DIR}/output"
VOICE_CLONE_DIR = f"{BASE_DIR}/src/f5_tts/infer/examples/basic"
PODCAST_DIR = f"{BASE_DIR}/src/f5_tts/infer/examples/multi"
STORY_TOML_PATH = f"{PODCAST_DIR}/story.toml"

# Ensure directories exist
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(VOICE_CLONE_DIR, exist_ok=True)
os.makedirs(PODCAST_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"message": "F5-TTS HTTP API is running!"}

@app.post("/synthesize/")
def synthesize(request: TTSRequest):
    """
    Basic text-to-speech synthesis.
    """
    output_filename = f"output_{uuid.uuid4().hex}.wav"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    try:
        subprocess.run([
            "f5-tts_infer-cli",
            "--gen_text", request.text,
            "--output_dir", OUTPUT_DIR,
            "--output_file", output_filename
        ], check=True)

        return {"message": "Speech synthesis complete!", "output_file": output_filename}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"CLI Error: {str(e)}")


#voiceclone with ref text from frontend
@app.post("/voiceClone/")
async def voice_clone(
    audio_file: UploadFile = File(...),
    text: str = Form(...),
    ref_text: str = Form(...)  # Added ref_text parameter
):
    """
    Voice cloning endpoint that takes a WAV file, text input, and reference text.
    """
    # Validate audio file
    if not audio_file.filename.endswith('.wav'):
        raise HTTPException(status_code=400, detail="File must be a WAV file")

    # Save the uploaded file as basic_ref_en.wav (This is where the issue was)
    ref_path = os.path.join(VOICE_CLONE_DIR, "basic_ref_en.wav")
    try:
        with open(ref_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save audio file: {str(e)}")

    # Generate output filename
    output_filename = f"clone_{uuid.uuid4().hex}.wav"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    try:
        # Assuming f5-tts_infer-cli supports a --ref_text argument. Verify this!
        subprocess.run([
            "f5-tts_infer-cli",
            "--gen_text", text,
            "--ref_text", ref_text,  # Added ref_text to the command
            "--output_dir", OUTPUT_DIR,
            "--output_file", output_filename
        ], check=True)

        return {"message": "Voice cloning complete!", "output_file": output_filename}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"CLI Error: {str(e)}")




# @app.post("/voiceClone/")
# async def voice_clone(
#     audio_file: UploadFile = File(...),
#     text: str = Form(...)
# ):
#     """
#     Voice cloning endpoint that takes a WAV file and text input.
#     """
#     # Validate audio file
#     if not audio_file.filename.endswith('.wav'):
#         raise HTTPException(status_code=400, detail="File must be a WAV file")

#     # Save the uploaded file as basic_ref_en.wav
#     ref_path = os.path.join(VOICE_CLONE_DIR, "basic_ref_en.wav")
#     try:
#         with open(ref_path, "wb") as buffer:
#             shutil.copyfileobj(audio_file.file, buffer)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to save audio file: {str(e)}")

#     # Generate output filename
#     output_filename = f"clone_{uuid.uuid4().hex}.wav"
#     output_path = os.path.join(OUTPUT_DIR, output_filename)

#     try:
#         subprocess.run([
#             "f5-tts_infer-cli",
#             "--gen_text", text,
#             "--output_dir", OUTPUT_DIR,
#             "--output_file", output_filename
#         ], check=True)

#         return {"message": "Voice cloning complete!", "output_file": output_filename}
#     except subprocess.CalledProcessError as e:
#         raise HTTPException(status_code=500, detail=f"CLI Error: {str(e)}")

@app.post("/podcast/")
async def create_podcast(
    script: UploadFile = File(...),
    main: Optional[UploadFile] = File(None),
    town: Optional[UploadFile] = File(None),
    country: Optional[UploadFile] = File(None)
):
    """
    Create a podcast using multiple voice files and a script.
    """
    # Save the script
    script_path = os.path.join(PODCAST_DIR, "story.txt")
    try:
        with open(script_path, "wb") as buffer:
            shutil.copyfileobj(script.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save script: {str(e)}")

    # Save optional voice files if provided
    for voice_file, voice_name in [
        (main, "main.flac"),
        (town, "town.flac"),
        (country, "country.flac")
    ]:
        if voice_file:
            voice_path = os.path.join(PODCAST_DIR, voice_name)
            try:
                with open(voice_path, "wb") as buffer:
                    shutil.copyfileobj(voice_file.file, buffer)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to save {voice_name}: {str(e)}")

    # Generate output filename
    output_filename = f"podcast_{uuid.uuid4().hex}.wav"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    try:
        subprocess.run([
            "f5-tts_infer-cli",
            "-c", STORY_TOML_PATH,
            "--output_dir", OUTPUT_DIR,
            "--output_file", output_filename
        ], check=True)

        return {"message": "Podcast creation complete!", "output_file": output_filename}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"CLI Error: {str(e)}")

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """
    Retrieve a generated audio file.
    """
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/wav")