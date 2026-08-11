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
            <p className="footer-tagline">Experience Gastronomy by the Street</p>
            <div className="footer-socials">
              <a href="https://www.facebook.com/streetsushi09" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <FacebookIcon />
              </a>
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
                  <p className="hours-text"><strong>Daily:</strong> 6:00 PM - 11:00 PM</p>
                  <p className="hours-note">Check our Facebook page for updates</p>
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
          grid-template-columns: 1.5fr 1.2fr 1.2fr;
          gap: 60px;
          width: 100%;
          align-items: start;
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
          color: #d1d5db;
          font-size: 1rem;
          line-height: 1.8;
          margin: 25px 0 35px;
          max-width: 400px;
          font-weight: 400;
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
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--street-orange);
          letter-spacing: 1.5px;
          margin-bottom: 6px;
          font-weight: 700;
        }

        .contact-link {
          font-weight: 700;
          color: #ffffff;
          font-size: 1.05rem;
          transition: var(--transition);
          display: inline-block;
          letter-spacing: 0.3px;
        }

        .contact-link:hover {
          color: var(--street-orange);
          transform: translateX(3px);
        }

        .contact-text {
          color: #ffffff;
          font-weight: 500;
          font-size: 1rem;
          line-height: 1.6;
          display: block;
        }

        .hours-text {
          color: #ffffff;
          font-size: 1rem;
          margin-bottom: 10px;
          line-height: 1.6;
          font-weight: 500;
        }

        .hours-text strong {
          color: var(--street-orange);
          font-weight: 700;
          display: inline-block;
          min-width: 60px;
          margin-right: 8px;
        }

        .hours-note {
          font-size: 0.85rem;
          color: #9ca3af;
          margin-top: 10px;
          font-style: italic;
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
