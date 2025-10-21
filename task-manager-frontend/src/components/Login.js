// src/components/Login.js (Updated version with improved error handling)
import React, { useState } from 'react';
import { useAuth } from '../authcontext'; // Import the context
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

const loginImageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

// Define the maximum password length allowed by bcrypt
const MAX_PASSWORD_LENGTH = 72;

export default function Login() {
  const [activeView, setActiveView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const { login, signup } = useAuth(); // Get login and signup from context

  const switchView = (view) => {
    setActiveView(view);
    setError('');
    // Optionally clear passwords when switching views
    // setPassword('');
    // setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(''); // Clear previous errors
    setIsLoading(true); // Set loading state

    try {
      if (activeView === 'signup') {
        console.log('Login.js: Attempting signup...'); // Debug log
        // --- Frontend Check for Signup ---
        if (password.length > MAX_PASSWORD_LENGTH) {
          setError(`Password must be ${MAX_PASSWORD_LENGTH} characters or less.`);
          setIsLoading(false); // Reset loading state
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false); // Reset loading state
          return;
        }
        // Call the signup function from authcontext
        await signup(email, password);
        console.log('Login.js: Signup successful, should be logged in now.'); // Debug log
        // Signup successful, user should be logged in via the signup function calling login
        // App.js will automatically re-render and show the board due to token change
      } else if (activeView === 'login') {
         console.log('Login.js: Attempting login with email:', email); // Debug log
         // --- Frontend Check for Login ---
         if (password.length > MAX_PASSWORD_LENGTH) {
             setError(`Password is too long. Please use ${MAX_PASSWORD_LENGTH} characters or less.`);
             setIsLoading(false); // Reset loading state
             return;
         }
        // Call the login function from authcontext
        await login(email, password);
        console.log('Login.js: Login successful, should be redirected to board.'); // Debug log
        // Login successful, App.js will re-render and show the board
      } else if (activeView === 'forgot') {
        // Simulate sending reset email (replace with actual API call if implemented)
        // For now, just show a success message
        setError('Password reset link sent to your email.');
        // You might want to clear the email field here
        // setEmail('');
      }
    } catch (err) {
        console.error(`Login.js: Error during ${activeView}:`, err);
        // Improved error handling based on potential backend responses
        let errorMessage = 'An unexpected error occurred.';
        if (err.response) {
            // Server responded with error status
            if (err.response.status === 409) { // Assuming 409 for email conflict on signup
                errorMessage = 'Failed to create account. Email may already be in use.';
            } else if (err.response.status === 401) { // Assuming 401 for invalid credentials on login
                 errorMessage = 'Failed to sign in. Please check your credentials.';
            } else if (err.response.status === 422) { // Assuming 422 for validation errors
                 errorMessage = 'Invalid input. Please check your details.';
            } else {
                // This will catch the 500 error from the backend as well
                errorMessage = `Server error (${err.response.status}). Please try again later. Check the console for details.`;
            }
        } else if (err.request) {
            // Request was made but no response received (e.g., network error, server down, CORS issue)
            console.error('Login.js: Network error or no response received:', err.request);
            errorMessage = 'Network error. Please check your connection and ensure the backend server is running.';
        } else {
            // Something else happened in setting up the request
            console.error('Login.js: Error setting up request:', err.message);
            errorMessage = err.message || 'An unexpected error occurred.';
        }
        setError(errorMessage);
    } finally {
        setIsLoading(false); // Always reset loading state
    }
  };

  // Calculate password length for the sign-up view warning
  const passwordLength = password.length;

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
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      disabled={isLoading} // Disable input during loading
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
                      disabled={isLoading} // Disable input during loading
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2">
                    <button type="button" onClick={() => switchView('forgot')} className="text-gray-400 hover:text-green-400 transition-colors" disabled={isLoading}>
                      Forgot Password?
                    </button>
                    <button type="button" onClick={() => switchView('signup')} className="font-semibold text-green-400 hover:text-green-300 transition-colors" disabled={isLoading}>
                      Create Account
                    </button>
                  </div>

                  {error && activeView === 'login' && (
                    <p className="text-sm text-red-400 bg-red-900 bg-opacity-20 py-2 rounded">{error}</p>
                  )}

                  <button
                    type="submit" // Changed from onClick to onSubmit via form
                    disabled={isLoading} // Disable button during loading
                    className="w-full mt-4 px-6 py-3 font-semibold text-sm tracking-wider text-white border border-gray-600 hover:bg-green-400 hover:text-black hover:border-green-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'SIGNING IN...' : 'SIGN IN'} {/* Show loading text */}
                  </button>

                </div>
              </div>
              </form>

              {/* Signup View */}
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      disabled={isLoading} // Disable input during loading
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
                      disabled={isLoading} // Disable input during loading
                    />
                  </div>

                  {/* Add a warning message near the password field for signup */}
                  {activeView === 'signup' && passwordLength > MAX_PASSWORD_LENGTH - 5 && ( // Show warning when close to limit
                    <p className="text-xs text-yellow-500 mt-[-10px]"> {/* Adjust margin as needed */}
                      Password length: {passwordLength}/{MAX_PASSWORD_LENGTH} (Truncated if over {MAX_PASSWORD_LENGTH})
                    </p>
                  )}

                  <div className="relative">
                    <FaLock className="absolute left-0 top-1/2 -translate-y-1/2 text-green-400 text-sm" />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-7 py-3 bg-transparent text-white text-sm placeholder-gray-500 border-0 border-b border-gray-600 focus:outline-none focus:border-green-400 transition-colors"
                      disabled={isLoading} // Disable input during loading
                    />
                  </div>

                  <div className="flex justify-end items-center text-sm pt-2">
                    <button type="button" onClick={() => switchView('login')} className="font-semibold text-green-400 hover:text-green-300 transition-colors" disabled={isLoading}>
                      Already have an account?
                    </button>
                  </div>

                  {error && activeView === 'signup' && (
                    <p className="text-sm text-red-400 bg-red-900 bg-opacity-20 py-2 rounded">{error}</p>
                  )}

                  <button
                    type="submit" // Changed from onClick to onSubmit via form
                    disabled={isLoading} // Disable button during loading
                    className="w-full mt-4 px-6 py-3 font-semibold text-sm tracking-wider text-white border border-gray-600 hover:bg-green-400 hover:text-black hover:border-green-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'} {/* Show loading text */}
                  </button>

                </div>
              </div>
              </form>

              {/* Forgot Password View */}
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      disabled={isLoading} // Disable input during loading
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2">
                    <button type="button" onClick={() => switchView('login')} className="text-gray-400 hover:text-green-400 transition-colors" disabled={isLoading}>
                      Back to Sign In
                    </button>
                    <button type="button" onClick={() => switchView('signup')} className="font-semibold text-green-400 hover:text-green-300 transition-colors" disabled={isLoading}>
                      Create Account
                    </button>
                  </div>

                  {error && activeView === 'forgot' && (
                    <p className="text-sm text-green-400 bg-green-900 bg-opacity-20 py-2 rounded">{error}</p>
                  )}

                  <button
                    type="submit" // Changed from onClick to onSubmit via form
                    disabled={isLoading} // Disable button during loading
                    className="w-full mt-4 px-6 py-3 font-semibold text-sm tracking-wider text-white border border-gray-600 hover:bg-green-400 hover:text-black hover:border-green-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'SENDING...' : 'SEND RESET LINK'} {/* Show loading text */}
                  </button>

                </div>
              </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}