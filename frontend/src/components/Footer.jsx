import React from 'react';
import { ShieldCheck, Mail, GitBranch, ExternalLink } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <ShieldCheck className="footer-icon" size={24} />
              <span>ReturnShield AI</span>
            </div>
            <p className="footer-tagline">
              Empowering e-commerce merchants with automated dispatch evidence, 
              tamper verification, and explainable dispute reports.
            </p>
            <div className="disclaimer-badge">
              <strong>Independent Platform Notice:</strong> ReturnShield AI is an autonomous 
              seller-support utility. It has no formal affiliation with or endorsement by Meesho, 
              Flipkart, Amazon, or any third-party marketplace.
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#features">Evidence Preservation</a>
              <a href="#problem">Risk Intelligence</a>
              <a href="#claims">Dispute Dossiers</a>
            </div>

            <div className="footer-col">
              <h4>Resources</h4>
              <a href="/docs">Architecture Docs</a>
              <a href="/api">API Reference</a>
              <a href="#benefits">Seller Guidelines</a>
              <a href="#faq">FAQ</a>
            </div>

            <div className="footer-col">
              <h4>Transparency</h4>
              <span>Open Source Student Project</span>
              <span>Explainable AI (No Blackbox)</span>
              <span>Privacy & Image Retention</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ReturnShield AI. Designed for modern e-commerce transparency.</p>
          <div className="footer-bottom-links">
            <span className="pill-tag">Status: Operational</span>
            <span className="pill-tag">Phase 1 Complete</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
