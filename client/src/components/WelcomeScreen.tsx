import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

interface WelcomeScreenProps {
  userName?: string;
  onComplete?: () => void;
}

export default function WelcomeScreen({ userName = 'User', onComplete }: WelcomeScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setShowConfetti(false);
      onComplete?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
          gravity={0.3}
          colors={['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#818cf8']}
        />
      )}

      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Welcome Content */}
      <div className="relative z-10 text-center px-4 animate-in fade-in zoom-in duration-700">
        {/* Welcome Icon/Avatar Circle */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Animated Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 border-r-blue-400 animate-spin" style={{ animationDuration: '3s' }} />

            {/* Avatar Circle */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shadow-2xl">
              <div className="text-5xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Welcome to
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            {userName}! 👋
          </h2>

          {/* Subtitle */}
          <p className="text-xl text-slate-300 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            আপনার যাত্রা শুরু হোক Bayojid AI Pro এর সাথে
          </p>

          {/* Tagline */}
          <p className="text-lg text-purple-300 font-semibold animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            ✨ প্রস্তুত হন অসাধারণ কিছু তৈরি করতে
          </p>
        </div>

        {/* Animated Dots */}
        <div className="mt-12 flex justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
          <div className="w-3 h-3 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>

        {/* Closing Message */}
        <p className="text-sm text-slate-400 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          এই স্ক্রিন স্বয়ংক্রিয়ভাবে বন্ধ হবে...
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          setIsVisible(false);
          setShowConfetti(false);
          onComplete?.();
        }}
        className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
