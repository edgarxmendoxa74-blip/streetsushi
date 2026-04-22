import { Menu as MenuIcon, ShoppingBag, MapPin, Phone, MessageCircle, ExternalLink, X, Plus, Minus, Trash2, ArrowRight, User, Hash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [logo, setLogo] = useState('/logo.png');
  const [contactInfo, setContactInfo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, toggleCart, clearCart } = useCart();

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

            {isDropdownOpen && (
              <div className="contact-dropdown glass">
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
              </div>
            )}
          </div>

          <div className="cart-wrapper">
            <button 
              className={`icon-btn cart-btn ${isCartOpen ? 'active' : ''}`}
              onClick={toggleCart}
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            <AnimatePresence>
              {isCartOpen && (
                <>
                  <motion.div 
                    className="cart-overlay-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsCartOpen(false)}
                  />
                  <motion.div 
                    className="cart-sidebar glass"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  >
                    <div className="sidebar-header">
                      <h3>{isCheckoutMode ? 'Checkout' : 'Your Bag'}</h3>
                      <button className="close-btn" onClick={() => {
                        setIsCartOpen(false);
                        setTimeout(() => setIsCheckoutMode(false), 300);
                      }}>
                        <X size={24} />
                      </button>
                    </div>

                    <div className="sidebar-content">
                      {orderSuccess ? (
                        <motion.div 
                          className="success-message"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          <div className="success-icon">✓</div>
                          <h2>Order Received!</h2>
                          <p>We're starting to prepare your sushi. See you at the counter!</p>
                          <button className="done-btn" onClick={() => {
                            setOrderSuccess(false);
                            setIsCartOpen(false);
                            setIsCheckoutMode(false);
                          }}>
                            Back to Menu
                          </button>
                        </motion.div>
                      ) : isCheckoutMode ? (
                        <div className="checkout-form">
                          <div className="form-info">
                            <span className="badge">Walk-in Order Only</span>
                            <p>Fill out your details for pickup at the counter.</p>
                          </div>
                          
                          <div className="input-group">
                            <label><User size={16} /> Your Name</label>
                            <input 
                              type="text" 
                              placeholder="Enter your full name" 
                              value={customerDetails.name}
                              onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})}
                              required
                            />
                          </div>

                          <div className="input-group">
                            <label><Phone size={16} /> Phone Number (Optional)</label>
                            <input 
                              type="tel" 
                              placeholder="09XX XXX XXXX" 
                              value={customerDetails.phone}
                              onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})}
                            />
                          </div>

                          <div className="order-summary-box">
                            <h4>Order Summary</h4>
                            <div className="summary-items">
                              {cart.map(item => (
                                <div key={item.id} className="summary-line">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="summary-total">
                              <span>Total Amount</span>
                              <span>${cartTotal.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="checkout-actions">
                            <button className="back-btn-text" onClick={() => setIsCheckoutMode(false)}>
                              Edit Bag
                            </button>
                            <button 
                              className={`place-order-btn ${isSubmitting ? 'loading' : ''}`}
                              disabled={isSubmitting || !customerDetails.name}
                              onClick={async () => {
                                if (!customerDetails.name) return;
                                setIsSubmitting(true);
                                try {
                                  // 1. Insert order
                                  const { data: order, error: orderError } = await supabase
                                    .from('orders')
                                    .insert([{
                                      customer_name: customerDetails.name,
                                      customer_phone: customerDetails.phone,
                                      total_price: cartTotal,
                                      order_type: 'walk-in'
                                    }])
                                    .select()
                                    .single();
                                  
                                  if (orderError) throw orderError;

                                  // 2. Insert order items
                                  const orderItems = cart.map(item => ({
                                    order_id: order.id,
                                    menu_item_id: item.id,
                                    quantity: item.quantity,
                                    price_at_time: item.price,
                                    item_name: item.name
                                  }));

                                  const { error: itemsError } = await supabase
                                    .from('order_items')
                                    .insert(orderItems);
                                  
                                  if (itemsError) throw itemsError;

                                  setOrderSuccess(true);
                                  clearCart();
                                  setCustomerDetails({ name: '', phone: '' });
                                } catch (err) {
                                  alert('Error processing order: ' + err.message);
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                            >
                              {isSubmitting ? 'Processing...' : 'Confirm Order'}
                            </button>
                          </div>
                        </div>
                      ) : cart.length === 0 ? (
                        <div className="empty-cart">
                          <ShoppingBag size={64} />
                          <p>Your bag is empty</p>
                          <button className="start-btn" onClick={() => setIsCartOpen(false)}>Start Ordering</button>
                        </div>
                      ) : (
                        <>
                          <div className="cart-items">
                            {cart.map(item => (
                              <div key={item.id} className="cart-item">
                                <img src={item.image} alt={item.name} />
                                <div className="item-details">
                                  <h4>{item.name}</h4>
                                  <div className="item-meta">
                                    <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                    <div className="quantity-controls">
                                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                        <Minus size={14} />
                                      </button>
                                      <span>{item.quantity}</span>
                                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <button className="remove-item" onClick={() => removeFromCart(item.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="sidebar-footer">
                            <div className="cart-summary">
                              <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                              </div>
                              <div className="summary-row total">
                                <span>Estimated Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                              </div>
                            </div>
                            <button className="checkout-btn" onClick={() => setIsCheckoutMode(true)}>
                              Proceed to Checkout <ArrowRight size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                </>
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
          height: 60px;
          width: 60px;
          object-fit: cover;
          border-radius: 50%;
          display: block;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
          border: 2px solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
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
          color: var(--street-orange);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .icon-btn {
          color: var(--street-black);
        }

        .icon-btn:hover {
          color: var(--street-orange);
        }

        .order-btn {
          background: var(--street-orange);
          color: white;
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(255, 107, 0, 0.2);
          transition: var(--transition);
        }

        .order-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 0, 0.3);
        }

        .order-btn.active {
          background: var(--street-black);
          color: white;
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
          border-radius: 16px;
          z-index: 1100;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--glass-border);
        }

        .dropdown-header {
          font-family: var(--font-main);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--street-orange);
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
          background: rgba(0,0,0,0.02);
          border-radius: 8px;
          color: var(--muted-gray);
          font-weight: 600;
          font-size: 0.85rem;
          transition: var(--transition);
          border: 1px solid transparent;
        }

        .social-item:hover {
          background: rgba(255, 107, 0, 0.05);
          color: var(--street-orange);
          border-color: rgba(255, 107, 0, 0.1);
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
          color: var(--street-orange);
          margin-bottom: 2px;
          font-weight: 700;
        }

        .detail-item span {
          font-size: 0.85rem;
          color: var(--street-black);
          font-weight: 500;
          line-height: 1.4;
        }

        a.detail-item:hover span {
          color: var(--street-orange);
        }

        /* Cart Styles */
        .cart-wrapper {
          position: relative;
        }

        .cart-btn {
          position: relative;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          color: var(--street-black);
        }

        .cart-btn:hover {
          background: rgba(255, 107, 0, 0.1);
          color: var(--street-orange);
        }

        .cart-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--street-orange);
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .cart-overlay-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          z-index: 1050;
        }

        .cart-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 450px;
          height: 100vh;
          background: white;
          z-index: 1100;
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 30px rgba(0,0,0,0.1);
          border-left: 1px solid var(--glass-border);
        }

        .sidebar-header {
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
        }

        .sidebar-header h3 {
          font-size: 1.5rem;
          color: var(--street-black);
          font-family: var(--font-brush);
          letter-spacing: 1px;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--muted-gray);
          cursor: pointer;
          transition: var(--transition);
        }

        .close-btn:hover {
          color: var(--street-orange);
          transform: rotate(90deg);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          padding: 0;
        }

        .cart-items {
          padding: 20px 30px;
        }

        .cart-item {
          display: flex;
          gap: 20px;
          padding: 20px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .cart-item img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 12px;
        }

        .item-details { flex: 1; }

        .item-details h4 {
          font-size: 1.1rem;
          margin-bottom: 8px;
          color: var(--street-black);
          font-weight: 700;
        }

        .item-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .item-price {
          font-weight: 800;
          color: var(--street-orange);
          font-size: 1.1rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 6px 12px;
          border-radius: 50px;
          border: 1px solid #e2e8f0;
        }

        .quantity-controls button {
          background: transparent;
          border: none;
          color: var(--muted-gray);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .quantity-controls button:hover { color: var(--street-orange); }

        .quantity-controls span {
          font-weight: 800;
          font-size: 0.9rem;
          min-width: 20px;
          text-align: center;
        }

        .remove-item {
          background: transparent;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          transition: var(--transition);
        }

        .remove-item:hover { color: #f43f5e; }

        .sidebar-footer {
          padding: 30px;
          background: white;
          border-top: 1px solid var(--glass-border);
          box-shadow: 0 -10px 20px rgba(0,0,0,0.02);
        }

        .cart-summary { margin-bottom: 25px; }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: var(--muted-gray);
          font-weight: 500;
        }

        .summary-row.total {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px dashed var(--glass-border);
          color: var(--street-black);
          font-weight: 800;
          font-size: 1.3rem;
        }

        .summary-row.total span:last-child { color: var(--street-orange); }

        .checkout-btn {
          width: 100%;
          background: var(--street-orange);
          color: white;
          padding: 18px;
          border-radius: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: var(--transition);
          box-shadow: 0 10px 20px rgba(255, 107, 0, 0.2);
        }

        .checkout-btn:hover {
          background: var(--street-black);
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }

        /* Checkout Form */
        .checkout-form {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .form-info {
          background: rgba(255, 107, 0, 0.05);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255, 107, 0, 0.1);
        }

        .badge {
          display: inline-block;
          background: var(--street-orange);
          color: white;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .form-info p {
          color: var(--street-black);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .checkout-form .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkout-form label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--muted-gray);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .checkout-form input {
          width: 100%;
          padding: 15px 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: var(--transition);
        }

        .checkout-form input:focus {
          outline: none;
          border-color: var(--street-orange);
          background: white;
          box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.1);
        }

        .order-summary-box {
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .order-summary-box h4 {
          margin-bottom: 15px;
          font-size: 0.9rem;
          text-transform: uppercase;
          color: var(--street-black);
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
          max-height: 120px;
          overflow-y: auto;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--muted-gray);
        }

        .summary-total {
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-weight: 800;
          color: var(--street-orange);
        }

        .checkout-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 10px;
        }

        .back-btn-text {
          background: transparent;
          border: none;
          color: var(--muted-gray);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .back-btn-text:hover { color: var(--street-orange); }

        .place-order-btn {
          flex: 1;
          background: var(--street-orange);
          color: white;
          padding: 18px;
          border-radius: 16px;
          font-weight: 800;
          text-transform: uppercase;
          transition: var(--transition);
        }

        .place-order-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }

        .place-order-btn:not(:disabled):hover {
          background: #10b981;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
        }

        /* Success Message */
        .success-message {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          margin-bottom: 30px;
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
        }

        .success-message h2 {
          font-family: var(--font-brush);
          font-size: 2.5rem;
          color: var(--street-black);
          margin-bottom: 15px;
        }

        .success-message p {
          color: var(--muted-gray);
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .done-btn {
          background: var(--street-orange);
          color: white;
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .empty-cart {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #cbd5e1;
        }

        .empty-cart p {
          margin: 20px 0 30px;
          font-weight: 600;
          color: var(--muted-gray);
        }

        .start-btn {
          background: var(--street-orange);
          color: white;
          padding: 12px 30px;
          border-radius: 50px;
          font-weight: 700;
          text-transform: uppercase;
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
