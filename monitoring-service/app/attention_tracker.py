import time
from typing import Dict, Optional
from . import config

class AttentionTracker:
    def __init__(self):
        self.sessions: Dict[str, dict] = {}
    
    def get_session(self, session_id: str) -> dict:
        """Get or create session tracking data"""
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "looking_away_start": None,
                "total_looking_away_time": 0,
                "alert_count": 0,
                "last_alert_time": 0
            }
        return self.sessions[session_id]
    
    def track_attention(self, session_id: str, is_looking_away: bool) -> Optional[Dict]:
        """Track attention and return alert if needed"""
        session = self.get_session(session_id)
        current_time = time.time()
        
        if is_looking_away:
            if session["looking_away_start"] is None:
                session["looking_away_start"] = current_time
            else:
                looking_away_duration = current_time - session["looking_away_start"]
                
                # Alert if looking away for too long
                if looking_away_duration >= config.LOOKING_AWAY_THRESHOLD:
                    # Don't spam alerts - wait at least 10 seconds between alerts
                    if current_time - session["last_alert_time"] >= 10:
                        session["last_alert_time"] = current_time
                        session["alert_count"] += 1
                        session["looking_away_start"] = current_time  # Reset timer
                        
                        return {
                            "alertType": "looking_away",
                            "severity": "warning",
                            "message": f"You appear to be looking away from the screen. Please focus on the interview.",
                            "sessionId": session_id,
                            "timestamp": current_time,
                            "duration": looking_away_duration
                        }
        else:
            # Reset looking away timer
            if session["looking_away_start"] is not None:
                session["total_looking_away_time"] += current_time - session["looking_away_start"]
            session["looking_away_start"] = None
        
        return None
    
    def get_session_stats(self, session_id: str) -> dict:
        """Get attention statistics for a session"""
        session = self.get_session(session_id)
        return {
            "total_looking_away_time": session["total_looking_away_time"],
            "alert_count": session["alert_count"]
        }
    
    def clear_session(self, session_id: str):
        """Clear session data"""
        if session_id in self.sessions:
            del self.sessions[session_id]


# Singleton instance
attention_tracker = AttentionTracker()
