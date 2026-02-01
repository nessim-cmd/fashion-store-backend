import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register form submitted', { name, email, password: '***' });
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      console.log('Calling API...');
      const res = await api.post('/auth/register', { name, email, password });
      console.log('API response:', res.data);
      setAuth(res.data.user, res.data.token);
      localStorage.setItem('token', res.data.token);
      toast.success('Welcome to Luxe!');
      navigate('/');
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Right Side - Image (Left in Register) */}
      <div className="hidden md:block relative bg-gray-100 h-full w-full order-2 md:order-1">
         <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=2000" 
            alt="Fashion" 
            className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Left Side - Form (Right in Register) */}
      <div className="flex flex-col justify-center px-8 md:px-20 lg:px-32 relative w-full h-full order-1 md:order-2">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
           <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="mb-10 mt-16 md:mt-0">
           <h1 className="text-4xl font-bold tracking-tight mb-2">Create Account.</h1>
           <p className="text-gray-500">Enter your details below to join us.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-xs text-gray-500">Full Name</label>
                 <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b border-gray-300 py-3 text-lg focus:outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300"
                    placeholder="John Doe"
                    required
                 />
              </div>
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
                 <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-xs text-gray-500">Password</label>
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

           <Button 
              type="submit"
              className="w-full h-14 bg-black text-white hover:bg-gray-800 text-sm font-bold uppercase tracking-widest mt-4" 
              disabled={isLoading}
           >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
           </Button>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
           Already a member? {' '}
           <Link to="/login" className="font-semibold text-black hover:underline">
              Sign In
           </Link>
        </p>
      </div>
    </div>
  );
};
