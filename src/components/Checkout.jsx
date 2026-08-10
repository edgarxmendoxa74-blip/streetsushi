import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, ShoppingBag, CheckCircle, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', specialRequest: '' });
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderItems, setPlacedOrderItems] = useState([]);
  const [placedOrderTotal, setPlacedOrderTotal] = useState(0);
  const [placedOrderRef, setPlacedOrderRef] = useState('');
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  // If cart is empty and not in success state, redirect back to menu
  React.useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      navigate('/');
    }
  }, [cart, orderSuccess, navigate]);

  const validatePhoneNumber = (phone) => {
    // If empty, it's optional so no error
    if (!phone || phone.trim() === '') {
      setPhoneError('');
      return true;
    }

    // Remove all spaces, dashes, and parentheses
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // Check if it's a valid Philippine mobile number
    // Should start with 09 and have 11 digits total
    const philippinePattern = /^09\d{9}$/;
    
    if (!philippinePattern.test(cleanPhone)) {
      setPhoneError('Please enter a valid Philippine mobile number (e.g., 09XX XXX XXXX)');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only numbers, spaces, dashes, and parentheses
    const sanitized = value.replace(/[^\d\s\-()]/g, '');
    setCustomerDetails({...customerDetails, phone: sanitized});
    
    // Validate on change
    if (sanitized.length > 0) {
      validatePhoneNumber(sanitized);
    } else {
      setPhoneError('');
    }
  };

  const handleDownloadReceipt = (name, phone, items, total, specialRequest, orderRefNumber = null) => {
    // Create a canvas to draw the receipt
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 530 + (items.length * 30) + (specialRequest ? 40 : 0);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#ff6b00';
    ctx.fillRect(0, 0, canvas.width, 100);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🍣 STREET SUSHI', canvas.width / 2, 45);
    ctx.font = '16px Arial';
    ctx.fillText('ORDER RECEIPT', canvas.width / 2, 75);

    // Body
    let y = 130;
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    // Order Reference Number
    if (orderRefNumber) {
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Order Ref: #${orderRefNumber}`, 40, y);
      y += 25;
    }
    
    // Date
    ctx.font = '14px Arial';
    ctx.fillText(`Date: ${new Date().toLocaleString()}`, 40, y);
    y += 30;
    
    // Customer Details
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Customer:', 40, y);
    y += 25;
    ctx.font = '14px Arial';
    ctx.fillText(`Name: ${name}`, 40, y);
    y += 25;
    ctx.fillText(`Phone: ${phone || 'N/A'}`, 40, y);
    y += 35;

    // Items
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Order Items:', 40, y);
    y += 25;
    ctx.font = '14px Arial';
    
    items.forEach(item => {
      ctx.fillText(`${item.quantity}x ${item.name}`, 40, y);
      ctx.textAlign = 'right';
      ctx.fillText(`₱${(item.price * item.quantity).toFixed(2)}`, canvas.width - 40, y);
      ctx.textAlign = 'left';
      y += 30;
    });

    // Special Request
    if (specialRequest) {
      y += 10;
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Special Request:', 40, y);
      y += 25;
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(specialRequest, 40, y);
      ctx.fillStyle = '#000000';
      y += 25;
    }

    // Divider
    y += 10;
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(canvas.width - 40, y);
    ctx.stroke();
    y += 30;

    // Total
    ctx.font = 'bold 20px Arial';
    ctx.fillText('TOTAL AMOUNT:', 40, y);
    ctx.fillStyle = '#ff6b00';
    ctx.textAlign = 'right';
    ctx.fillText(`₱${total.toFixed(2)}`, canvas.width - 40, y);
    y += 40;

    // Footer
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Please show this to the counter.', canvas.width / 2, y);
    ctx.fillText('Thank you for your order!', canvas.width / 2, y + 20);

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `street-sushi-receipt-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerDetails.name) return;
    
    // Validate phone number if provided
    if (customerDetails.phone && !validatePhoneNumber(customerDetails.phone)) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Validate cart has items
      if (cart.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Validate all cart items have IDs
      const invalidItems = cart.filter(item => !item.id);
      if (invalidItems.length > 0) {
        throw new Error('Some items in your cart are missing information. Please refresh and try again.');
      }

      // 1. Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: customerDetails.name,
          customer_phone: customerDetails.phone || null,
          total_price: cartTotal,
          order_type: 'walk-in',
          special_request: customerDetails.specialRequest || null
        }])
        .select()
        .single();
      
      if (orderError) throw orderError;
      if (!order) throw new Error('Failed to create order');

      // 2. Insert order items with validation
      const orderItems = cart.map(item => {
        if (!item.id) {
          console.error('Item missing ID:', item);
          throw new Error(`Item "${item.name}" is missing required information`);
        }
        console.log('Adding order item:', {
          menu_item_id: item.id,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price
        });
        return {
          order_id: order.id,
          menu_item_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price,
          item_name: item.name
        };
      });

      console.log('Order items to insert:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Order items error:', itemsError);
        console.error('Failed order items:', orderItems);
        throw new Error(`Failed to add items to order: ${itemsError.message}`);
      }

      // Store the order reference number and cart data (first 8 characters of UUID)
      const orderRef = order.id.slice(0, 8);
      const orderedItems = [...cart];
      const orderedTotal = cartTotal;
      
      console.log('Order completed - storing data:', {
        orderRef,
        itemCount: orderedItems.length,
        total: orderedTotal
      });
      
      setPlacedOrderRef(orderRef);
      setPlacedOrderItems(orderedItems);
      setPlacedOrderTotal(orderedTotal);
      
      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Order error:', err);
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
          <h1>Your <span>Order</span></h1>
          <div className="checkout-instruction-banner">
            <p>📱 <strong>Show this to our counter staff</strong> - No need to submit online!</p>
          </div>
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
            
            {/* Receipt Preview Visual */}
            <div className="receipt-preview-visual">
              <div className="receipt-paper-preview">
                <div className="receipt-header-preview">
                  <div className="receipt-logo-preview">🍣</div>
                  <h3>STREET SUSHI</h3>
                  <span>ORDER RECEIPT</span>
                </div>
                
                <div className="receipt-body-preview">
                  <div className="receipt-line">
                    <span>Order Ref: #{placedOrderRef}</span>
                  </div>
                  <div className="receipt-line">
                    <span>Date: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="receipt-line">
                    <span>Customer: {customerDetails.name}</span>
                  </div>
                  <div className="receipt-line">
                    <span>Phone: {customerDetails.phone || 'N/A'}</span>
                  </div>
                  
                  <div className="receipt-divider-preview"></div>
                  
                  {(placedOrderItems.length > 0 ? placedOrderItems : cart).map(item => (
                    <div key={item.id} className="receipt-item-line">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div className="receipt-divider-preview"></div>
                  
                  {customerDetails.specialRequest && (
                    <>
                      <div className="receipt-line">
                        <span style={{ fontWeight: 'bold' }}>Special Request:</span>
                      </div>
                      <div className="receipt-line" style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                        <span>{customerDetails.specialRequest}</span>
                      </div>
                      <div className="receipt-divider-preview"></div>
                    </>
                  )}
                  
                  <div className="receipt-total-line">
                    <span>TOTAL:</span>
                    <span>₱{(placedOrderTotal || (placedOrderItems.length > 0 ? placedOrderItems : cart).reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p>Your order has been successfully submitted! The receipt is displayed above with your order reference number <strong>#{placedOrderRef}</strong>. You can optionally download the receipt file to show to our counter staff, or simply show this screen to complete your payment and collect your fresh sushi order.</p>
            
            <div className="success-actions">
              <button className="download-receipt-btn" onClick={() => {
                const finalTotal = placedOrderTotal || (placedOrderItems.length > 0 ? placedOrderItems : cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
                handleDownloadReceipt(customerDetails.name, customerDetails.phone, placedOrderItems, finalTotal, customerDetails.specialRequest, placedOrderRef);
              }}>
                📥 Download Order Receipt
              </button>
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
                  <span className="badge">Walk-in Only</span>
                  <p>📱 Just show this screen to our counter - we'll take your order and you pay there!</p>
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
                      onChange={handlePhoneChange}
                      className={phoneError ? 'input-error' : ''}
                      maxLength="13"
                    />
                    {phoneError && <span className="error-message">{phoneError}</span>}
                  </div>
                </div>
                
                <div className="input-group full-width">
                  <label>💬 Special Request (Optional)</label>
                  <textarea 
                    placeholder="Any special instructions? (e.g., No wasabi, extra ginger, allergies)"
                    value={customerDetails.specialRequest}
                    onChange={e => setCustomerDetails({...customerDetails, specialRequest: e.target.value})}
                    rows="3"
                  />
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
                disabled={isSubmitting || !customerDetails.name || phoneError}
              >
                {isSubmitting ? 'Processing...' : '🍣 Submit Order'}
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

      {/* Receipt Preview Modal */}
      {showReceiptPreview && (
        <div className="receipt-modal-overlay" onClick={() => setShowReceiptPreview(false)}>
          <div className="receipt-modal" onClick={e => e.stopPropagation()}>
            <div className="receipt-header">
              <h3>📄 Order Receipt Preview</h3>
              <button className="close-receipt" onClick={() => setShowReceiptPreview(false)}>✕</button>
            </div>
            
            <div className="receipt-content">
              <div className="receipt-paper">
                <div className="receipt-header-section">
                  <div className="receipt-logo">🍣</div>
                  <h2>STREET SUSHI</h2>
                  <p>ORDER RECEIPT</p>
                </div>
                
                <div className="receipt-body">
                  <div className="receipt-row">
                    <span>Order Ref:</span>
                    <span>#{placedOrderRef}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Date:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                  
                  <div className="receipt-section">
                    <h4>Customer:</h4>
                    <div className="receipt-row">
                      <span>Name:</span>
                      <span>{customerDetails.name}</span>
                    </div>
                    <div className="receipt-row">
                      <span>Phone:</span>
                      <span>{customerDetails.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="receipt-section">
                    <h4>Order Items:</h4>
                    {(orderSuccess ? placedOrderItems : cart).map(item => (
                      <div key={item.id} className="receipt-item">
                        <span>{item.quantity}x {item.name}</span>
                        <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {customerDetails.specialRequest && (
                    <div className="receipt-section">
                      <h4>Special Request:</h4>
                      <p style={{ fontSize: '0.9rem', color: '#666666', marginTop: '8px', fontWeight: '500' }}>
                        {customerDetails.specialRequest}
                      </p>
                    </div>
                  )}

                  <div className="receipt-divider"></div>
                  
                  <div className="receipt-total">
                    <span>TOTAL AMOUNT:</span>
                    <span>₱{(orderSuccess ? (placedOrderTotal || (placedOrderItems.length > 0 ? placedOrderItems : cart).reduce((sum, item) => sum + (item.price * item.quantity), 0)) : cartTotal).toFixed(2)}</span>
                  </div>

                  <div className="receipt-footer">
                    <p>Please show this to the counter.</p>
                    <p>Thank you for your order!</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="receipt-modal-actions">
              <button className="download-from-modal" onClick={() => {
                const finalTotal = orderSuccess ? (placedOrderTotal || (placedOrderItems.length > 0 ? placedOrderItems : cart).reduce((sum, item) => sum + (item.price * item.quantity), 0)) : cartTotal;
                handleDownloadReceipt(customerDetails.name, customerDetails.phone, orderSuccess ? placedOrderItems : cart, finalTotal, customerDetails.specialRequest, placedOrderRef);
                setShowReceiptPreview(false);
              }}>
                📥 Download as PNG
              </button>
              <button className="close-modal-btn" onClick={() => setShowReceiptPreview(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        .checkout-instruction-banner {
          margin-top: 20px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          padding: 20px 30px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
        }
        
        .checkout-instruction-banner p {
          color: white;
          font-size: 1.1rem;
          margin: 0;
          text-align: center;
          font-weight: 500;
        }
        
        .checkout-instruction-banner strong {
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

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
        
        .input-group.full-width {
          grid-column: 1 / -1;
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

        .input-group input,
        .input-group textarea {
          width: 100%;
          padding: 15px 20px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1rem;
          transition: var(--transition);
          font-family: inherit;
        }
        
        .input-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .input-group input:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: var(--street-orange);
          background: white;
          box-shadow: 0 0 0 5px rgba(255, 107, 0, 0.1);
        }

        .input-group input.input-error,
        .input-group textarea.input-error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .input-group input.input-error:focus,
        .input-group textarea.input-error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 5px rgba(239, 68, 68, 0.1);
        }

        .error-message {
          display: block;
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 6px;
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
        
        .receipt-preview-visual {
          margin: 30px 0;
          display: flex;
          justify-content: center;
        }
        
        .receipt-paper-preview {
          background: white;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 25px;
          font-family: 'Courier New', monospace;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          max-width: 350px;
          width: 100%;
        }
        
        .receipt-header-preview {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid var(--street-orange);
        }
        
        .receipt-logo-preview {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }
        
        .receipt-header-preview h3 {
          margin: 0;
          font-size: 1.3rem;
          color: var(--street-black);
          letter-spacing: 2px;
        }
        
        .receipt-header-preview span {
          font-size: 0.8rem;
          color: var(--muted-gray);
          letter-spacing: 1px;
        }
        
        .receipt-body-preview {
          font-size: 0.85rem;
          line-height: 1.6;
        }
        
        .receipt-line {
          margin-bottom: 5px;
          color: var(--street-black);
        }
        
        .receipt-divider-preview {
          border-top: 1px dashed #9ca3af;
          margin: 15px 0;
        }
        
        .receipt-item-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 0.8rem;
        }
        
        .receipt-total-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          font-size: 1.2rem;
          color: var(--street-orange);
          margin-top: 12px;
          padding: 10px 0;
          border-top: 2px solid #f0f0f0;
          border-bottom: 2px solid var(--street-orange);
        }
        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .download-receipt-btn {
          background: #6b7280;
          color: white;
          padding: 15px 30px;
          border-radius: 12px;
          font-weight: 700;
          text-transform: uppercase;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 2px solid #6b7280;
        }
        
        .download-receipt-btn:hover {
          background: #10b981;
          border-color: #10b981;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
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

        /* Receipt Modal */
        .receipt-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .receipt-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
        }

        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          border-bottom: 1px solid #e5e7eb;
        }

        .receipt-header h3 {
          margin: 0;
          color: var(--street-black);
          font-size: 1.3rem;
        }

        .close-receipt {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--muted-gray);
          cursor: pointer;
          transition: var(--transition);
        }

        .close-receipt:hover {
          color: var(--street-orange);
        }

        .receipt-content {
          padding: 30px;
        }

        .receipt-paper {
          background: #fafafa;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 30px;
          font-family: 'Courier New', monospace;
        }

        .receipt-header-section {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--street-orange);
        }

        .receipt-logo {
          font-size: 3rem;
          margin-bottom: 10px;
        }

        .receipt-header-section h2 {
          margin: 0;
          font-size: 1.8rem;
          color: var(--street-black);
          letter-spacing: 2px;
        }

        .receipt-header-section p {
          margin: 5px 0 0 0;
          color: var(--muted-gray);
          font-size: 0.9rem;
          letter-spacing: 1px;
        }

        .receipt-body {
          line-height: 1.6;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .receipt-section {
          margin-bottom: 25px;
        }

        .receipt-section h4 {
          margin: 0 0 10px 0;
          color: var(--street-black);
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.9rem;
        }

        .receipt-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.85rem;
        }

        .receipt-divider {
          border-top: 1px dashed #9ca3af;
          margin: 20px 0;
        }

        .receipt-total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 1.1rem;
          color: var(--street-orange);
          margin-bottom: 20px;
        }

        .receipt-footer {
          text-align: center;
          margin-top: 20px;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
        }

        .receipt-footer p {
          margin: 5px 0;
          font-size: 0.8rem;
          color: var(--muted-gray);
        }

        .receipt-modal-actions {
          padding: 20px 30px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 15px;
        }

        .download-from-modal {
          flex: 1;
          background: var(--street-orange);
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 700;
          text-transform: uppercase;
          transition: var(--transition);
        }

        .download-from-modal:hover {
          background: var(--street-black);
          transform: translateY(-1px);
        }

        .close-modal-btn {
          padding: 12px 20px;
          background: #f3f4f6;
          color: var(--muted-gray);
          border-radius: 10px;
          font-weight: 600;
          transition: var(--transition);
        }

        .close-modal-btn:hover {
          background: #e5e7eb;
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
          .checkout-instruction-banner {
            padding: 15px 20px;
          }
          .checkout-instruction-banner p {
            font-size: 0.95rem;
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
          .checkout-instruction-banner {
            padding: 12px 15px;
          }
          .checkout-instruction-banner p {
            font-size: 0.85rem;
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
