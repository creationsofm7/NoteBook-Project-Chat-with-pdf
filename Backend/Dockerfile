# Use official Python base image (Linux)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 8000 for FastAPI (if used)
EXPOSE 8000

# Use Uvicorn to run FastAPI app for production
CMD ["uvicorn", "fastapi_app:app", "--host", "0.0.0.0", "--port", "8000"]

# Load environment variables from .env file at container startup
ENV PYTHONUNBUFFERED=1
ENV DOTENV_CONFIG_PATH=.env