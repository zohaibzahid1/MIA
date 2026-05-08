'use client';
import { observer } from "mobx-react-lite";
import { useStore } from '@/context/storeContext';
import { useRouter } from 'next/navigation';
import {  useEffect } from 'react';

function HomePage() {
  const { userStore } = useStore();
  const router = useRouter();
  
  useEffect(() => {
    
      router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Medical Image Analysis</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

export default observer(HomePage);

