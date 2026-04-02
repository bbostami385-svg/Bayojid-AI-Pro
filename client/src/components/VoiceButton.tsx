import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Pause, Play, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';
import VoiceRecorder from '@/services/voiceRecorder';

/**
 * ভয়েস বোতাম কম্পোনেন্ট
 */

interface VoiceButtonProps {
  onVoiceMessage?: (audioBlob: Blob) => void;
  onTranscription?: (text: string) => void;
  disabled?: boolean;
}

export function VoiceButton({
  onVoiceMessage,
  onTranscription,
  disabled = false
}: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recorder, setRecorder] = useState<VoiceRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // ইনিশিয়ালাইজ রেকর্ডার
  useEffect(() => {
    const supported = VoiceRecorder.isSupported();
    setIsSupported(supported);

    if (supported) {
      const voiceRecorder = new VoiceRecorder();
      
      voiceRecorder.on('durationUpdate', (secs: number) => {
        setDuration(secs);
      });

      voiceRecorder.on('recordingComplete', (blob: Blob) => {
        const url = voiceRecorder.getAudioUrl();
        setAudioUrl(url);
      });

      voiceRecorder.on('error', (error: string) => {
        toast.error(`ভয়েস ত্রুটি: ${error}`);
        setIsRecording(false);
        setIsPaused(false);
      });

      setRecorder(voiceRecorder);
    }

    return () => {
      if (recorder) {
        recorder.cancel();
      }
    };
  }, []);

  /**
   * রেকর্ডিং শুরু করুন
   */
  const handleStartRecording = async () => {
    if (!recorder) return;

    try {
      await recorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setAudioUrl(null);
      toast.success('রেকর্ডিং শুরু হয়েছে');
    } catch (error) {
      toast.error('মাইক্রোফোন অ্যাক্সেস ব্যর্থ');
    }
  };

  /**
   * রেকর্ডিং পজ করুন
   */
  const handlePauseRecording = () => {
    if (!recorder) return;
    recorder.pause();
    setIsPaused(true);
    toast.info('রেকর্ডিং পজ করা হয়েছে');
  };

  /**
   * রেকর্ডিং পুনরায় শুরু করুন
   */
  const handleResumeRecording = () => {
    if (!recorder) return;
    recorder.resume();
    setIsPaused(false);
    toast.info('রেকর্ডিং পুনরায় শুরু হয়েছে');
  };

  /**
   * রেকর্ডিং বন্ধ করুন
   */
  const handleStopRecording = async () => {
    if (!recorder) return;

    try {
      const audioBlob = await recorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setAudioUrl(recorder.getAudioUrl());
      
      if (onVoiceMessage) {
        onVoiceMessage(audioBlob);
      }
      
      toast.success('রেকর্ডিং সম্পূর্ণ হয়েছে');
    } catch (error) {
      toast.error('রেকর্ডিং বন্ধ করতে ব্যর্থ');
    }
  };

  /**
   * রেকর্ডিং বাতিল করুন
   */
  const handleCancelRecording = () => {
    if (!recorder) return;
    recorder.cancel();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioUrl(null);
    toast.info('রেকর্ডিং বাতিল করা হয়েছে');
  };

  /**
   * সময় ফরম্যাট করুন
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="আপনার ব্রাউজার ভয়েস রেকর্ডিং সমর্থন করে না"
      >
        <Mic className="w-4 h-4" />
      </Button>
    );
  }

  // রেকর্ডিং চলছে
  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-600">
            {formatTime(duration)}
          </span>
        </div>

        {isPaused ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleResumeRecording}
            title="রেকর্ডিং পুনরায় শুরু করুন"
          >
            <Play className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handlePauseRecording}
            title="রেকর্ডিং পজ করুন"
          >
            <Pause className="w-4 h-4" />
          </Button>
        )}

        <Button
          size="sm"
          variant="default"
          onClick={handleStopRecording}
          className="bg-green-600 hover:bg-green-700"
          title="রেকর্ডিং বন্ধ করুন"
        >
          <Send className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCancelRecording}
          className="text-red-600 hover:text-red-700"
          title="রেকর্ডিং বাতিল করুন"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // অডিও প্লেব্যাক
  if (audioUrl) {
    return (
      <div className="flex items-center gap-2">
        <audio
          src={audioUrl}
          controls
          className="h-8 max-w-xs"
        />
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            if (onVoiceMessage && recorder) {
              const state = recorder.getState();
              if (state.audioBlob) {
                onVoiceMessage(state.audioBlob);
              }
            }
          }}
          className="bg-blue-600 hover:bg-blue-700"
          title="এই ভয়েস বার্তা পাঠান"
        >
          <Send className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setAudioUrl(null);
            setDuration(0);
          }}
          title="নতুন রেকর্ডিং"
        >
          <Mic className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // ডিফল্ট বোতাম
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleStartRecording}
      disabled={disabled}
      title="ভয়েস রেকর্ডিং শুরু করুন"
      className="gap-2"
    >
      <Mic className="w-4 h-4" />
      ভয়েস
    </Button>
  );
}

export default VoiceButton;
