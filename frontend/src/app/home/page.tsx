'use client';

import { observer } from 'mobx-react-lite';
import { useStore } from '@/context/storeContext';
import { useRouter } from 'next/navigation';
import { LandingNavbar } from '@/components/shared/LandingNavbar';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Zap,
  TrendingUp,
  ArrowRight,
  Shield,
  BarChart3,
  Clock,
} from 'lucide-react';

const HomePageComponent = () => {
  const { userStore } = useStore();
  const router = useRouter();
  const isLoggedIn = !!userStore.user;

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_32%),linear-gradient(to_bottom,_#f7fbf9,_#ffffff)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Medical Image <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">Analysis</span>
                </h1>
                <p className="text-xl text-gray-600">
                  Advanced AI-powered diagnostic insights for medical imaging. Faster diagnosis, better outcomes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push(isLoggedIn ? '/dashboard' : '/auth')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white h-12 text-base shadow-sm shadow-emerald-700/15"
                >
                  {isLoggedIn ? 'Continue to Dashboard' : 'Get Started'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="h-12 text-base border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                  disabled
                >
                  Learn More
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-700" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-700" />
                  <span>Real-time Processing</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full h-80">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-3xl blur-3xl opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-transparent rounded-3xl flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-700/15">
                    <Brain className="w-24 h-24 text-emerald-100" strokeWidth={1} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600">
              Everything you need for comprehensive medical image analysis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-emerald-100 hover:border-emerald-200 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Advanced machine learning algorithms deliver accurate diagnostic insights from CT scans, X-rays, and MRI images.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-emerald-100 hover:border-emerald-200 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Process medical images in seconds. Real-time analysis means faster diagnosis and reduced patient wait times.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-emerald-100 hover:border-emerald-200 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Detailed Insights</h3>
              <p className="text-gray-600">
                Get confidence scores, classification data, and comprehensive analysis reports for each image.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 border border-emerald-100 hover:border-emerald-200 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Patient Management</h3>
              <p className="text-gray-600">
                Organize and manage patient records, track analysis history, and monitor trends over time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 border border-emerald-100 hover:border-emerald-200 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h3>
              <p className="text-gray-600">
                HIPAA compliant, encrypted data transmission, and secure cloud storage for all sensitive medical data.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 border border-emerald-100 hover:border-emerald-200 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Integration</h3>
              <p className="text-gray-600">
                Simple API and user-friendly dashboard. Integrate with existing workflows in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">About Medical Image Analysis</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our platform leverages cutting-edge artificial intelligence and machine learning to revolutionize medical image analysis. 
            We work with healthcare professionals to provide fast, accurate, and reliable diagnostic support.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Supporting multiple imaging modalities including CT scans, X-rays, and Brain MRI, our system is designed to assist 
            radiologists and healthcare providers in delivering better patient outcomes.
          </p>
          <div className="pt-8">
            <Button
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/auth')}
              size="lg"
              className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-700/15"
            >
              {isLoggedIn ? 'Continue to Dashboard' : 'Start Your Journey'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-4">© 2026 Medical Image Analysis. All rights reserved.</p>
          <p className="text-sm">Medical Image Analysis Platform - Powered by Advanced AI</p>
        </div>
      </footer>
    </div>
  );
};

export default observer(HomePageComponent);
