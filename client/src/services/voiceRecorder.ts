/**
 * ভয়েস রেকর্ডার সার্ভিস
 * মাইক্রোফোন থেকে অডিও রেকর্ড করুন এবং ট্রান্সক্রাইব করুন
 */

export interface RecordingOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
}

export interface VoiceRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}

/**
 * ভয়েস রেকর্ডার ক্লাস
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private pauseTime: number = 0;
  private totalPausedTime: number = 0;
  private timerInterval: NodeJS.Timeout | null = null;
  private stream: MediaStream | null = null;

  private state: VoiceRecorderState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    error: null
  };

  private listeners: Map<string, Function[]> = new Map();

  constructor(private options: RecordingOptions = {}) {
    this.options.mimeType = this.options.mimeType || 'audio/webm';
    this.options.audioBitsPerSecond = this.options.audioBitsPerSecond || 128000;
  }

  /**
   * রেকর্ডিং শুরু করুন
   */
  async start(): Promise<void> {
    try {
      // ইতিমধ্যে রেকর্ড করছে?
      if (this.state.isRecording) {
        throw new Error('ইতিমধ্যে রেকর্ডিং চলছে');
      }

      // মাইক্রোফোন অনুমতি চাইন
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // মিডিয়া রেকর্ডার তৈরি করুন
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.options.mimeType,
        audioBitsPerSecond: this.options.audioBitsPerSecond
      });

      this.audioChunks = [];
      this.startTime = Date.now();
      this.totalPausedTime = 0;

      // ডেটা সংগ্রহ করুন
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // রেকর্ডিং শেষ
      this.mediaRecorder.onstop = () => {
        this.state.audioBlob = new Blob(this.audioChunks, { type: this.options.mimeType });
        this.emit('recordingComplete', this.state.audioBlob);
      };

      this.mediaRecorder.start();
      this.state.isRecording = true;
      this.state.isPaused = false;
      this.state.error = null;

      // টাইমার শুরু করুন
      this.startTimer();
      this.emit('recordingStarted');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'মাইক্রোফোন অ্যাক্সেস ব্যর্থ';
      this.state.error = errorMessage;
      this.emit('error', errorMessage);
      throw error;
    }
  }

  /**
   * রেকর্ডিং পজ করুন
   */
  pause(): void {
    if (!this.state.isRecording || this.state.isPaused) {
      return;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.pauseTime = Date.now();
      this.state.isPaused = true;
      this.emit('recordingPaused');
    }
  }

  /**
   * রেকর্ডিং পুনরায় শুরু করুন
   */
  resume(): void {
    if (!this.state.isRecording || !this.state.isPaused) {
      return;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.totalPausedTime += Date.now() - this.pauseTime;
      this.state.isPaused = false;
      this.emit('recordingResumed');
    }
  }

  /**
   * রেকর্ডিং বন্ধ করুন
   */
  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.state.isRecording || !this.mediaRecorder) {
        reject(new Error('কোনো সক্রিয় রেকর্ডিং নেই'));
        return;
      }

      // টাইমার বন্ধ করুন
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }

      // রেকর্ডিং বন্ধ করুন
      this.mediaRecorder.onstop = () => {
        this.state.audioBlob = new Blob(this.audioChunks, { type: this.options.mimeType });
        this.state.isRecording = false;
        this.state.isPaused = false;
        this.emit('recordingStopped', this.state.audioBlob);
        
        // স্ট্রিম বন্ধ করুন
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }

        resolve(this.state.audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * রেকর্ডিং বাতিল করুন
   */
  cancel(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    this.state = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      error: null
    };

    this.audioChunks = [];
    this.emit('recordingCancelled');
  }

  /**
   * টাইমার শুরু করুন
   */
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime - this.totalPausedTime;
      this.state.duration = Math.floor(elapsed / 1000);
      this.emit('durationUpdate', this.state.duration);
    }, 100);
  }

  /**
   * অডিও ডেটা URL পান
   */
  getAudioUrl(): string | null {
    if (!this.state.audioBlob) {
      return null;
    }
    return URL.createObjectURL(this.state.audioBlob);
  }

  /**
   * অডিও ফাইল ডাউনলোড করুন
   */
  downloadAudio(fileName: string = 'recording.webm'): void {
    if (!this.state.audioBlob) {
      return;
    }

    const url = URL.createObjectURL(this.state.audioBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * স্টেট পান
   */
  getState(): VoiceRecorderState {
    return { ...this.state };
  }

  /**
   * ইভেন্ট লিসেনার যোগ করুন
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * ইভেন্ট লিসেনার সরান
   */
  off(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      return;
    }
    const callbacks = this.listeners.get(event)!;
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * ইভেন্ট ট্রিগার করুন
   */
  private emit(event: string, data?: any): void {
    if (!this.listeners.has(event)) {
      return;
    }
    this.listeners.get(event)!.forEach(callback => callback(data));
  }

  /**
   * ব্রাউজার সাপোর্ট চেক করুন
   */
  static isSupported(): boolean {
    if (typeof navigator === 'undefined') return false;
    if (!navigator.mediaDevices) return false;
    if (!navigator.mediaDevices.getUserMedia) return false;
    if (typeof MediaRecorder === 'undefined') return false;
    return true;
  }
}

export default VoiceRecorder;
