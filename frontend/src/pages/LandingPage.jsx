import React from 'react';
import { 
  ShieldCheck, 
  Camera, 
  Sparkles, 
  FileCheck2, 
  TrendingDown, 
  AlertOctagon, 
  ArrowRight, 
  Check, 
  Layers, 
  Eye, 
  Search,
  Lock,
  ArrowUpRight,
  RotateCcw,
  Cpu,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page-root">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        {/* Subtle Ambient Glowing Background Orbs */}
        <div className="hero-ambient-glow-1" />
        <div className="hero-ambient-glow-2" />

        <div className="container hero-container">
          <div className="hero-badge">
            <span className="hero-badge-pill">AI Return Defense</span>
            <span>Smarter Returns. Safer Businesses.</span>
          </div>

          <h1 className="heading-hero hero-title">
            Protect Your Business From <br />
            <span className="text-gradient">Unfair Returns.</span>
          </h1>

          <p className="text-subheading hero-subtitle">
            Verify product conditions, identify unusual return patterns, and manage return-related losses with intelligent insights.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Start Free Seller Trial</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              <span>Explore Interactive Demo</span>
              <ArrowUpRight size={18} />
            </Link>
          </div>

          {/* Floating Analytics Dashboard Preview */}
          <div className="hero-preview-container">
            <div className="hero-preview-browser-bar">
              <div className="browser-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="browser-url">returnshield.ai/seller/dashboard</div>
            </div>

            <div className="hero-preview-content">
              {/* Mock Dashboard Top Metric Strip */}
              <div className="preview-metrics-grid">
                <div className="preview-metric-card">
                  <span className="preview-metric-title">Protected Dispatches</span>
                  <div className="preview-metric-value">1,482</div>
                  <span className="preview-metric-sub text-success">
                    <CheckCircle2 size={12} /> 100% Cryptographic QR Tagged
                  </span>
                </div>
                <div className="preview-metric-card highlight-cyan">
                  <span className="preview-metric-title">OpenCV Vision Disparity</span>
                  <div className="preview-metric-value" style={{ color: '#0E7490' }}>94.2%</div>
                  <span className="preview-metric-sub">Average Dispatch Authenticity</span>
                </div>
                <div className="preview-metric-card highlight-rose">
                  <span className="preview-metric-title">Fraud Prevented Loss</span>
                  <div className="preview-metric-value" style={{ color: '#DC2626' }}>₹2,84,500</div>
                  <span className="preview-metric-sub text-danger">
                    <AlertTriangle size={12} /> 38 Swapped Returns Intercepted
                  </span>
                </div>
              </div>

              {/* Side-by-Side Floating Visual Inspection Preview */}
              <div className="preview-inspection-card">
                <div className="preview-card-header">
                  <div className="preview-badge-row">
                    <span className="badge badge-primary">LIVE AUDIT STUDIO</span>
                    <span className="preview-order-ref">Order #MEESH-ORD-9021 • Anarkali Kurti</span>
                  </div>
                  <span className="badge badge-danger">High Risk Mismatch (88/100)</span>
                </div>

                <div className="preview-split-visual">
                  <div className="preview-photo-box">
                    <div className="photo-tag">ORIGINAL DISPATCH (VERIFIED)</div>
                    <div className="photo-placeholder original">
                      <div className="photo-inner-pill">
                        <Check size={14} /> Tag Intact • Brand New Rayon
                      </div>
                    </div>
                  </div>

                  <div className="preview-vs-divider">
                    <div className="vs-circle">VS</div>
                    <div className="vs-meter">
                      <span>Vision Match</span>
                      <strong>32% (Swapped)</strong>
                    </div>
                  </div>

                  <div className="preview-photo-box">
                    <div className="photo-tag warning">RECEIVED RETURN PARCEL</div>
                    <div className="photo-placeholder returned">
                      <div className="photo-inner-pill warning">
                        <AlertOctagon size={14} /> Swapped Worn Garment
                      </div>
                    </div>
                  </div>
                </div>

                <div className="preview-footer-action">
                  <div className="preview-action-text">
                    <strong>AI Recommendation:</strong> File Formal Marketplace Dispute Dossier. 100% Evidence Ready.
                  </div>
                  <Link to="/login" className="btn btn-primary btn-sm">
                    View Verified Claim PDF
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Stats Strip */}
          <div className="hero-stats-strip">
            <div className="hero-stat-item">
              <span className="stat-number">95.4%</span>
              <span className="stat-label">Marketplace dispute claims approved</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="stat-number">₹42 Lakh+</span>
              <span className="stat-label">Seller revenue recovered from return fraud</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="stat-number">&lt; 3 Sec</span>
              <span className="stat-label">Automated ReportLab PDF dossier generation</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="section-padding problem-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">The Real Problem</span>
            <h2 className="heading-section">Why Sellers Bleed 20%–35% of Profit in Returns</h2>
            <p className="text-subheading" style={{ marginTop: '0.75rem' }}>
              Selling on open marketplaces without verified dispatch evidence puts all financial liability on the merchant.
            </p>
          </div>

          <div className="grid-3">
            <div className="problem-card">
              <div className="problem-icon-wrap red">
                <AlertOctagon size={24} />
              </div>
              <h3>Swapped & Fake Returns</h3>
              <p>
                Customers return cheap replicas, used torn clothes, or bricks instead of the original product. Marketplaces auto-refund buyers, leaving you empty-handed.
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon-wrap amber">
                <TrendingDown size={24} />
              </div>
              <h3>Rejected Dispute Claims</h3>
              <p>
                When you file an Amazon Safe-T Claim or Meesho Support ticket, they reject it claiming you lack timestamped proof of what was packed in the dispatch box.
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon-wrap blue">
                <RotateCcw size={24} />
              </div>
              <h3>Serial Return Abuse</h3>
              <p>
                Habitual fraud returners exploit return windows to rotate wardrobes and electronics. Without customer cross-return history, you cannot detect patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-padding">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">How It Works</span>
            <h2 className="heading-section">From Dispatch to Payout in 4 Bulletproof Steps</h2>
            <p className="text-subheading" style={{ marginTop: '0.75rem' }}>
              Built specifically to comply with Amazon Safe-T, Flipkart SPF, and Meesho Seller Dispute guidelines.
            </p>
          </div>

          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-number">01</div>
              <h4>Capture Dispatch Proof</h4>
              <p>
                Take a quick photo of the sealed package and security tag. System generates a tamper-evident SHA-256 token and printable QR label.
              </p>
            </div>

            <div className="workflow-step">
              <div className="step-number">02</div>
              <h4>Log Return Intake</h4>
              <p>
                When a parcel returns to your warehouse, upload unboxing photos. ReturnShield matches the order history automatically.
              </p>
            </div>

            <div className="workflow-step">
              <div className="step-number">03</div>
              <h4>Side-by-Side Vision Audit</h4>
              <p>
                OpenCV algorithms calculate structural similarity and color histogram disparity to expose swapped items and broken tags instantly.
              </p>
            </div>

            <div className="workflow-step">
              <div className="step-number">04</div>
              <h4>Export PDF Dossier</h4>
              <p>
                1-click download of an official tamper-evident PDF dossier with timestamps, QR code, and photo evidence ready to submit for full payout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding" style={{ background: '#F7F7FC' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Intelligent Capabilities</span>
            <h2 className="heading-section">Engineered for High-Volume E-Commerce</h2>
            <p className="text-subheading" style={{ marginTop: '0.75rem' }}>
              Every feature is designed to save merchant time, stop losses, and guarantee platform reimbursement.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-box-icon">
                <Camera size={24} />
              </div>
              <h3>Pre-Dispatch Digital Vault</h3>
              <p>
                Capture and store packing condition photos with immutable SHA-256 cryptographic hashes and QR barcodes attached to shipping boxes.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-box-icon" style={{ background: 'rgba(66, 217, 232, 0.15)', color: '#0E7490' }}>
                <Eye size={24} />
              </div>
              <h3>Side-by-Side Inspection Studio</h3>
              <p>
                Compare pre-transit photos against returned parcels side-by-side. Tag security seal condition, missing components, or worn merchandise.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-box-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
                <Cpu size={24} />
              </div>
              <h3>Explainable AI Risk Engine (0-100)</h3>
              <p>
                Transparent, rule-based scoring evaluates customer return frequency, category risk, OpenCV visual disparity, and physical audit tags.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-box-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                <FileCheck2 size={24} />
              </div>
              <h3>1-Click Dispute Dossier PDF</h3>
              <p>
                Generate official legal-grade dispute dossiers formatted specifically for Meesho Seller Support, Amazon Safe-T, and Flipkart SPF claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Benefits Section */}
      <section id="benefits" className="section-padding">
        <div className="container">
          <div className="cta-banner">
            <h2>Ready to Stop Losing Money on Fake Returns?</h2>
            <p>
              Join hundreds of verified merchants who protect their inventory, win 95%+ of marketplace disputes, and recover their hard-earned profits.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-cyan btn-lg">
                <span>Create Seller Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                <span>Try Live Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
