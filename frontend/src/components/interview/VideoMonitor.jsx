import { useEffect, useRef, useState, useCallback } from 'react';
import { monitoringAPI } from '../../services/api';
import { Camera, CameraOff, AlertTriangle, Loader } from 'lucide-react';

export default function VideoMonitor({ sessionId, onAlert, previewMode = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const wsRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          facingMode: 'user' 
        },
        audio: false,
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(resolve).catch(resolve);
          };
        });
      }
      
      setHasCamera(true);
      setError(null);
      console.log('Camera started successfully');
    } catch (err) {
      console.error('Camera access error:', err);
      let errorMessage = 'Unable to access camera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is in use by another application.';
      }
      
      setError(errorMessage);
      setHasCamera(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setHasCamera(false);
  }, []);

  // Connect to Python monitoring WebSocket
  const connectToMonitoring = useCallback(() => {
    if (!sessionId || previewMode) return;

    const wsUrl = import.meta.env.VITE_PYTHON_WS_URL || 'ws://localhost:8000';
    
    try {
      wsRef.current = new WebSocket(`${wsUrl}/ws/${sessionId}`);
      
      wsRef.current.onopen = () => {
        console.log('Connected to monitoring service');
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const alert = JSON.parse(event.data);
          if (onAlert) {
            onAlert(alert);
          }
          // Only log to backend if severity is critical or warning
          if (alert.severity === 'critical' || alert.severity === 'warning') {
            monitoringAPI.createAlert({
              sessionId,
              alertType: alert.alertType,
              severity: alert.severity,
              description: alert.message,
            }).catch(console.error);
          }
        } catch (e) {
          console.error('Failed to parse monitoring message:', e);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Disconnected from monitoring service');
        setIsConnected(false);
      };

      wsRef.current.onerror = (err) => {
        console.error('Monitoring WebSocket error:', err);
        setIsConnected(false);
      };
    } catch (err) {
      console.error('Failed to connect to monitoring:', err);
    }
  }, [sessionId, previewMode, onAlert]);

  // Send frames to monitoring service
  const sendFrame = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 320;
    canvas.height = 240;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frameData = canvas.toDataURL('image/jpeg', 0.5);
    wsRef.current.send(JSON.stringify({ frame: frameData }));
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (hasCamera && sessionId && !previewMode) {
      connectToMonitoring();

      // Send frames every 500ms
      const frameInterval = setInterval(sendFrame, 500);

      return () => {
        clearInterval(frameInterval);
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }
  }, [hasCamera, sessionId, previewMode, connectToMonitoring, sendFrame]);

  return (
    <div className="video-monitor">
      <div className="video-container">
        {isLoading ? (
          <div className="no-camera">
            <Loader className="spin" size={48} />
            <p>Starting camera...</p>
          </div>
        ) : hasCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-feed"
          />
        ) : (
          <div className="no-camera">
            <CameraOff size={48} />
            <p>{error || 'Camera not available'}</p>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="video-status">
        <div className={`status-indicator ${hasCamera ? 'active' : 'inactive'}`}>
          {hasCamera ? <Camera size={16} /> : <CameraOff size={16} />}
          <span>{hasCamera ? 'Camera Active' : 'No Camera'}</span>
        </div>
        
        {!previewMode && sessionId && (
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <AlertTriangle size={16} />
            <span>{isConnected ? 'Monitoring Active' : 'Monitoring Offline'}</span>
          </div>
        )}
      </div>

      {error && !isLoading && (
        <button className="retry-btn" onClick={startCamera}>
          Retry Camera Access
        </button>
      )}
    </div>
  );
}
