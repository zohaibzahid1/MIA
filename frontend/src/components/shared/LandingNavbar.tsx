'use client';

import { observer } from 'mobx-react-lite';
import { useStore } from '@/context/storeContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Stethoscope } from 'lucide-react';

const LandingNavbarComponent = () => {
  const { userStore } = useStore();
  const router = useRouter();
  const isLoggedIn = !!userStore.user;

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-emerald-100/80 z-50 shadow-[0_1px_0_rgba(16,185,129,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-600/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
              MedImage
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-emerald-700 transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-emerald-700 transition-colors">
              About
            </Link>
          </div>

          {/* Auth Button */}
          <div>
            {isLoggedIn ? (
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-700/15"
              >
                Continue to Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/auth')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-700/15"
              >
                Login with Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const LandingNavbar = observer(LandingNavbarComponent);
