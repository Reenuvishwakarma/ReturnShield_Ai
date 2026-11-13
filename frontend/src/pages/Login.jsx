import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('seller@returnshield.ai');
    setPassword('seller123');
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <ShieldCheck size={26} className="text-accent" />
            <span>ReturnShield AI</span>
          </Link>
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to your seller evidence dashboard</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Seller Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                type="email"
                required
                className="form-input with-left-icon"
                placeholder="seller@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input with-left-icon with-right-btn"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="demo-credentials-banner">
          <div className="demo-header">
            <strong>Demo Credentials Available:</strong>
            <button type="button" onClick={handleDemoFill} className="btn-demo-link">
              Fill Demo Login
            </button>
          </div>
          <code>seller@returnshield.ai / seller123</code>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create seller workspace</Link>
        </div>
      </div>
    </div>
  );
}
