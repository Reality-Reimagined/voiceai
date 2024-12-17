FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    git \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install PyTorch with CPU support first
RUN pip install torch==2.1.0+cpu torchaudio==2.1.0+cpu -f https://download.pytorch.org/whl/torch_stable.html

# Install F5-TTS properly
RUN git clone https://github.com/SWivid/F5-TTS.git
WORKDIR /app/F5-TTS
# Install in editable mode with all dependencies
RUN pip install -e .
# Initialize submodules if needed
RUN git submodule update --init --recursive

# Add BigVGAN fix if needed
RUN echo 'import os\nimport sys\nsys.path.append(os.path.dirname(os.path.abspath(__file__)))' | cat - src/third_party/BigVGAN/bigvgan.py > temp && mv temp src/third_party/BigVGAN/bigvgan.py

# Copy application code
WORKDIR /app
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# # Use official Python image
# FROM python:3.10-slim

# # Set working directory to /app/backend
# WORKDIR /app/backend

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     ffmpeg \
#     libsndfile1-dev \
#     git \
#     curl \
#     && rm -rf /var/lib/apt/lists/*

# # Create a virtual environment
# RUN python -m venv venv

# # Activate venv and upgrade pip
# RUN . venv/bin/activate && pip install --upgrade pip

# # Copy only requirements.txt first for caching
# COPY requirements.txt .

# # Install Python dependencies in venv
# RUN . venv/bin/activate && pip install -r requirements.txt

# # Copy the entire app
# COPY . .

# # Install F5-TTS from source
# RUN git clone https://github.com/SWivid/F5-TTS.git && \
#     cd F5-TTS && . ../venv/bin/activate && pip install -e .

# # Add venv to PATH
# ENV PATH="/app/backend/venv/bin:$PATH"

# # Expose the port
# EXPOSE 8000

# # Run the app
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]




# # Use a lightweight Python image
# FROM python:3.10-slim

# # Set working directory
# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     build-essential curl git && \
#     apt-get clean && rm -rf /var/lib/apt/lists/*

# # Copy and install Python dependencies
# COPY requirements.txt .
# RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# # Clone and install F5-TTS
# RUN git clone https://github.com/SWivid/F5-TTS.git
# WORKDIR /app/F5-TTS
# RUN pip install -e .

# # Copy the application code
# WORKDIR /app
# COPY . .

# # Expose the port Railway expects
# EXPOSE 8000

# # Run the application
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]



# FROM python:3.10-slim

# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     curl \
#     software-properties-common \
#     git \
#     && rm -rf /var/lib/apt/lists/*

# # Install Python dependencies
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy F5-TTS
# RUN git clone https://github.com/SWivid/F5-TTS.git
# WORKDIR /app/F5-TTS
# RUN pip install -e .

# # Copy application code
# WORKDIR /app
# COPY . .

# # Expose port
# EXPOSE 8000

# # Start the application
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
