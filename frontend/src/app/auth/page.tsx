'use client';
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/storeContext';

function Login() {
  const router = useRouter();
  const [fadeIn, setFadeIn] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const { authStore } = useStore();
  const [currentIconIndex, setCurrentIconIndex] = useState(0);

  const quotes = [
    "Analyze medical scans securely with AI-assisted insights",
    "Support faster diagnosis workflows with structured imaging data",
    "Track scan uploads, processing, and results in one place",
    "Enable clinicians with reliable image analysis tooling"
  ];

  const icons = [
    // Chart Icon
    <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" key="chart">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>,
    // Users Icon
    <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" key="users">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>,
    // Target Icon
    <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" key="target">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 1.657-2.657 1.657-2.657A8 8 0 1017.657 18.657z" />
    </svg>,
    // Trophy Icon
    <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" key="trophy">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ];

  useEffect(() => {
    setFadeIn(true);

    if (authStore.isAuthenticated) {
      router.push('/dashboard');
    }

    // Quote rotation
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);

    // Icon rotation
    const iconInterval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length);
    }, 3000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(iconInterval);
    };
  }, [authStore.isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Top Section (Mobile) / Left Half (Desktop) - Company Branding */}
      <div className="flex-1 bg-gradient-to-br from-zinc-900 via-green-950 to-stone-800 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden min-h-[40vh] lg:min-h-screen">
        {/* Floating Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-green-700/10 rounded-full animate-ping"></div>
          <div className="absolute bottom-16 sm:bottom-32 right-8 sm:right-16 w-12 h-12 sm:w-24 sm:h-24 bg-green-600/10 rounded-full animate-ping animation-delay-1000"></div>
          <div className="absolute top-1/2 left-5 sm:left-10 w-8 h-8 sm:w-16 sm:h-16 bg-emerald-700/10 rounded-full animate-ping animation-delay-2000"></div>
        </div>

        <div className="text-center max-w-xs sm:max-w-md lg:max-w-lg relative z-10 w-full">
          <div className="mb-4 sm:mb-8">
            {/* Animated Icon */}
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="transform transition-all duration-1000 ease-in-out animate-fade-in">
                {icons[currentIconIndex]}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 tracking-tight transform transition-all duration-500 hover:scale-105">
              Medical Image Analysis
            </h1>
            <div className="w-12 sm:w-20 h-1 bg-green-500 mx-auto mb-4 sm:mb-6 transform origin-left animate-grow"></div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-green-300 mb-3 sm:mb-4 animate-slide-up">
              Clinical Imaging Platform
            </h2>
            
            {/* Animated Quote */}
            <div className="min-h-[3rem] sm:min-h-[4rem] flex items-center justify-center px-2">
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed transition-all duration-1000 ease-in-out transform animate-fade-in">
                {quotes[currentQuoteIndex]}
              </p>
            </div>
          </div>
          
          {/* Enhanced Decorative elements */}
          <div className="flex justify-center space-x-2 sm:space-x-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-700 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-800 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>

      {/* Bottom Section (Mobile) / Right Half (Desktop) - Login Card */}
      <div className="flex-1 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative min-h-[60vh] lg:min-h-screen">
        {/* Floating Elements */}
        <div className="absolute top-5 sm:top-10 right-5 sm:right-10 w-12 h-12 sm:w-20 sm:h-20 bg-green-50 rounded-full animate-float"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-8 h-8 sm:w-12 sm:h-12 bg-slate-50 rounded-full animate-float animation-delay-1000"></div>

        <div className="max-w-xs sm:max-w-sm lg:max-w-md w-full">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 transform transition-all duration-500 hover:shadow-3xl animate-slide-up">
            <div className="text-center mb-6 sm:mb-8">
              <div className="mb-3 sm:mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-700 to-emerald-900 rounded-full mb-3 sm:mb-4 animate-pulse">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold text-slate-800 mb-2 transform transition-all duration-1000 ${fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                Welcome Back
              </h3>
              <p className="text-slate-600 text-sm sm:text-base animate-fade-in animation-delay-500">
                Sign in to access Medical Image Analysis
              </p>
              
              {authStore.error && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 text-xs sm:text-sm font-medium">{authStore.error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 sm:space-y-6">
              <button
                className="w-full group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white text-slate-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-slate-200 hover:border-green-700 overflow-hidden animate-slide-up animation-delay-700"
                onClick={async () => {
                  await authStore.authenticate();
                }}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" 
                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.19 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.042 6.053 29.262 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.042 6.053 29.262 4 24 4c-7.682 0-14.417 4.337-17.694 10.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.16 0 9.86-1.977 13.409-5.197l-6.193-5.238C29.14 35.091 26.715 36 24 36c-5.169 0-9.627-3.331-11.284-7.946l-6.522 5.025C9.422 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 01-4.087 5.565l.003-.002 6.193 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/>
                </svg>
                <span className="font-semibold text-sm sm:text-base lg:text-lg relative z-10">
                  Continue with Google
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-50/0 via-green-50/50 to-green-50/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>

              <div className="text-center pt-2 sm:pt-4 animate-fade-in animation-delay-1000">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3 text-green-500 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secured by Google Authentication
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes grow {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes slide-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-grow { animation: grow 1s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .shadow-3xl { box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25); }
        
        /* Responsive breakpoints */
        @media (max-width: 1023px) {
          .min-h-screen {
            min-height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}

export default observer(Login);