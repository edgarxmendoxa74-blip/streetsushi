import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, ShoppingBag, CheckCircle, CreditCard, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderItems, setPlacedOrderItems] = useState([]);
  const [isCopied, setIsCopied] = useState(false);

  // If cart is empty and not in success state, redirect back to menu
  React.useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      navigate('/');
    }
  }, [cart, orderSuccess, navigate]);

  const handleCopy = () => {
    const itemsText = placedOrderItems.map(item => `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const fullText = `🍣 Street Sushi Order\n------------------\nCustomer: ${customerDetails.name}\nPhone: ${customerDetails.phone || 'N/A'}\n\nItems:\n${itemsText}\n------------------\nTotal: $${cartTotal.toFixed(2)}\n\nThank you!`;
    
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerDetails.name) return;
    
    setIsSubmitting(true);
    // Capture cart items for the summary/copy before clearing
    setPlacedOrderItems([...cart]);

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
      // Redirect to Facebook after a short delay so they see the success message
      setTimeout(() => {
        window.open('https://www.facebook.com/profile.php?id=61564958380863&sk=about', '_blank');
      }, 1500);
    } catch (err) {
      alert('Error processing order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="checkout-page success">
        <motion.div 
          className="success-card glass"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order. We are preparing your fresh sushi now.</p>
          
          <div className="order-summary-copy">
            <div className="summary-header">
              <h3>Order Detail Summary</h3>
              <button className={`copy-details-btn ${isCopied ? 'copied' : ''}`} onClick={handleCopy}>
                {isCopied ? 'Copied!' : (
                  <>
                    <Copy size={16} /> Copy Details
                  </>
                )}
              </button>
            </div>
            <div className="summary-mini-list">
              {placedOrderItems.map(item => (
                <div key={item.id} className="mini-item">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="mini-total">
                <span>Total Amount:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="order-next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>Visit the <strong>Street Sushi</strong> counter.</li>
              <li>Give your name: <strong>{customerDetails.name}</strong></li>
              <li>Complete payment and enjoy your meal!</li>
            </ul>
          </div>
          <div className="success-actions">
            <button className="return-btn" onClick={() => navigate('/')}>
              Back to Home
            </button>
            <a 
              href="https://www.facebook.com/profile.php?id=61564958380863&sk=about" 
              target="_blank" 
              rel="noopener noreferrer"
              className="fb-follow-btn"
            >
              Visit Our Facebook
            </a>
          </div>
        </motion.div>
        
        <style jsx="true">{`
          .checkout-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-light);
            padding: 20px;
          }
          .success-card {
            max-width: 600px;
            width: 100%;
            padding: 60px;
            border-radius: 40px;
            text-align: center;
            background: white;
            box-shadow: var(--shadow-lg);
          }
          .success-icon {
            color: #10b981;
            margin-bottom: 30px;
          }
          .success-card h1 {
            font-family: var(--font-brush);
            font-size: 3.5rem;
            color: var(--street-black);
            margin-bottom: 20px;
          }
          .success-card p {
            color: var(--muted-gray);
            font-size: 1.1rem;
            margin-bottom: 40px;
          }
          .order-summary-copy {
            background: #f8fafc;
            padding: 30px;
            border-radius: 24px;
            margin-bottom: 30px;
            border: 1px solid #e2e8f0;
            text-align: left;
          }
          .summary-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .summary-header h3 {
            font-size: 1.1rem;
            color: var(--street-black);
          }
          .copy-details-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: white;
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--street-orange);
            border: 1px solid var(--street-orange);
            transition: var(--transition);
          }
          .copy-details-btn:hover {
            background: var(--street-orange);
            color: white;
          }
          .copy-details-btn.copied {
            background: #10b981;
            color: white;
            border-color: #10b981;
          }
          .summary-mini-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .mini-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.95rem;
            color: var(--muted-gray);
          }
          .mini-total {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-weight: 800;
            color: var(--street-black);
          }
          .order-next-steps {
            background: #f8fafc;
            padding: 30px;
            border-radius: 20px;
            text-align: left;
            margin-bottom: 40px;
          }
          .order-next-steps h3 {
            margin-bottom: 15px;
            font-size: 1.1rem;
            color: var(--street-black);
          }
          .order-next-steps ul {
            list-style: none;
            padding: 0;
          }
          .order-next-steps li {
            margin-bottom: 12px;
            color: var(--muted-gray);
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .order-next-steps li::before {
            content: '•';
            color: var(--street-orange);
            font-weight: bold;
          }
          .success-actions {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .return-btn {
            background: var(--street-orange);
            color: white;
            padding: 15px 40px;
            border-radius: 50px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: var(--transition);
          }
          .return-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(255, 107, 0, 0.2);
          }
          .fb-follow-btn {
            background: #1877f2;
            color: white;
            padding: 15px 40px;
            border-radius: 50px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: var(--transition);
            display: inline-block;
          }
          .fb-follow-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(24, 119, 242, 0.2);
            opacity: 0.9;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <button className="back-link" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Back to Menu
          </button>
          <h1>Complete Your <span>Order</span></h1>
        </header>

        <div className="checkout-grid">
          <div className="checkout-main">
            <motion.form 
              className="details-form glass"
              onSubmit={handleSubmit}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="form-section">
                <div className="section-title">
                  <span className="step">1</span>
                  <h3>Customer Details</h3>
                </div>
                <div className="form-info-alert">
                  <span className="badge">Walk-in Order Only</span>
                  <p>Visit our counter to pay and receive your fresh sushi.</p>
                </div>
                
                <div className="input-row">
                  <div className="input-group">
                    <label><User size={16} /> Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
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
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">
                  <span className="step">2</span>
                  <h3>Payment Method</h3>
                </div>
                <div className="payment-options">
                  <div className="payment-card active">
                    <CreditCard size={24} />
                    <div>
                      <label>Walk-in Only</label>
                      <span>Cash or Digital Pay at the counter</span>
                    </div>
                    <div className="check">✓</div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className={`submit-order-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting || !customerDetails.name}
              >
                {isSubmitting ? 'Processing Your Sushi...' : 'Confirm & Place Order'}
              </button>
            </motion.form>
          </div>

          <aside className="checkout-summary">
            <div className="summary-card glass">
              <h3>Order Summary</h3>
              <div className="summary-list">
                {cart.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="item-img">
                      <img src={item.image} alt={item.name} />
                      <span className="qty-badge">{item.quantity}</span>
                    </div>
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <span className="item-total">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="summary-footer">
                <div className="footer-row">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Total Amount</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx="true">{`
        .checkout-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 60px 5%;
        }
        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .checkout-header {
          margin-bottom: 50px;
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--muted-gray);
          font-weight: 600;
          margin-bottom: 20px;
          transition: var(--transition);
        }
        .back-link:hover { color: var(--street-orange); }
        .checkout-header h1 {
          font-family: var(--font-brush);
          font-size: 3.5rem;
          color: var(--street-black);
        }
        .checkout-header h1 span { color: var(--street-orange); }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
        }

        .details-form {
          background: white;
          padding: 50px;
          border-radius: 30px;
          box-shadow: var(--shadow-md);
        }

        .form-section {
          margin-bottom: 40px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .step {
          width: 32px;
          height: 32px;
          background: var(--street-orange);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .section-title h3 {
          font-size: 1.4rem;
          color: var(--street-black);
        }

        .form-info-alert {
          background: rgba(255, 107, 0, 0.05);
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 25px;
        }

        .badge {
          background: var(--street-orange);
          color: white;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .form-info-alert p {
          margin-top: 10px;
          font-size: 0.95rem;
          color: var(--street-black);
          font-weight: 500;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--muted-gray);
          text-transform: uppercase;
        }

        .input-group input {
          width: 100%;
          padding: 15px 20px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1rem;
          transition: var(--transition);
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--street-orange);
          background: white;
          box-shadow: 0 0 0 5px rgba(255, 107, 0, 0.1);
        }

        .payment-options {
          display: grid;
          gap: 15px;
        }

        .payment-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          border: 2px solid var(--street-orange);
          border-radius: 20px;
          background: rgba(255, 107, 0, 0.02);
          position: relative;
        }

        .payment-card label {
          display: block;
          font-weight: 700;
          color: var(--street-black);
        }

        .payment-card span {
          font-size: 0.85rem;
          color: var(--muted-gray);
        }

        .payment-card .check {
          position: absolute;
          right: 20px;
          width: 24px;
          height: 24px;
          background: var(--street-orange);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }

        .submit-order-btn {
          width: 100%;
          background: var(--street-orange);
          color: white;
          padding: 20px;
          border-radius: 18px;
          font-size: 1.1rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 20px;
          transition: var(--transition);
        }

        .submit-order-btn:hover:not(:disabled) {
          background: var(--street-black);
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }

        .submit-order-btn:disabled {
          opacity: 0.5;
          filter: grayscale(1);
        }

        /* Summary Sidebar */
        .summary-card {
          background: white;
          padding: 40px;
          border-radius: 30px;
          position: sticky;
          top: 120px;
          box-shadow: var(--shadow-md);
        }

        .summary-card h3 {
          font-size: 1.5rem;
          margin-bottom: 30px;
          color: var(--street-black);
          font-family: var(--font-brush);
        }

        .summary-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .item-img {
          position: relative;
          width: 70px;
          height: 70px;
        }

        .item-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
        }

        .qty-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--street-orange);
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          border: 2px solid white;
        }

        .item-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .item-info h4 {
          font-size: 1rem;
          color: var(--street-black);
          font-weight: 700;
        }

        .item-total { font-weight: 700; color: var(--muted-gray); }

        .summary-footer {
          border-top: 1px solid #f1f5f9;
          padding-top: 25px;
        }

        .footer-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: var(--muted-gray);
          font-weight: 600;
        }

        .free { color: #10b981; font-weight: 800; }

        .total-row {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--street-black);
        }

        .total-row span:last-child { color: var(--street-orange); }

        @media (max-width: 992px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .checkout-summary { order: -1; }
          .summary-card { position: static; }
        }

        @media (max-width: 768px) {
          .checkout-page {
            padding: 40px 4%;
          }
          .checkout-header h1 {
            font-size: 2.8rem;
          }
          .details-form {
            padding: 25px;
          }
          .input-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .checkout-header h1 {
            font-size: 2.2rem;
          }
          .section-title h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
