import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  highlightElement?: string;
  action?: string;
  tips?: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '🎉 স্বাগতম Bayojid AI Pro এ!',
    description: 'আমরা আপনাকে একটি দ্রুত ট্যুর দেখাতে চাই যাতে আপনি সবকিছু বুঝতে পারেন। প্রস্তুত?',
    tips: ['এই টিউটোরিয়াল যেকোনো সময় বন্ধ করতে পারেন', 'পরে আবার শুরু করতে Settings এ যান'],
  },
  {
    id: 'signup-intro',
    title: '📝 Sign Up করা খুবই সহজ',
    description: 'তিনটি উপায়ে Sign Up করতে পারেন: Email, Google, বা Microsoft।',
    tips: ['Email দিয়ে সবচেয়ে নিরাপদ', 'Google/Microsoft দিয়ে দ্রুততম'],
  },
  {
    id: 'signup-email',
    title: '✉️ Email দিয়ে Sign Up',
    description: 'First Name, Last Name, Email এবং Password দিয়ে নতুন অ্যাকাউন্ট তৈরি করুন।',
    tips: [
      'পাসওয়ার্ড কমপক্ষে 8 ক্যারেক্টার হতে হবে',
      'শক্তিশালী পাসওয়ার্ড ব্যবহার করুন (সংখ্যা, বিশেষ চিহ্ন)',
      'Terms & Conditions চেক করুন',
    ],
  },
  {
    id: 'signup-google',
    title: '🔵 Google দিয়ে Sign Up',
    description: 'Google Sign Up বাটন ক্লিক করলে আপনার Google অ্যাকাউন্ট দিয়ে সরাসরি Sign Up হয়ে যাবে।',
    tips: ['সবচেয়ে দ্রুত উপায়', 'কোন পাসওয়ার্ড মনে রাখতে হবে না'],
  },
  {
    id: 'signup-microsoft',
    title: '🔷 Microsoft দিয়ে Sign Up',
    description: 'Microsoft Sign Up বাটন ক্লিক করলে আপনার Microsoft অ্যাকাউন্ট দিয়ে Sign Up হয়ে যাবে।',
    tips: ['Office 365 ইউজারদের জন্য আদর্শ', 'তাৎক্ষণিক verification'],
  },
  {
    id: 'login-intro',
    title: '🔐 Login করা সহজ',
    description: 'একই তিনটি উপায়ে Login করতে পারেন যা Sign Up এ ছিল।',
    tips: ['Remember me চেক করলে পরবর্তীতে স্বয়ংক্রিয় login হবে'],
  },
  {
    id: 'login-password',
    title: '🔑 Password দিয়ে Login',
    description: 'Email এবং Password দিয়ে Login করুন। Password দেখতে চাইলে Eye আইকন ক্লিক করুন।',
    tips: ['পাসওয়ার্ড ভুলে গেলে "Forgot password?" ক্লিক করুন', 'পাবলিক কম্পিউটারে Remember me চেক করবেন না'],
  },
  {
    id: '2fa-intro',
    title: '🛡️ Two-Factor Authentication (2FA)',
    description: 'যদি 2FA সক্ষম করা থাকে, তাহলে 6-digit কোড দিতে হবে। আপনার Authenticator app থেকে কোড কপি করুন।',
    tips: ['Google Authenticator বা Authy ব্যবহার করুন', 'ব্যাকআপ কোড সংরক্ষণ করুন'],
  },
  {
    id: 'dashboard-header',
    title: '🏠 Dashboard এ স্বাগতম!',
    description: 'এটি আপনার Dashboard। উপরে Header এ সব গুরুত্বপূর্ণ বাটন আছে।',
    highlightElement: 'header',
    tips: ['লোগো ক্লিক করলে Homepage এ ফিরে যাবেন', 'Theme toggle দিয়ে Dark/Light mode পরিবর্তন করুন'],
  },
  {
    id: 'settings-menu',
    title: '⚙️ Settings Menu (☰)',
    description: 'ডান দিকের তিন লাইন (☰) ক্লিক করলে Settings Menu খুলবে যেখানে সব অপশন আছে।',
    highlightElement: 'settings-menu',
    tips: [
      '📤 Publish App - আপনার অ্যাপ পাবলিক করুন',
      '🌐 Publish Website - আপনার ওয়েবসাইট পাবলিক করুন',
      '⏰ Scheduled tasks - স্বয়ংক্রিয় কাজ',
      '👤 Account - প্রোফাইল সেটিংস',
      '🛡️ Security - 2FA সেটআপ',
      '🚪 Logout - লগআউট করুন',
    ],
  },
  {
    id: 'feature-cards',
    title: '💡 Feature Cards',
    description: 'Homepage এ 6টি Feature Card আছে। প্রতিটি Card ক্লিক করলে নতুন কিছু করতে পারবেন।',
    tips: [
      '🎨 Design to Code - ছবি থেকে কোড তৈরি করুন',
      '💻 Build a fullstack app - সম্পূর্ণ অ্যাপ তৈরি করুন',
      '🛍️ Launch a storefront - অনলাইন স্টোর তৈরি করুন',
      '📱 Mobile App - মোবাইল অ্যাপ তৈরি করুন',
      '📝 Write Content - নিবন্ধ/ব্লগ লিখুন',
      '🎵 Create Music - মিউজিক তৈরি করুন',
    ],
  },
  {
    id: 'search-chat',
    title: '🔍 Search & Chat Interface',
    description: 'নিচের Search Bar এ যেকোনো প্রশ্ন বা কমান্ড লিখুন। Action buttons দিয়ে ফাইল বা ছবি যোগ করুন।',
    tips: [
      '📎 Upload - ফাইল আপলোড করুন',
      '🎨 Image - ছবি যোগ করুন',
      '💡 Ideas - আইডিয়া পান',
      '➡️ Send - বার্তা পাঠান',
    ],
  },
  {
    id: 'profile-settings',
    title: '👤 Profile Settings',
    description: 'Settings Menu → Account এ আপনার প্রোফাইল সম্পাদনা করতে পারেন।',
    tips: [
      'Profile Tab - নাম, ফোন, অবস্থান যোগ করুন',
      'Security Tab - পাসওয়ার্ড পরিবর্তন করুন',
      'Notifications Tab - সতর্কতা সেটিংস',
      'Billing Tab - প্ল্যান এবং পেমেন্ট',
    ],
  },
  {
    id: 'security-2fa',
    title: '🔒 Security & 2FA Setup',
    description: 'Settings Menu → Account → Security Tab এ 2FA সেটআপ করতে পারেন।',
    tips: [
      'QR কোড স্ক্যান করুন',
      'Authenticator app এ যোগ করুন',
      'ব্যাকআপ কোড সংরক্ষণ করুন',
      'এটি আপনার অ্যাকাউন্ট আরও নিরাপদ করবে',
    ],
  },
  {
    id: 'pricing-plans',
    title: '💳 Pricing & Plans',
    description: 'Settings Menu → Billing Tab এ আপনার বর্তমান প্ল্যান দেখতে পারেন এবং Upgrade করতে পারেন।',
    tips: [
      'Free Plan - সীমাবদ্ধ ফিচার',
      'Starter - ৳499 / $4.99',
      'Professional - ৳1,499 / $14.99',
      'Business - ৳4,999 / $49.99',
      'Enterprise - ৳9,999+ / $99.99+',
    ],
  },
  {
    id: 'payment-methods',
    title: '💰 Payment Methods',
    description: 'Bangladesh এ bKash, Nagad, Rocket ব্যবহার করতে পারেন। International এ Stripe, PayPal ব্যবহার করুন।',
    tips: [
      'সব পেমেন্ট সুরক্ষিত এবং এনক্রিপ্টেড',
      '7 দিনের মানি-ব্যাক গ্যারান্টি',
      'যেকোনো সময় ক্যান্সেল করতে পারেন',
    ],
  },
  {
    id: 'support',
    title: '🆘 Support & Help',
    description: 'কোন সমস্যা হলে Settings Menu → Your Mail এ যোগাযোগ করুন বা সাপোর্ট টিমে ইমেইল করুন।',
    tips: [
      'Email: support@bayojidai.com',
      'Chat: Settings Menu → Your Mail',
      'Phone: Business Plan+ এ 24/7 সাপোর্ট',
      'Knowledge Base: Settings Menu → Knowledge',
    ],
  },
  {
    id: 'congratulations',
    title: '🎉 অভিনন্দন!',
    description: 'আপনি এখন Bayojid AI Pro এর সব কিছু জানেন। এখন শুরু করুন এবং অসাধারণ কিছু তৈরি করুন!',
    tips: ['প্রথম প্রজেক্ট শুরু করুন', 'আমাদের সাথে যোগাযোগ করুন', 'বন্ধুদের সাথে শেয়ার করুন'],
  },
];

