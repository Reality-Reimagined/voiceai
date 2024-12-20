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

# Create and activate virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install wheel
RUN pip install --no-cache-dir --upgrade pip wheel setuptools

# Install PyTorch CPU version
RUN pip install --no-cache-dir torch==2.1.0+cpu torchaudio==2.1.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu

# Copy and install requirements first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install F5-TTS directly from GitHub
RUN pip install git+https://github.com/SWivid/F5-TTS.git

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p voice_configs
RUN mkdir -p tts_output

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV PYTHONPATH="/app:/app/F5-TTS:${PYTHONPATH}"

# Expose port
EXPOSE 8000

# Start the application with multiple workers
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# FROM python:3.10-slim

# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     curl \
#     software-properties-common \
#     git \
#     ffmpeg \
#     && rm -rf /var/lib/apt/lists/*

# # Create and activate virtual environment
# RUN python -m venv /opt/venv
# ENV PATH="/opt/venv/bin:$PATH"

# # Upgrade pip and install wheel
# RUN pip install --no-cache-dir --upgrade pip wheel setuptools

# # Install PyTorch CPU version
# RUN pip install --no-cache-dir torch==2.1.0+cpu torchaudio==2.1.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu

# # Copy and install requirements first
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Clone and install F5-TTS with specific steps
# RUN git clone --depth 1 https://github.com/SWivid/F5-TTS.git && \
#     cd F5-TTS && \
#     # Install in development mode to ensure proper module structure
#     pip install -e . && \
#     # Verify installation
#     python -c "from f5_tts.infer.cli import TTSInference" && \
#     cd ..

# # Copy application code
# COPY . .

# # Create necessary directories
# RUN mkdir -p voice_configs
# RUN mkdir -p tts_output

# # Set environment variables
# ENV PYTHONUNBUFFERED=1
# ENV PORT=8000
# # Add F5-TTS to Python path
# ENV PYTHONPATH="${PYTHONPATH}:/app/F5-TTS"

# # Expose port
# EXPOSE 8000

# # Start the application with multiple workers
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# FROM python:3.10-slim

# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     curl \
#     software-properties-common \
#     git \
#     ffmpeg \
#     && rm -rf /var/lib/apt/lists/*

# # Create and activate virtual environment
# RUN python -m venv /opt/venv
# ENV PATH="/opt/venv/bin:$PATH"

# # Upgrade pip and install wheel
# RUN pip install --no-cache-dir --upgrade pip wheel setuptools

# # Install PyTorch CPU version
# RUN pip install --no-cache-dir torch==2.1.0+cpu torchaudio==2.1.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu

# # Copy and install requirements first
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Clone and install F5-TTS
# RUN git clone --depth 1 https://github.com/SWivid/F5-TTS.git
# WORKDIR /app/F5-TTS
# RUN pip install -e .

# # Copy application code
# WORKDIR /app
# COPY . .

# # Create necessary directories
# RUN mkdir -p voice_configs
# RUN mkdir -p tts_output

# # Set environment variables
# ENV PYTHONUNBUFFERED=1
# ENV PORT=8000

# # Expose port
# EXPOSE 8000

# # Start the application with multiple workers
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# # Use a slim Python image
# FROM python:3.10-slim

# # Create a non-root user
# RUN useradd -m appuser

# # Set the working directory
# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     curl \
#     git \
#     ffmpeg \
#     && rm -rf /var/lib/apt/lists/*

# # Upgrade pip
# RUN pip install --no-cache-dir --upgrade pip

# # Switch to the non-root user
# USER appuser

# # Copy requirements file
# COPY requirements.txt .

# # Install Python dependencies
# RUN pip install --no-cache-dir -r requirements.txt

# # Clone the F5-TTS repository as the root user
# USER root
# RUN git clone https://github.com/SWivid/F5-TTS.git /app/F5-TTS

# # Switch back to the non-root user
# USER appuser

# # Set the working directory to the F5-TTS directory
# WORKDIR /app/F5-TTS

# # Initialize submodules
# RUN git submodule update --init --recursive

# # Install F5-TTS in editable mode
# RUN pip install -e .

# # Copy the rest of the application code
# WORKDIR /app
# COPY . .

# # Create necessary directories
# RUN mkdir -p /app/voice_configs

# # Add local bin to PATH
# ENV PATH="/home/appuser/.local/bin:${PATH}"

# # Set Python path to include F5-TTS
# ENV PYTHONPATH="${PYTHONPATH}:/app/F5-TTS"

# # Expose the port
# EXPOSE 8000

# # Start the application
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# FROM python:3.10-slim

# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     curl \
#     software-properties-common \
#     git \
#     ffmpeg \
#     && rm -rf /var/lib/apt/lists/*

# # Upgrade pip
# RUN pip install --no-cache-dir --upgrade pip

# # Install Python dependencies
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Install PyTorch with CPU support first
# RUN pip install torch==2.1.0+cpu torchaudio==2.1.0+cpu -f https://download.pytorch.org/whl/torch_stable.html

# # Install F5-TTS properly
# RUN git clone https://github.com/SWivid/F5-TTS.git /app/F5-TTS
# WORKDIR /app/F5-TTS
# # Initialize submodules first
# RUN git submodule update --init --recursive
# # Install in editable mode with all dependencies
# RUN pip install -e .

# # Add BigVGAN fix
# RUN if [ -f "src/third_party/BigVGAN/bigvgan.py" ]; then \
#     echo 'import os\nimport sys\nsys.path.append(os.path.dirname(os.path.abspath(__file__)))' | \
#     cat - src/third_party/BigVGAN/bigvgan.py > temp && mv temp src/third_party/BigVGAN/bigvgan.py; \
#     fi

# # Copy application code
# WORKDIR /app
# COPY . .

# # Create necessary directories
# RUN mkdir -p /app/voice_configs

# # Set Python path to include F5-TTS
# ENV PYTHONPATH="${PYTHONPATH}:/app/F5-TTS"

# # Expose port
# EXPOSE 8000

# # Start the application
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
