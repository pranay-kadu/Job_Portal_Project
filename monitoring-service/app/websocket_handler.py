import json
import asyncio
from typing import Dict, Set
from fastapi import WebSocket
from .face_detector import face_detector
from .attention_tracker import attention_tracker

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept and track WebSocket connection"""
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)
        print(f"Client connected to session {session_id}")
    
    def disconnect(self, websocket: WebSocket, session_id: str):
        """Remove WebSocket connection"""
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
                attention_tracker.clear_session(session_id)
        print(f"Client disconnected from session {session_id}")
    
    async def send_alert(self, session_id: str, alert: dict):
        """Send alert to all connections in a session"""
        if session_id in self.active_connections:
            message = json.dumps(alert)
            dead_connections = set()
            
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    print(f"Error sending alert: {e}")
                    dead_connections.add(connection)
            
            # Clean up dead connections
            for conn in dead_connections:
                self.active_connections[session_id].discard(conn)
    
    async def process_frame(self, websocket: WebSocket, session_id: str, data: dict):
        """Process incoming frame and send alerts if needed"""
        frame_data = data.get("frame")
        if not frame_data:
            return
        
        # Analyze frame for face detection alerts
        alerts = face_detector.analyze_frame(frame_data, session_id)
        
        # Decode frame for attention tracking
        frame = face_detector.decode_frame(frame_data)
        if frame is not None:
            faces = face_detector.detect_faces(frame)
            position_status = face_detector.check_face_position(frame, faces)
            
            # Track attention
            attention_alert = attention_tracker.track_attention(
                session_id, 
                position_status == "looking_away"
            )
            if attention_alert:
                alerts.append(attention_alert)
        
        # Send all alerts
        for alert in alerts:
            await self.send_alert(session_id, alert)


# Singleton instance
connection_manager = ConnectionManager()
