# Use the f5-tts base image
FROM ghcr.io/swivid/f5-tts:main

# Set the working directory
WORKDIR /workspace

# Install FastAPI, Uvicorn, and additional dependencies
RUN apt-get update && apt-get install -y python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*
RUN pip3 install --no-cache-dir fastapi uvicorn pydantic python-multipart

# Copy the FastAPI app into the container
COPY app.py /workspace/app.py

# Ensure all required directories exist
RUN mkdir -p /workspace/F5-TTS/output \
    /workspace/F5-TTS/src/f5_tts/infer/examples/basic \
    /workspace/F5-TTS/src/f5_tts/infer/examples/multi

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start FastAPI server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
