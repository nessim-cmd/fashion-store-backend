import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.user, res.data.token);
      localStorage.setItem('token', res.data.token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center px-8 md:px-20 lg:px-32 relative w-full h-full">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
           <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="mb-10 mt-16 md:mt-0">
           <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Back.</h1>
           <p className="text-gray-500">Log in to access your account.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
           {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm flex items-center gap-2">
                 <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                 </svg>
                 {error}
              </div>
           )}
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-xs text-gray-500">Email Address</label>
                 <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-gray-300 py-3 text-lg focus:outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300"
                    placeholder="name@example.com"
                    required
                 />
              </div>
              <div>
                 <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium uppercase tracking-wider text-xs text-gray-500">Password</label>
                 </div>
                 <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-gray-300 py-3 text-lg focus:outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300"
                    placeholder="••••••••"
                    required
                 />
              </div>
           </div>

           <Button className="w-full h-14 bg-black text-white hover:bg-gray-800 text-sm font-bold uppercase tracking-widest mt-4" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
           </Button>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
           Don't have an account? {' '}
           <Link to="/register" className="font-semibold text-black hover:underline">
              Join Us
           </Link>
        </p>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:block relative bg-gray-100 h-full w-full">
         <img 
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=2073" 
            alt="Fashion" 
            className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-black/10" />
      </div>
    </div>
  );
};
