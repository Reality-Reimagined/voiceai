FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    git \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install PyTorch with CPU support first
RUN pip install torch==2.1.0+cpu torchaudio==2.1.0+cpu -f https://download.pytorch.org/whl/torch_stable.html

# Install F5-TTS properly
RUN git clone https://github.com/SWivid/F5-TTS.git /app/F5-TTS
WORKDIR /app/F5-TTS
# Initialize submodules first
RUN git submodule update --init --recursive
# Install in editable mode with all dependencies
RUN pip install -e .

# Add BigVGAN fix
RUN if [ -f "src/third_party/BigVGAN/bigvgan.py" ]; then \
    echo 'import os\nimport sys\nsys.path.append(os.path.dirname(os.path.abspath(__file__)))' | \
    cat - src/third_party/BigVGAN/bigvgan.py > temp && mv temp src/third_party/BigVGAN/bigvgan.py; \
    fi

# Copy application code
WORKDIR /app
COPY . .

# Create necessary directories
RUN mkdir -p /app/voice_configs

# Set Python path to include F5-TTS
ENV PYTHONPATH="${PYTHONPATH}:/app/F5-TTS"

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
