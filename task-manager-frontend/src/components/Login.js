import React, { useState } from 'react';
import { useAuth } from '../authcontext';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

const loginImageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

export default function Login() {
  const [activeView, setActiveView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { login, signup } = useAuth();

  const switchView = (view) => {
    setActiveView(view);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (activeView === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      try {
        await signup(email, password);
      } catch (err) {
        setError('Failed to create account. Email may already be in use.');
      }
    } else if (activeView === 'login') {
      try {
        await login(email, password);
      } catch (err) {
        setError('Failed to sign in. Please check your credentials.');
      }
    } else if (activeView === 'forgot') {
      setError('Password reset link sent to your email.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <div className="w-full max-w-5xl flex overflow-hidden shadow-2xl">
        
        <div className="hidden md:block md:w-1/2 relative">
          <div className="absolute inset-0 bg-cover bg-center blur-md" style={{ backgroundImage: `url(${loginImageUrl})` }}></div>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <h1 className="text-5xl font-bold text-white tracking-widest">NEXTUP.</h1>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center px-16 py-12 bg-black">
          <div className="w-full max-w-md mx-auto">
            
            <div className="relative overflow-hidden">
              
              {/* Login View */}
              <div 
                className="transition-all duration-500 ease-in-out"
                style={{ 
                  opacity: activeView === 'login' ? 1 : 0,
                  transform: `translateX(${activeView === 'login' ? '0' : activeView === 'signup' ? '-100%' : '100%'})`,
                  position: activeView === 'login' ? 'relative' : 'absolute',
                  width: '100%',
                  pointerEvents: activeView === 'login' ? 'auto' : 'none'
                }}
              >
                <h2 className="text-3xl font-bold text-white mb-1">SIGN IN</h2>
                <div className="w-12 h-0.5 bg-green-400 mb-6"></div>
                <p className="text-gray-400 text-sm mb-8">Enter your credentials to access your account</p>

                <div className="space-y-6">
                  <div className="relative">
                    <FaUser className="absolute left-0 top-1/2 -translate-y-1/2 text-green-400 text-sm" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-7 py-3 bg-transparent text-white text-sm placeholder-gray-500 border-0 border-b border-gray-600 focus:outline-none focus:border-green-400 transition-colors"
                    />
                  </div>
                  
                  <div className="relative">
                    <FaLock className="absolute left-0 top-1/2 -translate-y-1/2 text-green-400 text-sm" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-7 py-3 bg-transparent text-white text-sm placeholder-gray-500 border-0 border-b border-gray-600 focus:outline-none focus:border-green-400 transition-colors"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2">
                    <button type="button" onClick={() => switchView('forgot')} className="text-gray-400 hover:text-green-400 transition-colors">
                      Forgot Password?
                    </button>
                    <button type="button" onClick={() => switchView('signup')} className="font-semibold text-green-400 hover:text-green-300 transition-colors">
                      Create Account
                    </button>
                  </div>

                  {error && activeView === 'login' && (
                    <p className="text-sm text-red-400 bg-red-900 bg-opacity-20 py-2 rounded">{error}</p>
                  )}

                  <button
                    onClick={handleSubmit}
                    className="w-full mt-4 px-6 py-3 font-semibold text-sm tracking-wider text-white border border-gray-600 hover:bg-green-400 hover:text-black hover:border-green-400 transition-all duration-300"
                  >
                    SIGN IN
                  </button>
                </div>
              </div>

              {/* Signup View */}
              <div 
                className="transition-all duration-500 ease-in-out"
                style={{ 
                  opacity: activeView === 'signup' ? 1 : 0,
                  transform: `translateX(${activeView === 'signup' ? '0' : activeView === 'forgot' ? '-100%' : '100%'})`,
                  position: activeView === 'signup' ? 'relative' : 'absolute',
                  width: '100%',
                  top: 0,
                  pointerEvents: activeView === 'signup' ? 'auto' : 'none'
                }}
              >
                <h2 className="text-3xl font-bold text-white mb-1">CREATE ACCOUNT</h2>
                <div className="w-12 h-0.5 bg-green-400 mb-6"></div>
                <p className="text-gray-400 text-sm mb-8">Get started by creating your new account</p>

                <div className="space-y-6">
                  <div className="relative">
                    <FaEnvelope className="absolute left-0 top-1/2 -translate-y-1/2 text-green-400 text-sm" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-7 py-3 bg-transparent text-white text-sm placeholder-gray-500 border-0 border-b border-gray-600 focus:outline-none focus:border-green-400 transition-colors"
                    />
                  </div>
                  
                  <div className="relative">
                    <FaLock className="absolute left-0 top-1/2 -translate-y-1/2 text-green-400 text-sm" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-7 py-3 bg-transparent text-white text-sm placeholder-gray-500 border-0 border-b border-gray-600 focus:outline-none focus:border-green-400 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-0 top-1/2 -translate-y-1/2 text-green-400 text-sm" />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-7 py-3 bg-transparent text-white text-sm placeholder-gray-500 border-0 border-b border-gray-600 focus:outline-none focus:border-green-400 transition-colors"
                    />
                  </div>

                  <div className="flex justify-end items-center text-sm pt-2">
                    <button type="button" onClick={() => switchView('login')} className="font-semibold text-green-400 hover:text-green-300 transition-colors">
                      Already have an account?
                    </button>
                  </div>

                  {error && activeView === 'signup' && (
                    <p className="text-sm text-red-400 bg-red-900 bg-opacity-20 py-2 rounded">{error}</p>
                  )}

                  <button
                    onClick={handleSubmit}
                    className="w-full mt-4 px-6 py-3 font-semibold text-sm tracking-wider text-white border border-gray-600 hover:bg-green-400 hover:text-black hover:border-green-400 transition-all duration-300"
                  >
                    CREATE ACCOUNT
                  </button>
                </div>
              </div>

              {/* Forgot Password View */}
              <div 
                className="transition-all duration-500 ease-in-out"
                style={{ 
                  opacity: activeView === 'forgot' ? 1 : 0,
                  transform: `translateX(${activeView === 'forgot' ? '0' : activeView === 'login' ? '-100%' : '100%'})`,
                  position: activeView === 'forgot' ? 'relative' : 'absolute',
                  width: '100%',
                  top: 0,
                  pointerEvents: activeView === 'forgot' ? 'auto' : 'none'
                }}
              >
                <h2 className="text-3xl font-bold text-white mb-1">RESET PASSWORD</h2>
                <div className="w-12 h-0.5 bg-green-400 mb-6"></div>
                <p className="text-gray-400 text-sm mb-8">Enter your email to receive a password reset link</p>

                <div className="space-y-6">
                  <div className="relative">
                    <FaEnvelope className="absolute left-0 top-1/2 -translate-y-1/2 text-green-400 text-sm" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-7 py-3 bg-transparent text-white text-sm placeholder-gray-500 border-0 border-b border-gray-600 focus:outline-none focus:border-green-400 transition-colors"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2">
                    <button type="button" onClick={() => switchView('login')} className="text-gray-400 hover:text-green-400 transition-colors">
                      Back to Sign In
                    </button>
                    <button type="button" onClick={() => switchView('signup')} className="font-semibold text-green-400 hover:text-green-300 transition-colors">
                      Create Account
                    </button>
                  </div>

                  {error && activeView === 'forgot' && (
                    <p className="text-sm text-green-400 bg-green-900 bg-opacity-20 py-2 rounded">{error}</p>
                  )}

                  <button
                    onClick={handleSubmit}
                    className="w-full mt-4 px-6 py-3 font-semibold text-sm tracking-wider text-white border border-gray-600 hover:bg-green-400 hover:text-black hover:border-green-400 transition-all duration-300"
                  >
                    SEND RESET LINK
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}