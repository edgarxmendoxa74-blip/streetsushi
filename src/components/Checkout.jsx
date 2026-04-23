import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, ShoppingBag, CheckCircle, CreditCard, Copy, Download } from 'lucide-react';
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

  const handleDownloadReceipt = (name, phone, items, total) => {
    const itemsText = items.map(item => `${item.quantity}x ${item.name} - ₱${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const content = `🍣 STREET SUSHI RECEIPT\n` +
                    `--------------------------\n` +
                    `Date: ${new Date().toLocaleString()}\n` +
                    `Customer: ${name}\n` +
                    `Phone: ${phone || 'N/A'}\n\n` +
                    `Order Items:\n${itemsText}\n` +
                    `--------------------------\n` +
                    `TOTAL AMOUNT: ₱${total.toFixed(2)}\n\n` +
                    `Please show this to the counter.\n` +
                    `Thank you for your order!`;

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `street-sushi-reciept-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = (e) => {
    if (e) e.preventDefault();
    if (!customerDetails.name) return; // Prevent copying if name is empty
    
    const items = orderSuccess ? placedOrderItems : cart;
    const itemsText = items.map(item => `${item.quantity}x ${item.name} - ₱${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const name = orderSuccess ? customerDetails.name : (customerDetails.name || 'Guest');
    const phone = customerDetails.phone || 'N/A';
    
    const fullText = `🍣 Street Sushi Order\n------------------\nCustomer: ${name}\nPhone: ${phone}\n\nItems:\n${itemsText}\n------------------\nTotal: ₱${cartTotal.toFixed(2)}\n\nThank you!`;
    
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
      handleDownloadReceipt(customerDetails.name, customerDetails.phone, [...cart], cartTotal);
      clearCart();
    } catch (err) {
      alert('Error processing order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <button className="back-link" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Back to Menu
          </button>
          <h1>Complete Your <span>Order</span></h1>
        </header>

        {orderSuccess ? (
          <motion.div 
            className="order-success-view glass"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="success-icon-wrapper">
              <CheckCircle size={80} color="#10b981" />
            </div>
            <h2>Order <span>Confirmed!</span></h2>
            <p>Your receipt has been downloaded successfully. Please show it to the nearest Street Sushi Resto to complete your payment and collect your perfect sushi!</p>
            
            <div className="success-actions">
              <button className="back-home-btn" onClick={() => navigate('/')}>
                Return to Menu
              </button>
            </div>
          </motion.div>
        ) : (
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
                    <div className="payment-card-content">
                      <CreditCard size={24} />
                      <div>
                        <label>Walk-in Only</label>
                        <span>Cash or Digital Pay at the counter</span>
                      </div>
                      <div className="check">✓</div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className={`submit-order-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting || !customerDetails.name}
              >
                {isSubmitting ? 'Processing Your Sushi...' : 'Download Order'}
              </button>
            </motion.form>
          </div>

          <aside className="checkout-summary">
            <div className="summary-card glass">
              <div className="summary-card-header">
                <h3>Order Summary</h3>
              </div>
              <div className="summary-list">
                {cart.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="item-img">
                      <img src={item.image} alt={item.name} />
                      <span className="qty-badge">{item.quantity}</span>
                    </div>
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <span className="item-total">₱{(item.price * item.quantity).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="summary-footer">
                <div className="footer-row">
                  <span>Subtotal</span>
                  <span>₱{cartTotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Total Amount</span>
                  <span>₱{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
        )}
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
          padding: 20px;
          border: 2px solid var(--street-orange);
          border-radius: 24px;
          background: rgba(255, 107, 0, 0.02);
          display: flex;
          flex-direction: column;
          gap: 15px;
          position: relative;
        }
        .payment-card-content {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
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
          top: 30px;
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
        .copy-walkin-btn {
          width: 100%;
          background: white;
          color: var(--street-orange);
          border: 1px solid var(--street-orange);
          padding: 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: var(--transition);
        }
        .copy-walkin-btn:hover {
          background: var(--street-orange);
          color: white;
        }
        .copy-walkin-btn.copied {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .order-copy-preview {
          margin-top: 30px;
          padding: 30px;
          border-radius: 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .preview-header h4 {
          font-size: 1rem;
          color: var(--street-black);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .preview-hint {
          font-size: 0.75rem;
          color: var(--muted-gray);
          font-style: italic;
        }
        .preview-box {
          background: white;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }
        .preview-box pre {
          white-space: pre-wrap;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9rem;
          color: #334155;
          line-height: 1.5;
        }
        .main-copy-btn {
          width: 100%;
          background: var(--street-black);
          color: white;
          padding: 15px;
          border-radius: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: var(--transition);
        }
        .main-copy-btn:hover {
          background: var(--street-orange);
          transform: translateY(-2px);
        }
        .main-copy-btn.copied {
          background: #10b981;
        }
        .main-copy-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none !important;
          opacity: 0.7;
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

        /* Success View */
        .order-success-view {
          background: white;
          padding: 60px;
          border-radius: 40px;
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
          box-shadow: var(--shadow-lg);
        }
        .success-icon-wrapper {
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
        }
        .order-success-view h2 {
          font-family: var(--font-brush);
          font-size: 3rem;
          color: var(--street-black);
          margin-bottom: 20px;
        }
        .order-success-view h2 span { color: #10b981; }
        .order-success-view p {
          font-size: 1.1rem;
          color: var(--muted-gray);
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-width: 400px;
          margin: 0 auto;
        }
        .download-btn-big {
          background: #10b981;
          color: white;
          padding: 18px;
          border-radius: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: var(--transition);
          text-transform: uppercase;
        }
        .download-btn-big:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
        }
        .back-home-btn {
          padding: 15px;
          color: var(--muted-gray);
          font-weight: 600;
          transition: var(--transition);
        }
        .back-home-btn:hover { color: var(--street-orange); }

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

        .summary-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .copy-summary-btn {
          background: #f1f5f9;
          color: var(--muted-gray);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          font-size: 0.7rem;
          font-weight: 700;
        }
        .copy-summary-btn:hover {
          background: var(--street-orange);
          color: white;
        }
        .copy-summary-btn.copied {
          width: auto;
          padding: 0 12px;
          background: #10b981;
          color: white;
        }
        .summary-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0px;
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
