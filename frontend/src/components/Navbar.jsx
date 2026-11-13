import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Menu, X, ArrowRight, LogIn } from 'lucide-react';
import './Navbar.css';

/**
 * Navbar Component
 * Supports public marketing views and responsive mobile menu toggles.
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="site-header">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon-wrap">
            <ShieldAlert size={22} className="shield-icon" />
          </div>
          <span className="brand-name">
            ReturnShield <span className="brand-ai">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <a href="#problem" className="nav-link">The Problem</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#benefits" className="nav-link">Benefits</a>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          <Link to="/login" className="btn btn-secondary btn-sm">
            <LogIn size={16} />
            <span>Sign In</span>
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            <span>Get Started</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="mobile-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#problem" onClick={() => setMobileMenuOpen(false)}>The Problem</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#benefits" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
          <hr className="mobile-divider" />
          <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
