import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Face detection settings
FACE_DETECTION_SCALE_FACTOR = 1.1
FACE_DETECTION_MIN_NEIGHBORS = 5
FACE_DETECTION_MIN_SIZE = (30, 30)

# Alert thresholds
NO_FACE_ALERT_THRESHOLD = 3  # seconds
LOOKING_AWAY_THRESHOLD = 5  # seconds
MULTIPLE_FACES_ALERT_THRESHOLD = 2  # consecutive frames

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
