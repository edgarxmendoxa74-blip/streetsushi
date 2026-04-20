import React from 'react';
import { Menu as MenuIcon, ShoppingBag, MapPin } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <div className="logo">
          STREET<span>SUSHI</span>
        </div>
        
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#menu">Menu</a></li>
          <li><a href="#about">About</a></li>
        </ul>

        <div className="nav-actions">
          <button className="icon-btn"><MapPin size={20} /></button>
          <button className="order-btn">Order Now</button>
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

        .logo {
          font-family: 'Anton', sans-serif;
          font-size: 1.8rem;
          letter-spacing: 2px;
        }

        .logo span {
          color: var(--neon-red);
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

        @media (max-width: 768px) {
          .navbar {
            height: 65px;
          }
          .nav-links {
            display: none;
          }
          .logo {
            font-size: 1.3rem;
            letter-spacing: 1px;
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

export default Navbar;