export default function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    // Auto-show tutorial for new users
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (hasSeenTutorial) {
      setIsOpen(false);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const handleComplete = () => {
    const newCompleted = [...completedSteps, TUTORIAL_STEPS[currentStep].id];
    setCompletedSteps(newCompleted);
    handleNext();
  };

  if (!isOpen) {
    return null;
  }

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Highlight Element */}
      {step.highlightElement && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Tutorial Card */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-700">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>

          {/* Description */}
          <p className="text-slate-300 mb-6 leading-relaxed">{step.description}</p>

          {/* Tips */}
          {step.tips && step.tips.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
              <p className="text-sm font-semibold text-purple-400 mb-3">💡 টিপস:</p>
              <ul className="space-y-2">
                {step.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step Counter */}
          <div className="text-sm text-slate-400 mb-6">
            ধাপ {currentStep + 1} এর {TUTORIAL_STEPS.length}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              আগে
            </Button>

            {currentStep === TUTORIAL_STEPS.length - 1 ? (
              <Button
                onClick={handleSkip}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Check className="w-4 h-4 mr-2" />
                শেষ করুন
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                পরবর্তী
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Skip Link */}
          <button
            onClick={handleSkip}
            className="w-full mt-3 text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            এই টিউটোরিয়াল এখনই বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
