import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Hero = () => {
  const [settings, setSettings] = useState({
    title: 'Artistry in Every Bite',
    subtitle: 'Premium Japanese Cuisine',
    description: 'Experience the soul of Tokyo street sushi with the freshest cuts and master-crafted recipes.'
  });
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: settingsData } = await supabase.from('site_settings').select('hero_title, hero_subtitle, hero_description').single();
      if (settingsData) {
        setSettings({
          title: settingsData.hero_title,
          subtitle: settingsData.hero_subtitle,
          description: settingsData.hero_description || 'Experience the soul of Tokyo street sushi with the freshest cuts and master-crafted recipes.'
        });
      }

      const { data: slidesData } = await supabase.from('hero_slides').select('image_url').order('order_index', { ascending: true }).limit(4);
      if (slidesData && slidesData.length > 0) {
        setSlides(slidesData.map(s => s.image_url));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  return (
    <>
      <section id="hero" className="hero-split">
      {/* Left Side: Slideshow */}
      <div className="hero-left">
        {slides.length > 0 ? (
          <div
            key={currentSlide}
            className="slide-image"
            style={{ backgroundImage: `url(${slides[currentSlide]})` }}
          />
        ) : (
          <div className="slide-placeholder" />
        )}
        <div className="hero-overlay-gradient"></div>
      </div>

      {/* Right Side: Branding */}
      <div className="hero-right">
        <div className="hero-text-content">
          <span className="subtitle-brand">{settings.subtitle}</span>
          <h1 className="hero-title">{settings.title}</h1>
          <div className="hero-divider"></div>
          <p className="hero-desc">{settings.description}</p>
        </div>
      </div>

      <style jsx="true">{`
        .hero-split {
          display: flex;
          height: 100vh;
          width: 100%;
          background: var(--bg-light);
          overflow: hidden;
        }

        .hero-left {
          position: relative;
          width: 60%;
          height: 100%;
        }

        .slide-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
        }

        .hero-overlay-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent 60%, var(--bg-light) 100%);
          z-index: 2;
        }

        .hero-right {
          width: 40%;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 5%;
          z-index: 3;
          background: var(--bg-light);
          position: relative;
        }

        .hero-right::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.5;
          background-image: radial-gradient(circle at 100% 150%, var(--bg-light) 24%, var(--wave-color) 25%, var(--wave-color) 28%, var(--bg-light) 29%, var(--bg-light) 36%, var(--wave-color) 36%, var(--wave-color) 40%, transparent 40%),
            radial-gradient(circle at 0 150%, var(--bg-light) 24%, var(--wave-color) 25%, var(--wave-color) 28%, var(--bg-light) 29%, var(--bg-light) 36%, var(--wave-color) 36%, var(--wave-color) 40%, transparent 40%);
          background-size: 60px 30px;
          z-index: -1;
        }

        .hero-text-content {
          max-width: 500px;
        }

        .subtitle-brand {
          color: var(--street-orange);
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 5px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          display: block;
        }

        .hero-title {
          font-size: 4.5rem;
          line-height: 1.1;
          margin-bottom: 30px;
          font-family: var(--font-brush);
          color: var(--street-black);
          text-transform: none;
          letter-spacing: 0;
        }

        .hero-divider {
          width: 60px;
          height: 4px;
          background: var(--street-orange);
          margin-bottom: 35px;
        }

        .hero-desc {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--muted-gray);
          margin-bottom: 45px;
        }

        @media (max-width: 1024px) {
          .hero-split {
            flex-direction: column;
          }
          .hero-left {
            width: 100%;
            height: 50%;
          }
          .hero-right {
            width: 100%;
            height: 50%;
            padding: 40px;
            justify-content: center;
            text-align: center;
          }
          .hero-text-content {
             display: flex;
             flex-direction: column;
             align-items: center;
          }
          .hero-title {
            font-size: 3.5rem;
          }
          .hero-overlay-gradient {
            background: linear-gradient(0deg, var(--bg-light) 0%, transparent 40%);
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2.8rem;
          }
          .hero-desc {
            font-size: 1rem;
          }
          .subtitle-brand {
            letter-spacing: 3px;
            font-size: 0.75rem;
          }
        }

        /* How to Order Section Styles */
        .how-to-order {
          padding: 80px 10%;
          background: white;
          position: relative;
          z-index: 5;
          border-top: 1px solid rgba(0,0,0,0.05);
        }

        .how-container {
          max-width: 1400px;
          margin: 0 auto;
          text-align: center;
        }

        .how-subtitle {
          color: var(--street-orange);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 0.85rem;
          display: block;
          margin-bottom: 10px;
        }

        .how-title {
          font-size: 3rem;
          font-family: var(--font-brush);
          color: var(--street-black);
          margin-bottom: 50px;
        }

        .how-title span {
          color: var(--street-orange);
        }

        .how-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        .how-card {
          background: #f8fafc;
          padding: 40px 30px;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          text-align: left;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .how-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
          border-color: rgba(255, 107, 0, 0.15);
          background: white;
        }

        .how-step-num {
          font-size: 3.5rem;
          font-weight: 900;
          font-family: var(--font-main);
          line-height: 1;
          margin-bottom: 20px;
          transition: var(--transition);
          opacity: 0.75;
        }

        .how-card:nth-child(1) .how-step-num {
          color: #ef4444; /* Vibrant Red */
        }
        .how-card:nth-child(2) .how-step-num {
          color: #ff6b00; /* Street Orange */
        }
        .how-card:nth-child(3) .how-step-num {
          color: #eab308; /* Amber Gold */
        }
        .how-card:nth-child(4) .how-step-num {
          color: #10b981; /* Emerald Green */
        }

        .how-card:hover .how-step-num {
          opacity: 1;
          transform: scale(1.1);
        }

        .how-card:nth-child(1):hover .how-step-num {
          text-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }
        .how-card:nth-child(2):hover .how-step-num {
          text-shadow: 0 0 15px rgba(255, 107, 0, 0.4);
        }
        .how-card:nth-child(3):hover .how-step-num {
          text-shadow: 0 0 15px rgba(234, 179, 8, 0.4);
        }
        .how-card:nth-child(4):hover .how-step-num {
          text-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
        }

        .how-card h3 {
          font-size: 1.25rem;
          color: var(--street-black);
          margin-bottom: 12px;
          font-weight: 700;
        }

        .how-card p {
          color: var(--muted-gray);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        @media (max-width: 1024px) {
          .how-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .how-grid {
            grid-template-columns: 1fr;
          }
          .how-to-order {
            padding: 60px 5%;
          }
          .how-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </section>

    <section className="how-to-order">
      <div className="how-container">
        <span className="how-subtitle">Simple & Easy</span>
        <h2 className="how-title">How to <span>Order</span></h2>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-step-num">01</div>
            <h3>Browse Menu</h3>
            <p>Choose your favorite sushi from our menu.</p>
          </div>
          <div className="how-card">
            <div className="how-step-num">02</div>
            <h3>Add to Cart</h3>
            <p>Click "Add to Cart" and review your order.</p>
          </div>
          <div className="how-card">
            <div className="how-step-num">03</div>
            <h3>Submit Order</h3>
            <p>Click "Submit Order" to generate your receipt.</p>
          </div>
          <div className="how-card">
            <div className="how-step-num">04</div>
            <h3>Show & Pay</h3>
            <p>Present receipt at counter, pay, and enjoy!</p>
          </div>
        </div>
      </div>
    </section>
  </>
  );
};

export default Hero;
