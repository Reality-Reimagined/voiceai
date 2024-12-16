# Use a lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Clone and install F5-TTS
RUN git clone https://github.com/SWivid/F5-TTS.git
WORKDIR /app/F5-TTS
RUN pip install -e .

# Copy the application code
WORKDIR /app
COPY . .

# Expose the port Railway expects
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]



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
