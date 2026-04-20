import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Instagram = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const Facebook = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Twitter = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="logo-footer">
            STREET<span>SUSHI</span>
          </div>
          <p>The authentic taste of Tokyo streets in the heart of the city.</p>
          <div className="social-links">
            <a href="#"><Instagram size={20} /></a>
            <a href="#"><Facebook size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#menu">Menu</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="contact-list">
              <li><Phone size={16} /> +1 (555) 123-4567</li>
              <li><Mail size={16} /> hello@streetsushi.com</li>
              <li><MapPin size={16} /> 123 Neon Way, Shibuya District</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Opening Hours</h4>
            <ul className="hours-list">
              <li><span>Mon - Thu:</span> 11:00 AM - 10:00 PM</li>
              <li><span>Fri - Sat:</span> 11:00 AM - 12:00 AM</li>
              <li><span>Sunday:</span> 12:00 PM - 9:00 PM</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 Street Sushi. All Rights Reserved.</p>
      </div>

      <style jsx="true">{`
        .footer {
          background: #050505;
          padding: 80px 10% 30px;
          border-top: 1px solid var(--glass-border);
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 80px;
          margin-bottom: 60px;
        }

        .logo-footer {
          font-family: 'Anton', sans-serif;
          font-size: 2rem;
          letter-spacing: 2px;
          margin-bottom: 20px;
        }

        .logo-footer span {
          color: var(--neon-red);
        }

        .footer-brand p {
          color: var(--muted-gray);
          max-width: 300px;
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .social-links {
          display: flex;
          gap: 15px;
        }

        .social-links a {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          color: var(--muted-gray);
        }

        .social-links a:hover {
          background: var(--neon-red);
          color: white;
          transform: translateY(-3px);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .footer-col h4 {
          margin-bottom: 25px;
          font-size: 1.1rem;
          color: white;
        }

        .footer-col ul li {
          margin-bottom: 15px;
        }

        .footer-col ul li a {
          color: var(--muted-gray);
          transition: var(--transition);
          font-size: 0.95rem;
        }

        .footer-col ul li a:hover {
          color: var(--neon-red);
          padding-left: 5px;
        }

        .contact-list li, .hours-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--muted-gray);
          font-size: 0.95rem;
        }

        .hours-list li {
          justify-content: space-between;
        }

        .hours-list li span {
          font-weight: 700;
          color: #555;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #111;
        }

        .footer-bottom p {
          color: #444;
          font-size: 0.85rem;
        }

        @media (max-width: 1000px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 50px;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
