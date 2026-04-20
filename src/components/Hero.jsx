import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-text"
        >
          <span className="subtitle">Premium Japanese Cuisine</span>
          <h1>Artistry in <br /><span>Every Bite</span></h1>
          <p>Experience the soul of Tokyo street sushi with the freshest cuts and master-crafted recipes, delivered with urban elegance.</p>
          <div className="hero-btns">
            <a href="#menu" className="primary-btn">Explore Menu</a>
            <button className="secondary-btn">Watch Process</button>
          </div>
        </motion.div>
      </div>

      <style jsx="true">{`
        .hero {
          position: relative;
          height: 100vh;
          width: 100%;
          background-image: url('/assets/hero.png');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          padding: 0 10%;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.4) 50%, rgba(10, 10, 10, 0.8) 100%);
        }

        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 700px;
        }

        .subtitle {
          color: var(--neon-red);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 4px;
          font-size: 0.9rem;
          margin-bottom: 20px;
          display: block;
        }

        h1 {
          font-size: 5rem;
          line-height: 1.1;
          margin-bottom: 30px;
        }

        h1 span {
          color: transparent;
          -webkit-text-stroke: 1px var(--ghost-white);
        }

        p {
          font-size: 1.1rem;
          color: var(--muted-gray);
          line-height: 1.8;
          margin-bottom: 40px;
          max-width: 500px;
        }

        .hero-btns {
          display: flex;
          gap: 20px;
        }

        .primary-btn {
          background: var(--neon-red);
          color: white;
          padding: 16px 36px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: var(--transition);
        }

        .primary-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(255, 49, 49, 0.4);
        }

        .secondary-btn {
          border: 1px solid var(--ghost-white);
          color: var(--ghost-white);
          padding: 16px 36px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: var(--transition);
        }

        .secondary-btn:hover {
          background: var(--ghost-white);
          color: var(--bg-dark);
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 3.5rem;
          }
          .hero {
            padding: 0 5%;
            text-align: center;
            justify-content: center;
          }
          .hero-btns {
            justify-content: center;
          }
          p {
            margin: 0 auto 40px;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
