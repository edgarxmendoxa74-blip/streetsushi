import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Hero = () => {
  const [settings, setSettings] = useState({
    title: 'Artistry in Every Bite',
    subtitle: 'Premium Japanese Cuisine'
  });
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: settingsData } = await supabase.from('site_settings').select('hero_title, hero_subtitle').single();
      if (settingsData) {
        setSettings({
          title: settingsData.hero_title,
          subtitle: settingsData.hero_subtitle
        });
      }

      const { data: slidesData } = await supabase.from('hero_slides').select('image_url').order('order_index', { ascending: true });
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
          <p className="hero-desc">Experience the soul of Tokyo street sushi with the freshest cuts and master-crafted recipes.</p>
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
      `}</style>
    </section>
  );
};

export default Hero;
