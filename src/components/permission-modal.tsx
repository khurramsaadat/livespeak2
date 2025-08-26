'use client';

import { useState, useEffect } from 'react';

interface PermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onMaybeLater: () => void;
  onClose: () => void;
}

export default function PermissionModal({ isOpen, onAllow, onMaybeLater, onClose }: PermissionModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = 'unset';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md transform transition-all duration-300 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-red-100 to-red-200 opacity-60 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 opacity-60 blur-2xl" />
          
          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Red Microphone Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Enable Microphone Access
            </h2>

            {/* Description */}
            <p className="mb-6 text-gray-600 leading-relaxed">
              LiveSpeak needs microphone access to provide real-time speech recognition. 
              Your audio is processed locally and never stored or transmitted.
            </p>

            {/* Privacy Note */}
            <div className="mb-8 rounded-lg bg-blue-50 p-4 border border-blue-100">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800">
                  <strong>Privacy First:</strong> All speech processing happens on your device. 
                  We never see, hear, or store your audio.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              {/* Allow Access Button */}
              <button
                onClick={onAllow}
                className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-white font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Allow Access
              </button>
              
              {/* Maybe Later Button */}
              <button
                onClick={onMaybeLater}
                className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Maybe Later
              </button>
            </div>

            {/* Additional Info */}
            <p className="mt-4 text-xs text-gray-500">
              You can change this permission anytime in your browser settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
