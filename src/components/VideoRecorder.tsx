import React, { useState, useRef, useEffect } from 'react';
import { Video, Square, Download, X } from 'lucide-react';

interface VideoRecorderProps {
  targetElement: HTMLCanvasElement | null;
  isRecording?: boolean;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onClose: () => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ 
  targetElement, 
  isRecording: externalIsRecording = false,
  onRecordingStart,
  onRecordingStop,
  onClose 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!targetElement) return;

    try {
      // Capturer le canvas au format TikTok vertical (1080x1920)
      const stream = targetElement.captureStream(60);
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000 // 8 Mbps pour une qualité HD
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      onRecordingStart?.();
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStop?.();
    }
  };

  const downloadVideo = () => {
    if (recordedVideo) {
      const a = document.createElement('a');
      a.href = recordedVideo;
      a.download = `tiktok-battle-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    return () => {
      if (recordedVideo) {
        URL.revokeObjectURL(recordedVideo);
      }
    };
  }, [recordedVideo]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 ${externalIsRecording ? 'pointer-events-none' : ''}`}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-black">Enregistrement TikTok</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {!recordedVideo && !externalIsRecording ? (
            <div className="text-center">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Video size={20} />
                  <span>Commencer l'enregistrement</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-red-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-black font-semibold">Enregistrement en cours...</span>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Square size={20} />
                    <span>Arrêter</span>
                  </button>
                </div>
              )}
            </div>
          ) : externalIsRecording ? (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-red-500 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-black font-semibold">Enregistrement en cours...</span>
              </div>
              <button
                onClick={stopRecording}
                className="flex items-center justify-center space-x-2 w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Square size={20} />
                <span>Arrêter l'enregistrement</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <video
                src={recordedVideo}
                controls
                className="w-full rounded-lg"
                style={{ maxHeight: '200px' }}
              />
              <div className="flex space-x-2">
                <button
                  onClick={downloadVideo}
                  className="flex items-center justify-center space-x-2 flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download size={16} />
                  <span>Télécharger</span>
                </button>
                <button
                  onClick={() => setRecordedVideo(null)}
                  className="flex items-center justify-center space-x-2 flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Video size={16} />
                  <span>Nouveau</span>
                </button>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 text-center">
            <p>Format vertical TikTok (1080x1920)</p>
            <p>Durée recommandée: 15-60 secondes</p>
            <p>Qualité HD - 60 FPS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;