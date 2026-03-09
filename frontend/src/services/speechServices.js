// Speech Recognition Service using Web Speech API

class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResult = null;
    this.onEnd = null;
    this.onError = null;
    this.finalTranscript = '';
    this.interimTranscript = '';
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      this.interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.finalTranscript += transcript + ' ';
        } else {
          this.interimTranscript += transcript;
        }
      }

      if (this.onResult) {
        this.onResult({
          final: this.finalTranscript.trim(),
          interim: this.interimTranscript,
          combined: (this.finalTranscript + this.interimTranscript).trim(),
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) {
        this.onEnd(this.finalTranscript.trim());
      }
    };

    return true;
  }

  start() {
    if (!this.recognition) {
      if (!this.init()) {
        return false;
      }
    }

    this.finalTranscript = '';
    this.interimTranscript = '';
    
    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
    return this.finalTranscript.trim();
  }

  reset() {
    this.finalTranscript = '';
    this.interimTranscript = '';
  }

  setCallbacks({ onResult, onEnd, onError }) {
    if (onResult) this.onResult = onResult;
    if (onEnd) this.onEnd = onEnd;
    if (onError) this.onError = onError;
  }

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

export const speechRecognition = new SpeechRecognitionService();

// Text-to-Speech Service
export const textToSpeech = {
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.lang || 'en-US';

      // Try to use a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('English')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      window.speechSynthesis.speak(utterance);
    });
  },

  stop() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },

  isSupported() {
    return !!window.speechSynthesis;
  },
};
