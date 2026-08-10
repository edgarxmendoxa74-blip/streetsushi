import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Phone, Clock } from 'lucide-react';

const Footer = () => {
  const [logo, setLogo] = useState('/logo.png');
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('site_settings').select('*').single();
      if (data) {
        if (data.logo_url) setLogo(data.logo_url);
        setContactInfo(data);
      }
    };
    fetchData();

    // Set up real-time subscription for site settings
    const subscription = supabase
      .channel('footer_settings_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'site_settings' 
      }, payload => {
        if (payload.new.logo_url) setLogo(payload.new.logo_url);
        setContactInfo(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content-grid">
          
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo-wrapper">
              <img src={logo} alt="Street Sushi Logo" className="footer-logo" />
              <h3>Street <span>Sushi</span></h3>
            </div>
            <p className="footer-tagline">Artistry in Every Bite. Fresh cuts, master-crafted recipes, and the true soul of Tokyo street sushi.</p>
            <div className="footer-socials">
              {contactInfo?.fb_url && (
                <a href={contactInfo.fb_url} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                  <FacebookIcon />
                </a>
              )}
              {contactInfo?.ig_url && (
                <a href={contactInfo.ig_url} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              )}
              {contactInfo?.tiktok_url && (
                <a href={contactInfo.tiktok_url} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
                  <TikTokIcon />
                </a>
              )}
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <div className="contact-list">
              <div className="contact-item-row">
                <div className="icon-circle"><Phone size={18} /></div>
                <div className="contact-item-content">
                  <label>Call or Message</label>
                  <a href={`tel:${contactInfo?.contact_number}`} className="contact-link">
                    {contactInfo?.contact_number || '+63 9XX XXX XXXX'}
                  </a>
                </div>
              </div>
              <div className="contact-item-row">
                <div className="icon-circle"><MapPin size={18} /></div>
                <div className="contact-item-content">
                  <label>Find Us</label>
                  <span className="contact-text">{contactInfo?.location || '123 Street, City'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Section */}
          <div className="footer-hours">
            <h4>Opening Hours</h4>
            <div className="hours-list">
              <div className="contact-item-row">
                <div className="icon-circle"><Clock size={18} /></div>
                <div>
                  <p className="hours-text"><strong>Mon - Sat:</strong> 10:00 AM - 9:00 PM</p>
                  <p className="hours-text"><strong>Sunday:</strong> 11:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Street Sushi. All Rights Reserved.</p>
      </div>

      <style jsx="true">{`
        .site-footer {
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
          color: #f3f4f6;
          padding: 60px 5% 0;
          border-top: 4px solid var(--street-orange);
          position: relative;
          overflow: hidden;
        }

        .site-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--street-orange), transparent);
          opacity: 0.5;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding-bottom: 40px;
        }

        .footer-content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 50px;
          width: 100%;
        }

        /* Brand Section */
        .footer-brand {
          text-align: left;
        }

        .footer-logo-wrapper {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .footer-logo {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          border: 2px solid var(--street-orange);
          object-fit: cover;
          box-shadow: 0 4px 15px rgba(255, 107, 0, 0.2);
        }

        .footer-brand h3 {
          font-family: var(--font-brush);
          font-size: 2.5rem;
          margin: 0;
          color: white;
          line-height: 1;
        }

        .footer-brand h3 span {
          color: var(--street-orange);
        }

        .footer-tagline {
          color: #9ca3af;
          font-size: 0.95rem;
          line-height: 1.7;
          margin: 20px 0 30px;
          max-width: 400px;
        }

        .footer-socials {
          display: flex;
          gap: 12px;
        }

        .social-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .social-icon:hover {
          background: var(--street-orange);
          color: white;
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(255, 107, 0, 0.4);
          border-color: var(--street-orange);
        }

        /* Contact & Hours Sections */
        .footer-contact,
        .footer-hours {
          text-align: left;
        }

        .site-footer h4 {
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: white;
          margin-bottom: 25px;
          font-weight: 700;
          position: relative;
          padding-bottom: 12px;
        }

        .site-footer h4::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: var(--street-orange);
          border-radius: 2px;
        }

        .contact-list,
        .hours-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .contact-item-row {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .contact-item-content {
          flex: 1;
          min-height: 52px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .icon-circle {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(255, 107, 0, 0.1);
          color: var(--street-orange);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(255, 107, 0, 0.3);
        }

        .contact-item-row label {
          display: block;
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #6b7280;
          letter-spacing: 1.2px;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .contact-link {
          font-weight: 600;
          color: #ffffff;
          font-size: 1rem;
          transition: var(--transition);
          display: inline-block;
        }

        .contact-link:hover {
          color: var(--street-orange);
          transform: translateX(3px);
        }

        .contact-text {
          color: #e5e7eb;
          font-weight: 500;
          font-size: 0.95rem;
          line-height: 1.6;
          display: block;
        }

        .hours-text {
          color: #e5e7eb;
          font-size: 0.95rem;
          margin-bottom: 10px;
          line-height: 1.6;
        }

        .hours-text strong {
          color: #9ca3af;
          font-weight: 600;
          display: inline-block;
          min-width: 100px;
        }

        /* Footer Bottom */
        .footer-bottom {
          margin-top: 50px;
          padding: 25px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          color: #6b7280;
          font-size: 0.9rem;
          background: rgba(0, 0, 0, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .footer-content-grid {
            grid-template-columns: 1.5fr 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .site-footer {
            padding: 50px 6% 0;
          }

          .footer-content-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-brand,
          .footer-contact,
          .footer-hours {
            text-align: center;
          }

          .footer-logo-wrapper {
            justify-content: center;
          }

          .footer-tagline {
            margin-left: auto;
            margin-right: auto;
          }

          .footer-socials {
            justify-content: center;
          }

          .site-footer h4::after {
            left: 50%;
            transform: translateX(-50%);
          }

          .contact-item-row {
            justify-content: center;
            text-align: left;
          }

          .hours-text strong {
            min-width: 90px;
          }
        }

        @media (max-width: 480px) {
          .footer-brand h3 {
            font-size: 2rem;
          }

          .footer-logo {
            width: 50px;
            height: 50px;
          }

          .social-icon {
            width: 40px;
            height: 40px;
          }

          .icon-circle {
            width: 38px;
            height: 38px;
          }

          .site-footer h4 {
            font-size: 1rem;
          }
        }
      `}</style>
    </footer>
  );
};

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

export default Footer;
