import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .websocket_handler import connection_manager
from .attention_tracker import attention_tracker
from . import config

app = FastAPI(
    title="Interview Monitoring Service",
    description="Real-time face detection and attention monitoring for AI Interview Bot",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Interview Monitoring Service",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "active_sessions": len(connection_manager.active_connections),
        "config": {
            "no_face_threshold": config.NO_FACE_ALERT_THRESHOLD,
            "looking_away_threshold": config.LOOKING_AWAY_THRESHOLD
        }
    }

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for video frame processing"""
    await connection_manager.connect(websocket, session_id)
    
    try:
        while True:
            # Receive frame data
            data = await websocket.receive_text()
            
            try:
                parsed_data = json.loads(data)
                await connection_manager.process_frame(websocket, session_id, parsed_data)
            except json.JSONDecodeError:
                print(f"Invalid JSON received: {data[:100]}...")
            except Exception as e:
                print(f"Error processing frame: {e}")
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, session_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        connection_manager.disconnect(websocket, session_id)

@app.get("/session/{session_id}/stats")
async def get_session_stats(session_id: str):
    """Get monitoring statistics for a session"""
    stats = attention_tracker.get_session_stats(session_id)
    return {
        "sessionId": session_id,
        "stats": stats
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=config.HOST, port=config.PORT)
