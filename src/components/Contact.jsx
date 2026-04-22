import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, MessageCircle, Send, Facebook, Instagram, Music2, Globe, Clock, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Contact = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('*').single();
      if (data) setContactInfo(data);
    };
    fetchSettings();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="subtitle">Get in Touch</span>
          <h1>Connect with <span>Street Sushi</span></h1>
          <p>Have a question or a large order? We'd love to hear from you. Drop us a message or visit us!</p>
        </motion.div>
      </section>

      <div className="contact-grid-container">
        <div className="contact-grid">
          {/* Info Side */}
          <motion.aside 
            className="contact-info"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="info-card glass">
              <div className="info-group">
                <div className="icon-box"><Phone size={24} /></div>
                <div>
                  <h4>Call Us</h4>
                  <a href={`tel:${contactInfo?.contact_number}`}>{contactInfo?.contact_number || '+63 9XX XXX XXXX'}</a>
                </div>
              </div>

              <div className="info-group">
                <div className="icon-box"><MapPin size={24} /></div>
                <div>
                  <h4>Visit Us</h4>
                  <p>{contactInfo?.location || '123 Street, City'}</p>
                </div>
              </div>

              <div className="info-group">
                <div className="icon-box"><Clock size={24} /></div>
                <div>
                  <h4>Opening Hours</h4>
                  <p>Mon - Sat: 10:00 AM - 9:00 PM</p>
                  <p>Sunday: 11:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>

            <div className="social-card glass">
              <h3>Follow Our Journey</h3>
              <div className="social-links">
                {contactInfo?.fb_url && (
                  <a href={contactInfo.fb_url} target="_blank" rel="noopener noreferrer" className="social-link fb">
                    <Facebook size={20} />
                  </a>
                )}
                {contactInfo?.ig_url && (
                  <a href={contactInfo.ig_url} target="_blank" rel="noopener noreferrer" className="social-link ig">
                    <Instagram size={20} />
                  </a>
                )}
                {contactInfo?.tiktok_url && (
                  <a href={contactInfo.tiktok_url} target="_blank" rel="noopener noreferrer" className="social-link tt">
                    <Music2 size={20} />
                  </a>
                )}
              </div>
            </div>
          </motion.aside>

          {/* Form Side */}
          <motion.main 
            className="contact-form-side"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="form-wrapper glass">
              {submitted ? (
                <div className="form-success">
                  <div className="success-check">✓</div>
                  <h2>Message Sent!</h2>
                  <p>Thanks for reaching out. We'll get back to you as soon as possible.</p>
                  <button className="reset-btn" onClick={() => setSubmitted(false)}>Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3>Send us a Message</h3>
                  <div className="input-row">
                    <div className="field">
                      <label>Your Name</label>
                      <input 
                        type="text" 
                        placeholder="Name" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="Email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Subject</label>
                    <input 
                      type="text" 
                      placeholder="What is this about?" 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="field">
                    <label>Message</label>
                    <textarea 
                      placeholder="Tell us what's on your mind..." 
                      rows="5"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      required 
                    ></textarea>
                  </div>
                  <button type="submit" className={`send-btn ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : (
                      <>
                        <Send size={18} /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.main>
        </div>
      </div>

      <style jsx="true">{`
        .contact-page {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 100px;
        }

        .contact-hero {
          background: var(--street-black);
          color: white;
          padding: 150px 5% 100px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .contact-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at 100% 100%, var(--street-orange) 0%, transparent 40%);
          opacity: 0.2;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .subtitle {
          color: var(--street-orange);
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 800;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 15px;
        }

        .hero-content h1 {
          font-size: 4rem;
          font-family: var(--font-brush);
          margin-bottom: 25px;
        }

        .hero-content h1 span { color: var(--street-orange); }

        .hero-content p {
          font-size: 1.2rem;
          color: #94a3b8;
          line-height: 1.6;
        }

        .contact-grid-container {
          max-width: 1200px;
          margin: -60px auto 0;
          padding: 0 5%;
          position: relative;
          z-index: 10;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.8fr;
          gap: 40px;
        }

        .info-card, .social-card, .form-wrapper {
          background: white;
          border-radius: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border: 1px solid var(--glass-border);
        }

        .info-card {
          padding: 40px;
          margin-bottom: 30px;
        }

        .info-group {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 35px;
        }

        .info-group:last-child { margin-bottom: 0; }

        .icon-box {
          width: 55px;
          height: 55px;
          background: rgba(255, 107, 0, 0.1);
          color: var(--street-orange);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info-group h4 {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }

        .info-group p, .info-group a {
          font-weight: 700;
          color: var(--street-black);
          font-size: 1.1rem;
        }

        .social-card {
          padding: 40px;
          text-align: center;
        }

        .social-card h3 {
          font-size: 1.1rem;
          margin-bottom: 25px;
          color: var(--street-black);
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .social-link {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: var(--transition);
        }

        .social-link.fb { background: #1877f2; }
        .social-link.ig { background: #e4405f; }
        .social-link.tt { background: #000000; }

        .social-link:hover { transform: translateY(-5px); opacity: 0.9; }

        .form-wrapper {
          padding: 50px;
          height: 100%;
        }

        .form-wrapper h3 {
          font-size: 1.8rem;
          margin-bottom: 35px;
          font-family: var(--font-brush);
          color: var(--street-black);
        }

        .field { margin-bottom: 25px; }

        .field label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-wrapper input, .form-wrapper textarea {
          width: 100%;
          padding: 15px 20px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1rem;
          transition: var(--transition);
        }

        .form-wrapper input:focus, .form-wrapper textarea:focus {
          outline: none;
          background: white;
          border-color: var(--street-orange);
          box-shadow: 0 0 0 5px rgba(255, 107, 0, 0.1);
        }

        .send-btn {
          width: 100%;
          background: var(--street-orange);
          color: white;
          padding: 18px;
          border-radius: 16px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: var(--transition);
        }

        .send-btn:hover { background: var(--street-black); transform: translateY(-3px); }

        .form-success {
          text-align: center;
          padding: 40px 0;
        }

        .success-check {
          width: 70px;
          height: 70px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 30px;
        }

        .reset-btn {
          color: var(--street-orange);
          font-weight: 700;
          text-decoration: underline;
          background: none;
          border: none;
          cursor: pointer;
        }

        @media (max-width: 992px) {
          .contact-grid { grid-template-columns: 1fr; }
          .contact-hero { padding-top: 120px; }
          .hero-content h1 { font-size: 3rem; }
        }

        @media (max-width: 768px) {
          .contact-hero {
            padding: 100px 5% 60px;
          }
          .hero-content h1 {
            font-size: 2.5rem;
          }
          .form-wrapper {
            padding: 30px;
          }
        }

        @media (max-width: 480px) {
          .hero-content h1 {
            font-size: 2.2rem;
          }
          .input-row {
            grid-template-columns: 1fr;
          }
          .info-card {
            padding: 25px;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;
