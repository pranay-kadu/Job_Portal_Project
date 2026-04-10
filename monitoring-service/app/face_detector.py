import cv2
import numpy as np
import base64
import time
from typing import Optional, Tuple, List, Dict
from . import config

import os

class FaceDetector:
    def __init__(self):
        # Load Haar Cascade classifier
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.no_face_start_time: Optional[float] = None
        self.multiple_faces_count = 0
        self.mobile_detect_count = 0
        
        # Load YOLO model for cell phone detection
        model_weights = os.path.join(os.path.dirname(__file__), 'models', 'yolov3-tiny.weights')
        model_config = os.path.join(os.path.dirname(__file__), 'models', 'yolov3-tiny.cfg')
        self.yolo_net = None
        if os.path.exists(model_weights) and os.path.exists(model_config):
            self.yolo_net = cv2.dnn.readNetFromDarknet(model_config, model_weights)
            # Find the output layer names
            layer_names = self.yolo_net.getLayerNames()
            self.output_layers = [layer_names[i - 1] for i in self.yolo_net.getUnconnectedOutLayers()]
        
    def decode_frame(self, frame_data: str) -> Optional[np.ndarray]:
        """Decode base64 image to numpy array"""
        try:
            # Remove data URL prefix if present
            if ',' in frame_data:
                frame_data = frame_data.split(',')[1]
            
            # Decode base64 to bytes
            img_bytes = base64.b64decode(frame_data)
            
            # Convert to numpy array
            nparr = np.frombuffer(img_bytes, np.uint8)
            
            # Decode image
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            return frame
        except Exception as e:
            print(f"Error decoding frame: {e}")
            return None
    
    def detect_faces(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces in frame using Haar Cascade"""
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=config.FACE_DETECTION_SCALE_FACTOR,
            minNeighbors=config.FACE_DETECTION_MIN_NEIGHBORS,
            minSize=config.FACE_DETECTION_MIN_SIZE
        )
        
        return faces

    def detect_cell_phone(self, frame: np.ndarray) -> bool:
        """Detect cell phone using YOLOv3-tiny"""
        if self.yolo_net is None:
            return False
            
        height, width, channels = frame.shape
        # Prepare the image for YOLO
        blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
        self.yolo_net.setInput(blob)
        outs = self.yolo_net.forward(self.output_layers)
        
        # class_id 67 is cell phone in COCO dataset
        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                # Check for cell phone (67) with reasonable confidence
                if class_id == 67 and confidence > 0.3:
                    return True
                    
        return False
    
    def analyze_frame(self, frame_data: str, session_id: str) -> List[Dict]:
        """Analyze frame and return any alerts"""
        alerts = []
        
        # Decode frame
        frame = self.decode_frame(frame_data)
        if frame is None:
            return alerts
        
        # Detect faces
        faces = self.detect_faces(frame)
        face_count = len(faces)
        current_time = time.time()
        
        # Detect cell phone
        phone_detected = self.detect_cell_phone(frame)
        
        # Check for clean background (exactly 1 face and no phone)
        is_clean_background = face_count == 1 and not phone_detected
        
        if is_clean_background:
            self.no_face_start_time = None
            self.multiple_faces_count = 0
            self.mobile_detect_count = 0
            return alerts
        
        # If not clean, handle specific infractions
        
        # 1. Check for no face
        if face_count == 0:
            if self.no_face_start_time is None:
                self.no_face_start_time = current_time
            elif current_time - self.no_face_start_time >= config.NO_FACE_ALERT_THRESHOLD:
                alerts.append({
                    "alertType": "no_face",
                    "severity": "critical",
                    "message": "No face detected. Please ensure you are visible to the camera.",
                    "sessionId": session_id,
                    "timestamp": current_time
                })
                # Auto-reset after alert to avoid spam but still warn periodically
                self.no_face_start_time = current_time
        else:
            self.no_face_start_time = None
        
        # 2. Check for multiple faces
        if face_count > 1:
            self.multiple_faces_count += 1
            if self.multiple_faces_count >= config.MULTIPLE_FACES_ALERT_THRESHOLD:
                alerts.append({
                    "alertType": "multiple_faces",
                    "severity": "critical",
                    "message": f"Multiple faces ({face_count}) detected. Please ensure you are alone during the interview.",
                    "sessionId": session_id,
                    "timestamp": current_time
                })
        else:
            self.multiple_faces_count = 0
            
        # 3. Check for mobile phone
        if phone_detected:
            self.mobile_detect_count += 1
            if self.mobile_detect_count >= 2: # short threshold
                alerts.append({
                    "alertType": "mobile_detected",
                    "severity": "critical",
                    "message": "Mobile phone detected. Electronic devices are not allowed.",
                    "sessionId": session_id,
                    "timestamp": current_time
                })
        else:
            self.mobile_detect_count = 0
        
        return alerts
    
    def check_face_position(self, frame: np.ndarray, faces: List) -> Optional[str]:
        """Check if face is centered and looking at screen"""
        if len(faces) != 1:
            return None
        
        frame_height, frame_width = frame.shape[:2]
        x, y, w, h = faces[0]
        
        face_center_x = x + w // 2
        face_center_y = y + h // 2
        
        frame_center_x = frame_width // 2
        frame_center_y = frame_height // 2
        
        # Calculate deviation from center
        x_deviation = abs(face_center_x - frame_center_x) / frame_width
        y_deviation = abs(face_center_y - frame_center_y) / frame_height
        
        # If face is significantly off-center, might be looking away
        if x_deviation > 0.25 or y_deviation > 0.25:
            return "looking_away"
        
        return None


# Singleton instance
face_detector = FaceDetector()
