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
  ArrowUpRight
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
        <div className="container hero-container">
          <div className="hero-badge">
            <span className="hero-badge-pill">Independent Tool</span>
            <span>Protecting E-Commerce Sellers Against Return Fraud</span>
          </div>

          <h1 className="heading-hero hero-title">
            Stop unfair return losses. <br />
            <span className="text-gradient">Protect every dispatched parcel.</span>
          </h1>

          <p className="text-subheading hero-subtitle">
            ReturnShield AI helps online sellers maintain immutable photographic dispatch evidence,
            compare returned goods against original records, and generate audit-grade dispute dossiers.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Start Protecting Dispatches</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              <span>Explore Live Demo</span>
            </Link>
          </div>

          {/* Social Proof / Metrics Bar */}
          <div className="hero-stats-strip">
            <div className="hero-stat-item">
              <span className="stat-number">30-40%</span>
              <span className="stat-label">Average return rate for fashion e-commerce</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Explainable risk scores & manual review steps</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="stat-number">1-Click</span>
              <span className="stat-label">Instant PDF claim dispute dossier export</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="section-padding problem-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">The Marketplace Dilemma</span>
            <h2 className="heading-section">Why Indian E-Commerce Sellers Are Losing Lakhs</h2>
            <p className="text-subheading">
              Sellers on open marketplaces frequently experience returns that consume margins and lack dispute evidence.
            </p>
          </div>

          <div className="grid-3 problem-grid">
            <div className="problem-card">
              <div className="problem-icon-wrap red">
                <AlertOctagon size={24} />
              </div>
              <h3>Used & Worn Items Returned</h3>
              <p>
                Customers wear festive or daily apparel, remove tags, and initiate returns citing subjective "fitting" or "quality" concerns.
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon-wrap amber">
                <Layers size={24} />
              </div>
              <h3>Wrong or Missing Items</h3>
              <p>
                Parcels arrive back with brick tiles, old cloths, or missing accessories, while seller support portals demand ironclad dispatch proof.
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon-wrap blue">
                <Camera size={24} />
              </div>
              <h3>Unorganized Dispatch Proofs</h3>
              <p>
                Packing tables capture thousands of WhatsApp or gallery photos that are impossible to retrieve when an SPF dispute ticket opens 20 days later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-padding how-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Simple Workflow</span>
            <h2 className="heading-section">How ReturnShield AI Safeguards Your Margin</h2>
            <p className="text-subheading">
              A frictionless four-step evidence pipeline built specifically for packing table efficiency.
            </p>
          </div>

          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-number">01</div>
              <h4>Capture Dispatch Proof</h4>
              <p>
                Snap 2-3 quick photos of the product and shipping label at your packing station. A tamper-evident QR code and timestamp token are generated.
              </p>
            </div>

            <div className="workflow-step">
              <div className="step-number">02</div>
              <h4>Record Return Request</h4>
              <p>
                When a return arrives, log the order reference and customer reason. The original dispatch photographs are pulled up automatically.
              </p>
            </div>

            <div className="workflow-step">
              <div className="step-number">03</div>
              <h4>Side-by-Side Inspection</h4>
              <p>
                Use our visual inspection studio to examine tag condition, seams, and color differences with assistive OpenCV similarity metrics.
              </p>
            </div>

            <div className="workflow-step">
              <div className="step-number">04</div>
              <h4>Export Dispute Dossier</h4>
              <p>
                Generate an audit-grade PDF report with risk notes, inspection timestamps, and clear photo evidence ready for SPF/ticket submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="section-padding features-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Enterprise-Grade Architecture</span>
            <h2 className="heading-section">Built For Real-World Reliability</h2>
            <p className="text-subheading">
              Transparent, explainable technologies with zero hype and zero black-box algorithms.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Lock size={22} /></div>
              <h4>Cryptographic Evidence Token</h4>
              <p>Every dispatch record is cryptographically indexed with unique verification hashes and QR codes.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Eye size={22} /></div>
              <h4>Side-by-Side Inspection Studio</h4>
              <p>Synchronized image viewer to inspect packaging seal, fabric texture, and accessories before approving return credits.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Sparkles size={22} /></div>
              <h4>Explainable AI Risk Engine</h4>
              <p>Transparent rule-based scoring (0-100) highlighting return frequency, pattern anomalies, and evidence mismatch reasons.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FileCheck2 size={22} /></div>
              <h4>1-Click Dispute Dossier Export</h4>
              <p>Generate professionally formatted PDF dispute documents containing high-resolution evidence for marketplace review.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><TrendingDown size={22} /></div>
              <h4>Loss Prevention Analytics</h4>
              <p>Track return rates by SKU, monitor verified damaged product values, and prevent repeated losses.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Search size={22} /></div>
              <h4>Instant Barcode / Order Search</h4>
              <p>Find past dispatch evidence in seconds using order IDs or SKU barcodes even months after delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="section-padding benefits-section">
        <div className="container benefits-container">
          <div className="benefits-text">
            <span className="section-eyebrow">Measurable Impact</span>
            <h2 className="heading-section">Save Hours of Packing Stress and Protect Thousands in Margin</h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <div className="check-icon"><Check size={18} /></div>
                <div>
                  <strong>Win Higher Seller Protection (SPF) Disputes:</strong>
                  <p>Platforms require clear, time-stamped evidence. ReturnShield AI produces standardized PDFs that ticket agents appreciate.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="check-icon"><Check size={18} /></div>
                <div>
                  <strong>Identify Problematic SKUs Early:</strong>
                  <p>Spot items with recurrent "damaged" or "fitting" disputes before manufacturing or stocking additional batches.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="check-icon"><Check size={18} /></div>
                <div>
                  <strong>Explainable, Honest AI:</strong>
                  <p>No unrealistic claims. We provide assistive computer vision indicators while leaving final judgments in seller hands.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="benefits-preview-card card">
            <div className="preview-card-header">
              <span className="badge badge-risk-high">High Risk Anomaly (Score: 84)</span>
              <span className="preview-timestamp">REF: EV-2026-9481</span>
            </div>
            <div className="preview-body">
              <div className="preview-row">
                <span>SKU:</span> <strong>KURTI-EMB-NAVY-L</strong>
              </div>
              <div className="preview-row">
                <span>Order Reference:</span> <strong>MEESH-ORD-882194</strong>
              </div>
              <div className="preview-row">
                <span>Return Reason:</span> <strong>Defective Fabric Claimed</strong>
              </div>
              <div className="preview-alert-box">
                <strong>AI Explanation Flag:</strong>
                <ul>
                  <li>Customer has filed 4 consecutive return claims across 30 days.</li>
                  <li>Dispatch image shows intact security tag #9482. Return photo shows tag removed.</li>
                  <li>Histograms indicate significant color distortion on returned piece.</li>
                </ul>
              </div>
              <div className="preview-action-btn">
                <span className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  Generate Dispute Dossier (PDF)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="heading-section text-white">Ready to Defend Your E-Commerce Margins?</h2>
          <p className="cta-subtitle">
            Join hundreds of proactive sellers who manage returns with verifiable evidence instead of guesswork.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started For Free
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In to Your Workspace
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
