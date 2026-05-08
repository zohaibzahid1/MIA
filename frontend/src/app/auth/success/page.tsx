'use client';
import { observer } from "mobx-react-lite";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useStore } from '@/context/storeContext';
import { validateAndProcessNewToken } from '@/utils/tokenValidation';

function LoginSuccess() {
  const router = useRouter();
  const { authStore } = useStore();
  const rootStore = useStore();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams?.get('token');
    const error = searchParams?.get('error');

    const handleAuthentication = async () => {
      if (token) {
        try {
          // Use the new token validation utility
          const result = await validateAndProcessNewToken(token, rootStore);
          
          if (result.isValid && result.shouldRedirect && result.redirectPath) {
            // Token successfully processed, redirect to dashboard
            router.push(result.redirectPath);
          } else if (result.error) {
            // Token processing failed
            authStore.setError(result.error);
            router.push('/auth');
          }
        } catch (err) {
          console.log("Error during token processing:", err);
          authStore.setError('Failed to process authentication token');
          router.push('/auth');
        }
      } else if (error) {
        const errorMessage = error === 'authentication_failed'
          ? 'Authentication failed. Please try again.'
          : error;
        authStore.setError(errorMessage);
        router.push('/auth'); // redirect to login on error
      } else {
        authStore.setError('Unexpected authentication result.');
        router.push('/auth');
      }

      setLoading(false);
    };

    setTimeout(handleAuthentication, 1000);
  }, [searchParams, authStore, rootStore, router]);

  // Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-100 via-green-50 to-emerald-100 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 border-t-green-700 mx-auto"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-transparent border-r-emerald-800 mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-2 animate-pulse rounded-full h-16 w-16 bg-gradient-to-r from-stone-100 to-green-100 mx-auto opacity-30"></div>
          </div>

          <p className="text-2xl text-emerald-950 font-bold animate-pulse">Authenticating</p>
          <p className="text-lg text-green-800 font-medium opacity-80 animate-bounce mt-2">Setting things up for you...</p>
        </div>
      </div>
    );
  }

  return null;
}

// Loading fallback component for Suspense
function AuthSuccessLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-100 via-green-50 to-emerald-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 border-t-green-700 mx-auto"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-transparent border-r-emerald-800 mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-2 animate-pulse rounded-full h-16 w-16 bg-gradient-to-r from-stone-100 to-green-100 mx-auto opacity-30"></div>
        </div>

        <p className="text-2xl text-emerald-950 font-bold animate-pulse">Loading</p>
        <p className="text-lg text-green-800 font-medium opacity-80 animate-bounce mt-2">Please wait...</p>
      </div>
    </div>
  );
}

// Wrap the component that uses useSearchParams in Suspense
function AuthSuccessPage() {
  return (
    <Suspense fallback={<AuthSuccessLoading />}>
      <LoginSuccess />
    </Suspense>
  );
}

export default observer(AuthSuccessPage);
