/**
 * Voice Recorder — Mockup Komponen Mikrofon
 * Menggunakan Web Speech API (jika tersedia)
 * Fallback: MediaRecorder API untuk merekam audio
 */
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import { Button, Card, Badge } from '../../components/ui';
import './voice.css';

export default function VoiceRecorder() {
  const {
    isListening, transcript, isSupported, error,
    startListening, stopListening, resetTranscript
  } = useSpeechRecognition({ lang: 'ar-SA' });

  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  /** Start audio recording via MediaRecorder */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordings(prev => [
          ...prev,
          { id: Date.now(), url, timestamp: new Date().toLocaleTimeString('id-ID') }
        ]);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Also start speech recognition if supported
      if (isSupported) {
        startListening();
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (isListening) stopListening();
  };

  return (
    <div className="voice-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="voice-header"
      >
        <h1>🎤 Rekam Bacaan</h1>
        <p>Rekam bacaan Anda untuk dievaluasi oleh Guru</p>
      </motion.div>

      {/* Mic Button */}
      <div className="voice-mic-section">
        <motion.button
          className={`voice-mic-btn ${isRecording ? 'voice-mic-active' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          whileTap={{ scale: 0.9 }}
          animate={isRecording ? {
            boxShadow: [
              '0 0 0px rgba(232, 69, 60, 0.3)',
              '0 0 30px rgba(232, 69, 60, 0.6)',
              '0 0 0px rgba(232, 69, 60, 0.3)',
            ],
          } : {}}
          transition={isRecording ? {
            duration: 1.5,
            repeat: Infinity,
          } : {}}
        >
          <span className="voice-mic-icon">{isRecording ? '⏹️' : '🎤'}</span>
        </motion.button>
        <p className="voice-mic-label">
          {isRecording ? 'Sedang merekam... Tekan untuk berhenti' : 'Tekan untuk mulai merekam'}
        </p>

        {/* Speech Recognition Status */}
        {isSupported && (
          <Badge variant={isListening ? 'green' : 'default'} size="sm">
            {isListening ? '🔊 Mendengarkan...' : 'Speech Recognition Ready'}
          </Badge>
        )}
        {!isSupported && (
          <Badge variant="default" size="sm">
            ℹ️ Speech Recognition tidak didukung browser ini
          </Badge>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <Card variant="glow" padding="md" className="voice-transcript">
          <div className="voice-transcript-header">
            <h3>📝 Hasil Transkripsi</h3>
            <Button variant="ghost" size="sm" onClick={resetTranscript}>Hapus</Button>
          </div>
          <p className="arabic-large">{transcript}</p>
        </Card>
      )}

      {error && (
        <div className="voice-error">{error}</div>
      )}

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="voice-recordings">
          <h3>📼 Rekaman Tersimpan</h3>
          <div className="voice-recordings-list">
            {recordings.map(rec => (
              <Card key={rec.id} variant="default" padding="sm" className="voice-recording-item">
                <div className="voice-recording-info">
                  <span>🎵 Rekaman {rec.timestamp}</span>
                </div>
                <audio controls src={rec.url} className="voice-audio-player" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <Card variant="default" padding="md" className="voice-instructions">
        <h3>💡 Petunjuk</h3>
        <ul>
          <li>🎤 Tekan tombol mikrofon untuk mulai merekam</li>
          <li>📖 Bacakan huruf atau ayat yang sedang dipelajari</li>
          <li>⏹️ Tekan lagi untuk menghentikan rekaman</li>
          <li>📤 Rekaman akan otomatis tersimpan dan bisa dikirim ke Guru</li>
          <li>🔊 Di browser Chrome/Edge, transkripsi otomatis akan muncul</li>
        </ul>
      </Card>
    </div>
  );
}
