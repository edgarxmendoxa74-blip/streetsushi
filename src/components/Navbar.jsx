import { Menu as MenuIcon, ShoppingBag, MapPin, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [logo, setLogo] = useState('/logo.png');
  const [contactInfo, setContactInfo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('site_settings').select('*').single();
      if (data) {
        if (data.logo_url) setLogo(data.logo_url);
        setContactInfo(data);
      }
    };
    fetchData();
  }, []);

  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <div className="logo">
          <img src={logo} alt="Street Sushi Logo" className="logo-img" />
        </div>
        
        <div className="nav-actions">
          <div className="contact-wrapper">
            <button 
              className={`order-btn ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Contact
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="contact-dropdown glass"
                >
                  <div className="dropdown-header">Visit Us & Connect</div>
                  
                  <div className="social-links-grid">
                    {contactInfo?.fb_url && (
                      <a href={contactInfo.fb_url} target="_blank" rel="noopener noreferrer" className="social-item">
                        <FacebookIcon size={18} />
                        <span>Facebook</span>
                      </a>
                    )}
                    {contactInfo?.ig_url && (
                      <a href={contactInfo.ig_url} target="_blank" rel="noopener noreferrer" className="social-item">
                        <InstagramIcon size={18} />
                        <span>Instagram</span>
                      </a>
                    )}
                    {contactInfo?.tiktok_url && (
                      <a href={contactInfo.tiktok_url} target="_blank" rel="noopener noreferrer" className="social-item">
                        <TikTokIcon size={18} />
                        <span>TikTok</span>
                      </a>
                    )}
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="contact-details">
                    {contactInfo?.contact_number && (
                      <a href={`tel:${contactInfo.contact_number}`} className="detail-item">
                        <Phone size={16} />
                        <div>
                          <label>Call Us</label>
                          <span>{contactInfo.contact_number}</span>
                        </div>
                      </a>
                    )}
                    {contactInfo?.location && (
                      <div className="detail-item">
                        <MapPin size={16} />
                        <div>
                          <label>Location</label>
                          <span>{contactInfo.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 80px;
          display: flex;
          align-items: center;
          z-index: 1000;
          padding: 0 5%;
        }

        .nav-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-img {
          height: 45px;
          width: auto;
          display: block;
        }

        .nav-links {
          display: flex;
          gap: 40px;
        }

        .nav-links a {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 1px;
          color: var(--muted-gray);
          transition: var(--transition);
        }

        .nav-links a:hover {
          color: var(--ghost-white);
          text-shadow: 0 0 10px var(--accent-red-glow);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .icon-btn {
          color: var(--ghost-white);
          transition: var(--transition);
        }

        .icon-btn:hover {
          color: var(--neon-red);
        }

        .order-btn {
          background: var(--neon-red);
          color: white;
          padding: 10px 24px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 1px;
          transition: var(--transition);
          box-shadow: 0 0 15px var(--accent-red-glow);
        }

        .order-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 25px var(--neon-red);
        }

        .order-btn.active {
          background: white;
          color: black;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        }

        /* Contact Dropdown */
        .contact-wrapper {
          position: relative;
        }

        .contact-dropdown {
          position: absolute;
          top: calc(100% + 15px);
          right: 0;
          width: 280px;
          padding: 20px;
          border-radius: 12px;
          z-index: 1100;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .dropdown-header {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          color: var(--neon-red);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }

        .social-links-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .social-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 15px;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          color: var(--muted-gray);
          font-weight: 600;
          font-size: 0.85rem;
          transition: var(--transition);
          border: 1px solid transparent;
        }

        .social-item:hover {
          background: rgba(255, 49, 49, 0.1);
          color: white;
          border-color: rgba(255, 49, 49, 0.2);
          transform: translateX(5px);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--glass-border);
          margin: 20px 0;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: var(--muted-gray);
        }

        .detail-item label {
          display: block;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--neon-red);
          margin-bottom: 2px;
          font-weight: 700;
        }

        .detail-item span {
          font-size: 0.85rem;
          color: white;
          font-weight: 500;
          line-height: 1.4;
        }

        a.detail-item:hover span {
          color: var(--neon-red);
        }

        @media (max-width: 768px) {
          .navbar {
            height: 65px;
          }
          .nav-links {
            display: none;
          }
          .logo-img {
            height: 35px;
          }
          .order-btn {
            padding: 8px 16px;
            font-size: 0.7rem;
          }
          .nav-actions {
            gap: 12px;
          }
        }
      `}</style>
    </nav>
  );
};

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

export default Navbar;
