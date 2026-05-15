import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    api.getMe().then(user => {
      if (user.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    }).catch(() => {
      // Not logged in, stay here
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;
    
    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (data.user.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface-container flex flex-col justify-center items-center p-6">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#22C55E] rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-xl leading-none">L</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-brand-text-main">Lingkod Hub</span>
      </Link>

      <div className="w-full max-w-md bg-brand-surface p-10 rounded-3xl border border-brand-outline shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-text-main mb-2">Welcome back</h1>
          <p className="text-sm text-brand-text-variant">Enter your details to access your account</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-brand-text-main mb-2">Email address</label>
            <input 
              name="email"
              type="email" 
              required
              placeholder="you@example.com" 
              className="w-full px-4 py-3 bg-brand-surface-card border border-brand-outline rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-brand-text-main">Password</label>
            </div>
            <input 
              name="password"
              type="password" 
              required
              placeholder="••••••••" 
              className="w-full px-4 py-3 bg-brand-surface-card border border-brand-outline rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm"
            />
          </div>
          <button disabled={loading} type="submit" className="w-full py-3.5 mt-2 bg-brand-primary hover:bg-[#059669] disabled:opacity-50 text-white font-semibold rounded-xl shadow-md shadow-brand-primary/20 transition-all">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-brand-text-variant">
            Don't have an account? <Link to="/signup" className="text-brand-primary font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
