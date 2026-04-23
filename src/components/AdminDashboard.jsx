import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Settings, Plus, Edit, Trash2, ArrowLeft, Image as ImageIcon, Check, Upload, ClipboardList, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  
  // Site Settings State
  const [siteSettings, setSiteSettings] = useState({
    logo_url: '',
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    fb_url: '',
    ig_url: '',
    tiktok_url: '',
    contact_number: '',
    location: ''
  });
  const [heroSlides, setHeroSlides] = useState([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category_id: '',
    image_url: '',
    description: '',
    is_featured: false
  });

  const fetchSiteSettings = async () => {
    const { data: settings } = await supabase.from('site_settings').select('*').single();
    if (settings) setSiteSettings(settings);

    const { data: slides } = await supabase.from('hero_slides').select('*').order('order_index', { ascending: true });
    if (slides) setHeroSlides(slides);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategoriesList(data);
  };

  const fetchMenu = async () => {
    const { data: itemData } = await supabase
      .from('menu_items')
      .select(`id, name, price, image_url, description, is_featured, category_id, categories ( name )`);
    
    if (itemData) {
      const formattedData = itemData.map(item => ({
        id: item.id,
        name: item.name,
        category: item.categories?.name || 'Uncategorized',
        category_id: item.category_id,
        price: item.price,
        image: item.image_url,
        description: item.description || '',
        is_featured: item.is_featured || false
      }));
      setMenuItems(formattedData);
    }
  };

  const fetchOrders = async () => {
    try {
      setIsFetchingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMenu();
      fetchCategories();
      fetchSiteSettings();
      fetchOrders();
    }
  }, [isAuthenticated]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state for immediate feedback
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category_id: item.category_id || '',
      image_url: item.image || '',
      description: item.description || '',
      is_featured: item.is_featured || false
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      category_id: categoriesList[0]?.id || '',
      image_url: '',
      description: '',
      is_featured: false
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const itemData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      image_url: formData.image_url,
      description: formData.description,
      is_featured: formData.is_featured
    };

    let error;
    if (editingItem) {
      const { error: err } = await supabase.from('menu_items').update(itemData).eq('id', editingItem.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('menu_items').insert([itemData]);
      error = err;
    }

    if (!error) {
      setIsModalOpen(false);
      fetchMenu();
    } else {
      alert("Error saving item: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (!error) {
        fetchMenu();
      } else {
        alert("Error deleting item.");
      }
    }
  };

  const handleUpdateSiteSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const { error } = await supabase.from('site_settings').update({
      logo_url: siteSettings.logo_url,
      hero_title: siteSettings.hero_title,
      hero_subtitle: siteSettings.hero_subtitle,
      hero_description: siteSettings.hero_description,
      fb_url: siteSettings.fb_url,
      ig_url: siteSettings.ig_url,
      tiktok_url: siteSettings.tiktok_url,
      contact_number: siteSettings.contact_number,
      location: siteSettings.location
    }).eq('id', 1);

    if (error) alert("Error updating settings: " + error.message);
    else alert("Site settings updated successfully!");
    setIsSavingSettings(false);
  };

  const handleUpdateSlide = async (id, url) => {
    const { error } = await supabase.from('hero_slides').update({ image_url: url }).eq('id', id);
    if (error) alert("Error updating slide: " + error.message);
    else {
        // Refresh local state
        setHeroSlides(heroSlides.map(s => s.id === id ? { ...s, image_url: url } : s));
    }
  };

  const handleFileUpload = async (file, pathPrefix) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${pathPrefix}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('streetsushi')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('streetsushi')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      alert('Error uploading image: ' + error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'sushi2026') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <motion.div 
          className="login-box glass"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="logo-center">
            STREET<span>ADMIN</span>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter username" 
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter password" 
              />
            </div>
            {loginError && <p className="error-text">{loginError}</p>}
            <button type="submit" className="login-btn">Secure Login</button>
          </form>
          <button className="back-btn-center" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Return to Site
          </button>
        </motion.div>

        <style jsx="true">{`
          .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-light);
            position: relative;
            padding: 20px;
          }
          .login-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.4;
            background-image: radial-gradient(circle at 100% 150%, var(--bg-light) 24%, var(--wave-color) 25%, var(--wave-color) 28%, var(--bg-light) 29%, var(--bg-light) 36%, var(--wave-color) 36%, var(--wave-color) 40%, transparent 40%),
              radial-gradient(circle at 0 150%, var(--bg-light) 24%, var(--wave-color) 25%, var(--wave-color) 28%, var(--bg-light) 29%, var(--bg-light) 36%, var(--wave-color) 36%, var(--wave-color) 40%, transparent 40%);
            background-size: 60px 30px;
            z-index: 0;
          }
          .login-box {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 400px;
            padding: 40px;
            border-radius: 24px;
            text-align: center;
            background: white;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--glass-border);
          }
          .logo-center {
            font-family: var(--font-brush);
            font-size: 2.2rem;
            color: var(--street-black);
            margin-bottom: 30px;
          }
          .logo-center span {
            color: var(--street-orange);
          }
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .input-group label {
            display: block;
            text-align: left;
            margin-bottom: 8px;
            color: var(--muted-gray);
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
          }
          .input-group input {
            width: 100%;
            padding: 12px 15px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            color: var(--street-black);
            transition: var(--transition);
          }
          .input-group input:focus {
            outline: none;
            border-color: var(--street-orange);
            background: white;
            box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.1);
          }
          .error-text {
            color: #ef4444;
            font-size: 0.85rem;
          }
          .login-btn {
            background: var(--street-orange);
            color: white;
            padding: 12px;
            border-radius: 12px;
            font-weight: 700;
            text-transform: uppercase;
            transition: var(--transition);
            margin-top: 10px;
          }
          .login-btn:hover {
            box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
          }
          .back-btn-center {
            margin-top: 25px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--muted-gray);
            transition: var(--transition);
            font-size: 0.9rem;
          }
          .back-btn-center:hover {
            color: var(--street-orange);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            STREET<span>ADMIN</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <ShoppingBag size={20} /> Manage Menu
          </button>
          <button className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ClipboardList size={20} /> Orders
          </button>
          <button className={`nav-btn ${activeTab === 'site-settings' ? 'active' : ''}`} onClick={() => setActiveTab('site-settings')}>
            <ImageIcon size={20} /> Site Branding
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Back to Site
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <header className="admin-header">
          <h2>
            {activeTab === 'menu' ? 'Menu Management' : 
             activeTab === 'orders' ? 'Orders Management' :
             activeTab === 'site-settings' ? 'Site Branding' : 
             'Settings'}
          </h2>
          <div className="admin-user">
            <span className="user-role">Super Admin</span>
            <div className="user-avatar">A</div>
          </div>
        </header>

        <div className="admin-body">

          {activeTab === 'menu' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="menu-manager"
            >
              <div className="manager-toolbar">
                <input type="text" placeholder="Search menu items..." className="admin-search" />
                <button className="add-item-btn" onClick={handleAddNew}>
                  <Plus size={18} /> Add New Item
                </button>
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item.id}>
                        <td className="item-cell">
                          <img src={item.image} alt={item.name} className="item-thumb" />
                          <span>{item.name}</span>
                        </td>
                        <td>{item.category}</td>
                        <td>₱{item.price.toFixed(2)}</td>
                        <td>
                          {item.is_featured ? <span className="status-badge featured">Featured</span> : <span className="status-badge active">Active</span>}
                        </td>
                        <td className="actions-cell">
                          <button className="action-btn edit" onClick={() => handleEdit(item)}><Edit size={16} /></button>
                          <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="orders-manager"
            >
              <div className="manager-toolbar">
                <div className="orders-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Orders</span>
                    <span className="stat-value">{orders.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value">₱{orders.reduce((sum, o) => sum + (o.total_price || 0), 0).toFixed(2)}</span>
                  </div>
                </div>
                <button className="refresh-btn" onClick={fetchOrders} disabled={isFetchingOrders}>
                   {isFetchingOrders ? 'Updating...' : 'Refresh Orders'}
                </button>
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No orders found yet.</td>
                      </tr>
                    ) : orders.map(order => (
                      <tr key={order.id}>
                        <td><span className="id-badge">#{order.id.slice(0, 8)}</span></td>
                        <td>
                          <div className="customer-info-cell">
                            <strong>{order.customer_name}</strong>
                            <span>{order.customer_phone}</span>
                          </div>
                        </td>
                        <td>
                          <div className="order-items-summary">
                            {order.order_items?.map(it => (
                              <div key={it.id} className="summary-line">
                                {it.quantity}x {it.item_name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td><strong>₱{(order.total_price || 0).toFixed(2)}</strong></td>
                        <td>
                           <select 
                            className={`status-select ${order.status}`}
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                           >
                             <option value="pending">Pending</option>
                             <option value="confirmed">Confirmed</option>
                             <option value="preparing">Preparing</option>
                             <option value="completed">Completed</option>
                             <option value="cancelled">Cancelled</option>
                           </select>
                        </td>
                        <td>{new Date(order.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>
                          <button className="action-btn info" onClick={() => alert(`Full Order ID: ${order.id}\nCustomer: ${order.customer_name}`)}>
                            <Info size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'site-settings' && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="site-settings-container"
             >
                <div className="settings-grid">
                  {/* Hero Section Settings */}
                  <form onSubmit={handleUpdateSiteSettings} className="settings-card">
                    <div className="section-header-inline">
                      <h3>Hero Section Management</h3>
                      <button type="submit" className="save-settings-btn min-save" disabled={isSavingSettings}>
                        {isSavingSettings ? 'Saving...' : 'Save Hero Text'}
                      </button>
                    </div>

                    <div className="settings-form-grid hero-text-inputs">
                      <div className="form-group">
                        <label>Hero Title</label>
                        <input 
                          type="text" 
                          placeholder="Main Heading"
                          value={siteSettings.hero_title} 
                          onChange={e => setSiteSettings({...siteSettings, hero_title: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Hero Subtitle</label>
                        <input 
                          type="text" 
                          placeholder="Small Heading Above Title"
                          value={siteSettings.hero_subtitle} 
                          onChange={e => setSiteSettings({...siteSettings, hero_subtitle: e.target.value})}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Hero Description</label>
                        <textarea 
                          rows="2"
                          placeholder="Short description under the title..."
                          value={siteSettings.hero_description || ''} 
                          onChange={e => setSiteSettings({...siteSettings, hero_description: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="slideshow-header">
                      <h4>Background Slideshow (4 Images)</h4>
                      <p className="helper-text">Images auto-save on upload</p>
                    </div>

                    <div className="slides-list">
                      {heroSlides.slice(0, 4).map((slide, idx) => (
                        <div key={slide.id} className="slide-edit-row">
                          <div className="slide-preview">
                            <img src={slide.image_url} alt={`Slide ${idx + 1}`} />
                          </div>
                          <div className="slide-input">
                            <label>Slide {idx + 1}</label>
                            <div className="input-with-action">
                              <label className="upload-label">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  hidden 
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const url = await handleFileUpload(file, `hero-slide-${idx+1}`);
                                      if (url) {
                                        const newSlides = [...heroSlides];
                                        newSlides[idx].image_url = url;
                                        setHeroSlides(newSlides);
                                        // Also auto-save to DB for slides to make it snappy
                                        handleUpdateSlide(slide.id, url);
                                      }
                                    }
                                  }}
                                />
                                <div className={`upload-btn min-btn ${isUploading ? 'loading' : ''}`}>
                                   <Upload size={16} />
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </form>

                  {/* General Settings */}
                  <form onSubmit={handleUpdateSiteSettings} className="settings-card">
                    <h3>Logo & Branding</h3>
                    <div className="settings-form-grid">
                      <div className="form-group">
                        <label>Site Logo</label>
                        <div className="input-with-upload">
                          <div className="logo-upload-control">
                            {siteSettings.logo_url ? (
                             <div className="logo-preview-box">
                               <img src={siteSettings.logo_url} alt="Site Logo" />
                             </div>
                          ) : (
                             <div className="logo-preview-box empty">
                               <ImageIcon size={20} />
                             </div>
                          )}
                        </div>
                          <label className="upload-label">
                            <input 
                              type="file" 
                              accept="image/*" 
                              hidden 
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const url = await handleFileUpload(file, 'logo');
                                  if (url) setSiteSettings({...siteSettings, logo_url: url});
                                }
                              }}
                            />
                            <div className={`upload-btn ${isUploading ? 'loading' : ''}`}>
                               <Upload size={16} />
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="contact-divider">Contact & Socials</div>
                    
                    <div className="settings-form-grid">
                      <div className="form-group">
                        <label>Facebook URL</label>
                        <input 
                          type="text" 
                          placeholder="https://facebook.com/..."
                          value={siteSettings.fb_url || ''} 
                          onChange={e => setSiteSettings({...siteSettings, fb_url: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Instagram URL</label>
                        <input 
                          type="text" 
                          placeholder="https://instagram.com/..."
                          value={siteSettings.ig_url || ''} 
                          onChange={e => setSiteSettings({...siteSettings, ig_url: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>TikTok URL</label>
                        <input 
                          type="text" 
                          placeholder="https://tiktok.com/@..."
                          value={siteSettings.tiktok_url || ''} 
                          onChange={e => setSiteSettings({...siteSettings, tiktok_url: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Contact Number</label>
                        <input 
                          type="text" 
                          placeholder="+63 9XX XXX XXXX"
                          value={siteSettings.contact_number || ''} 
                          onChange={e => setSiteSettings({...siteSettings, contact_number: e.target.value})}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Location / Address</label>
                        <input 
                          type="text" 
                          placeholder="123 Street, City"
                          value={siteSettings.location || ''} 
                          onChange={e => setSiteSettings({...siteSettings, location: e.target.value})}
                        />
                      </div>
                    </div>

                    <button type="submit" className="save-settings-btn" disabled={isSavingSettings}>
                      {isSavingSettings ? 'Saving...' : 'Save Branding & Contact'}
                    </button>
                  </form>
               </div>
             </motion.div>
          )}

          {activeTab === 'settings' && (
            <div className="coming-soon">
              <h3>Module in Development</h3>
              <p>This section is currently being integrated with Supabase.</p>
            </div>
          )}
        </div>

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="modal-form-container"
            >
              <h3>{editingItem ? 'Edit Menu Item' : 'Add New Item'}</h3>
              <form onSubmit={handleSave} className="item-form">
                <div className="form-group">
                  <label>Item Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={formData.category_id} 
                      onChange={e => setFormData({...formData, category_id: e.target.value})}
                    >
                      {categoriesList.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Item Image</label>
                  <div className="input-with-upload">
                    <input 
                      type="text" 
                      placeholder="Image URL or upload..."
                      value={formData.image_url} 
                      onChange={e => setFormData({...formData, image_url: e.target.value})} 
                    />
                    <label className="upload-label">
                      <input 
                        type="file" 
                        accept="image/*" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = await handleFileUpload(file, 'menu-item');
                            if (url) setFormData({...formData, image_url: url});
                          }
                        }}
                      />
                      <div className={`upload-btn ${isUploading ? 'loading' : ''}`}>
                         <Upload size={16} />
                      </div>
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>
                <div className="checkbox-group">
                  <input 
                    type="checkbox" 
                    id="featured"
                    checked={formData.is_featured} 
                    onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
                  />
                  <label htmlFor="featured">Featured Item</label>
                </div>
                <div className="form-group">
                  <label>Ingredients (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Salmon, Avocado, Cucumber"
                    value={formData.ingredients || ''} 
                    onChange={e => setFormData({...formData, ingredients: e.target.value})} 
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">Cancel</button>
                  <button type="submit" className="save-btn">Save Item</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>

      <style jsx="true">{`
        /* Dashboard Layout */
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f5f7f9;
          color: var(--street-black);
        }

        .sidebar {
          width: 280px;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          background: white;
          z-index: 100;
        }

        .sidebar-header {
          padding: 30px;
          border-bottom: 1px solid #f3f4f6;
        }

        .sidebar-header .logo {
          font-family: var(--font-brush);
          font-size: 1.8rem;
          color: var(--street-black);
        }
        .sidebar-header .logo span { color: var(--street-orange); }

        .sidebar-nav {
          padding: 30px 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 15px;
          width: 100%;
          padding: 15px 20px;
          border-radius: 12px;
          color: #6b7280;
          font-weight: 600;
          transition: var(--transition);
          text-align: left;
        }

        .nav-btn:hover, .nav-btn.active {
          background: rgba(255, 107, 0, 0.05);
          color: var(--street-orange);
        }

        .sidebar-footer {
          padding: 30px;
          border-top: 1px solid #f3f4f6;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #6b7280;
          transition: var(--transition);
        }

        .back-btn:hover {
          color: var(--street-orange);
        }

        .admin-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .admin-header {
          height: 80px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          background: white;
        }

        .admin-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: var(--street-orange);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .admin-body {
          padding: 40px;
          flex: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        .manager-toolbar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .admin-search {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 12px 20px;
          border-radius: 12px;
          color: var(--street-black);
          width: 300px;
          box-shadow: var(--shadow-sm);
        }

        .admin-search:focus {
          border-color: var(--street-orange);
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
        }

        .add-item-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--street-orange);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          transition: var(--transition);
        }

        .add-item-btn:hover {
          box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
          transform: translateY(-1px);
        }

        .table-container {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--shadow-md);
          border: 1px solid #e5e7eb;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table th {
          background: #f9fafb;
          padding: 20px;
          color: #4b5563;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 1px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
        }

        .admin-table td {
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
          color: #4b5563;
        }

        .item-thumb {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          object-fit: cover;
        }

        .status-badge {
          background: #ecfdf5;
          color: #059669;
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .status-badge.featured {
          background: #fff7ed;
          color: var(--street-orange);
        }

        .action-btn {
          width: 35px;
          height: 35px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .action-btn.edit {
          background: #f3f4f6;
          color: #4b5563;
        }
        .action-btn.edit:hover { background: #e5e7eb; color: var(--street-black); }

        .action-btn.delete {
          background: #fef2f2;
          color: #ef4444;
        }
        .action-btn.delete:hover { background: #ef4444; color: white; }

        .action-btn.info { background: #eff6ff; color: #3b82f6; }
        .action-btn.info:hover { background: #3b82f6; color: white; }

        /* Orders Specific Styles */
        .orders-stats { display: flex; gap: 20px; margin-bottom: 0; }
        .stat-item {
          background: white;
          padding: 15px 25px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }
        .stat-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--street-black); }

        .status-select {
          padding: 6px 12px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: var(--transition);
        }
        .status-select.pending { background: #fef3c7; color: #92400e; }
        .status-select.confirmed { background: #dcfce7; color: #166534; }
        .status-select.preparing { background: #dbeafe; color: #1e40af; }
        .status-select.completed { background: #f3f4f6; color: #374151; }
        .status-select.cancelled { background: #fee2e2; color: #991b1b; }

        .customer-info-cell { display: flex; flex-direction: column; }
        .customer-info-cell span { font-size: 0.8rem; color: #9ca3af; }
        
        .order-items-summary { font-size: 0.85rem; line-height: 1.4; color: #4b5563; }
        .id-badge { font-family: monospace; padding: 4px 8px; background: #f8fafc; border-radius: 4px; border: 1px solid #e2e8f0; font-size: 0.8rem; }

        .refresh-btn { 
          padding: 8px 16px; 
          border-radius: 8px; 
          background: white; 
          border: 1px solid #e5e7eb; 
          color: #4b5563; 
          font-weight: 600; 
          font-size: 0.85rem;
          cursor: pointer;
        }
        .refresh-btn:hover { background: #f9fafb; border-color: #d1d5db; }

        .settings-card {
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: var(--shadow-md);
          border: 1px solid #e5e7eb;
          margin-bottom: 30px;
        }
        .settings-card h3 {
          color: var(--street-black);
          font-weight: 700;
          margin-bottom: 25px;
        }

        .form-group label {
          color: #374151;
          font-weight: 600;
          display: block;
          margin-bottom: 8px;
        }

        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          color: var(--street-black);
          border-radius: 12px;
          padding: 12px;
          font-family: inherit;
        }
        .form-group input:focus {
          border-color: var(--street-orange);
          background: white;
          outline: none;
        }

        .modal-form-container {
          background: white;
          border-radius: 24px;
          box-shadow: var(--shadow-lg);
          padding: 40px;
          max-width: 600px;
          width: 100%;
        }
        .modal-form-container h3 { color: var(--street-black); font-family: var(--font-brush); font-size: 2.2rem; margin-bottom: 30px;}

        .save-btn { border-radius: 12px; background: var(--street-orange); color: white; padding: 12px 30px; font-weight: 700; text-transform: uppercase; }
        .save-btn:hover { box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3); }

        .cancel-btn { padding: 12px 24px; color: var(--muted-gray); font-weight: 600; }

        .upload-btn {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          cursor: pointer;
        }
        .upload-btn:hover {
          background: rgba(255, 107, 0, 0.1);
          color: var(--street-orange);
          border-color: var(--street-orange);
        }

        .input-with-upload { display: flex; gap: 10px; align-items: center; }
        .input-with-upload input { flex: 1; }

        .checkbox-group { display: flex; align-items: center; gap: 10px; }
        .checkbox-group input { width: 18px; height: 18px; accent-color: var(--street-orange); }

        .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }

        .settings-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        .logo-preview-box, .slide-preview {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          flex-shrink: 0;
        }
        .logo-preview-box img, .slide-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .logo-upload-control {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        /* Slide Management Horizontal Layout */
        .slides-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-top: 10px;
        }
        .slide-edit-row {
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 15px;
          transition: var(--transition);
        }
        .slide-edit-row:hover {
          border-color: var(--street-orange);
          box-shadow: var(--shadow-sm);
        }
        .slide-preview {
          width: 100%;
          height: 120px;
          border-radius: 10px;
          overflow: hidden;
          background: #e2e8f0;
        }
        .slide-input label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .input-with-action {
          display: flex;
          justify-content: center;
        }
        .min-btn {
          width: 100% !important;
          height: 40px !important;
          border-radius: 8px !important;
        }

        .section-header-inline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        .section-header-inline h3 { margin-bottom: 0 !important; }
        .min-save { 
          width: auto !important; 
          padding: 8px 16px !important; 
          font-size: 0.8rem !important;
          margin-top: 0 !important;
        }
        .hero-text-inputs {
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 1px dashed #e2e8f0;
        }
        .slideshow-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .slideshow-header h4 { font-size: 0.9rem; color: var(--street-black); font-weight: 700; }
        .helper-text { font-size: 0.75rem; color: #94a3b8; font-style: italic; }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
