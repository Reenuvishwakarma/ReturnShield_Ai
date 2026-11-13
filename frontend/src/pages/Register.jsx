import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, User, Store, ArrowRight, AlertCircle } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register(name, email, storeName, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <ShieldCheck size={26} className="text-accent" />
            <span>ReturnShield AI</span>
          </Link>
          <h2>Create Seller Account</h2>
          <p className="text-muted">Start preserving dispatch evidence and blocking fraudulent returns</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="field-icon" />
              <input
                type="text"
                required
                className="form-input with-left-icon"
                placeholder="Rohit Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Store / Brand Name</label>
            <div className="input-with-icon">
              <Store size={18} className="field-icon" />
              <input
                type="text"
                required
                className="form-input with-left-icon"
                placeholder="Mehta Ethnic World"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Seller Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                type="email"
                required
                className="form-input with-left-icon"
                placeholder="rohit@mehtatextiles.com"
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
                placeholder="Min 6 characters"
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
            {isSubmitting ? 'Registering Workspace...' : 'Register Workspace'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          Already have a seller account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
