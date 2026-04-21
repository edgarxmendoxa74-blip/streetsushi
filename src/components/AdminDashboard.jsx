import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Settings, Plus, Edit, Trash2, ArrowLeft, Image as ImageIcon, Check, Upload } from 'lucide-react';
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
    fb_url: '',
    ig_url: '',
    tiktok_url: '',
    contact_number: '',
    location: ''
  });
  const [heroSlides, setHeroSlides] = useState([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchMenu();
      fetchCategories();
      fetchSiteSettings();
    }
  }, [isAuthenticated]);

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
            background: #050505;
            padding: 20px;
          }
          .login-box {
            width: 100%;
            max-width: 400px;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
          }
          .logo-center {
            font-family: 'Anton', sans-serif;
            font-size: 2.2rem;
            letter-spacing: 2px;
            color: white;
            margin-bottom: 30px;
          }
          .logo-center span {
            color: var(--neon-red);
          }
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .input-group text-align: left;
          .input-group label {
            display: block;
            text-align: left;
            margin-bottom: 8px;
            color: var(--muted-gray);
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .input-group input {
            width: 100%;
            padding: 12px 15px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            color: white;
            transition: var(--transition);
          }
          .input-group input:focus {
            outline: none;
            border-color: var(--neon-red);
          }
          .error-text {
            color: var(--neon-red);
            font-size: 0.85rem;
          }
          .login-btn {
            background: var(--neon-red);
            color: white;
            padding: 12px;
            border-radius: 8px;
            font-weight: 700;
            text-transform: uppercase;
            transition: var(--transition);
            margin-top: 10px;
          }
          .login-btn:hover {
            box-shadow: 0 0 15px rgba(255, 49, 49, 0.4);
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
            color: white;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <div className="logo">
            STREET<span>ADMIN</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <ShoppingBag size={20} /> Manage Menu
          </button>
          <button className={`nav-btn ${activeTab === 'site-settings' ? 'active' : ''}`} onClick={() => setActiveTab('site-settings')}>
            <ImageIcon size={20} /> Site Branding
          </button>
          <button className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> System
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
             activeTab === 'site-settings' ? 'Site Branding' : 
             'System Settings'}
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

              <div className="table-container glass">
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
                        <td>${item.price.toFixed(2)}</td>
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

          {activeTab === 'site-settings' && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="site-settings-container"
             >
               <div className="settings-grid">
                  {/* General Settings */}
                  <form onSubmit={handleUpdateSiteSettings} className="settings-card glass">
                    <h3>Logo & Branding</h3>
                    <div className="form-group">
                      <label>Site Logo</label>
                      <div className="input-with-upload">
                        <div className="logo-upload-control">
                          <span className="current-url-display">{siteSettings.logo_url || 'No logo set'}</span>
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
                    <div className="form-group">
                      <label>Hero Title</label>
                      <input 
                        type="text" 
                        value={siteSettings.hero_title} 
                        onChange={e => setSiteSettings({...siteSettings, hero_title: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Hero Subtitle</label>
                      <input 
                        type="text" 
                        value={siteSettings.hero_subtitle} 
                        onChange={e => setSiteSettings({...siteSettings, hero_subtitle: e.target.value})}
                      />
                    </div>

                    <div className="contact-divider">Contact & Socials</div>
                    
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
                    <div className="form-group">
                      <label>Location / Address</label>
                      <input 
                        type="text" 
                        placeholder="123 Street, City"
                        value={siteSettings.location || ''} 
                        onChange={e => setSiteSettings({...siteSettings, location: e.target.value})}
                      />
                    </div>

                    <button type="submit" className="save-settings-btn" disabled={isSavingSettings}>
                      {isSavingSettings ? 'Saving...' : 'Save Branding & Contact'}
                    </button>
                  </form>

                  {/* Slideshow Settings */}
                  <div className="settings-card glass">
                    <h3>Hero Slideshow (4 Images)</h3>
                    <div className="slides-list">
                      {heroSlides.map((slide, idx) => (
                        <div key={slide.id} className="slide-edit-row">
                          <div className="slide-preview">
                            <img src={slide.image_url} alt={`Slide ${idx + 1}`} />
                          </div>
                          <div className="slide-input">
                            <label>Slide {idx + 1} URL</label>
                            <div className="input-with-action">
                              <div className="current-url-display truncate">
                                {slide.image_url.split('/').pop()}
                              </div>
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
                  </div>
               </div>
             </motion.div>
          )}

          {activeTab === 'settings' && (
            <div className="coming-soon glass">
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
              className="modal-form-container glass"
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
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #050505;
          color: white;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          background: rgba(10, 10, 10, 0.95);
        }

        .sidebar-header {
          padding: 30px;
          border-bottom: 1px solid var(--glass-border);
        }

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
          border-radius: 8px;
          color: var(--muted-gray);
          font-weight: 600;
          transition: var(--transition);
          text-align: left;
        }

        .nav-btn:hover, .nav-btn.active {
          background: rgba(255, 49, 49, 0.1);
          color: var(--neon-red);
        }

        .sidebar-footer {
          padding: 30px;
          border-top: 1px solid var(--glass-border);
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--muted-gray);
          transition: var(--transition);
        }

        .back-btn:hover {
          color: white;
        }

        /* Main Content */
        .admin-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .admin-header {
          height: 80px;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          background: rgba(10, 10, 10, 0.5);
        }

        .admin-user {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-role {
          font-size: 0.85rem;
          color: var(--muted-gray);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: var(--neon-red);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .admin-body {
          padding: 40px;
          flex: 1;
        }

        /* Stats Dashboard */
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }

        .stat-card {
          padding: 30px;
          border-radius: 12px;
        }

        .stat-card h3 {
          font-size: 1rem;
          color: var(--muted-gray);
          margin-bottom: 15px;
        }

        .stat-value {
          display: block;
          font-size: 2.5rem;
          font-weight: bold;
          font-family: 'Anton', sans-serif;
          margin-bottom: 10px;
        }

        .stat-change {
          font-size: 0.85rem;
        }

        .stat-change.positive { color: #00ff88; }
        .stat-change.neutral { color: var(--muted-gray); }

        /* Menu Manager */
        .manager-toolbar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .admin-search {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          width: 300px;
        }

        .admin-search:focus {
          border-color: var(--neon-red);
          outline: none;
        }

        .add-item-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--neon-red);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          transition: var(--transition);
        }

        .add-item-btn:hover {
          box-shadow: 0 0 20px rgba(255, 49, 49, 0.4);
        }

        /* Table */
        .table-container {
          border-radius: 12px;
          overflow: hidden;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background: rgba(255,255,255,0.02);
          padding: 20px;
          color: var(--muted-gray);
          font-weight: 600;
          border-bottom: 1px solid var(--glass-border);
        }

        .admin-table td {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .item-cell {
          display: flex;
          align-items: center;
          gap: 15px;
          font-weight: 600;
        }

        .item-thumb {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
        }

        .status-badge {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
          padding: 6px 12px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .actions-cell {
          display: flex;
          gap: 10px;
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
          background: rgba(255,255,255,0.05);
          color: white;
        }

        .action-btn.edit:hover { background: rgba(255,255,255,0.1); }

        .action-btn.delete {
          background: rgba(255, 49, 49, 0.1);
          color: var(--neon-red);
        }

        .action-btn.delete:hover {
          background: var(--neon-red);
          color: white;
        }

        .coming-soon {
          padding: 60px;
          text-align: center;
          border-radius: 12px;
        }

        .coming-soon h3 {
          margin-bottom: 10px;
          color: var(--neon-red);
        }

        @media (max-width: 1024px) {
          .admin-layout {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
          }
          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
          }
          .manager-toolbar {
            flex-direction: column;
            gap: 20px;
          }
          .admin-search {
            width: 100%;
          }
          .table-container {
            overflow-x: auto;
          }
        }

        /* Modal & Form Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          padding: 20px;
        }

        .modal-form-container {
          width: 100%;
          max-width: 600px;
          padding: 40px;
          border-radius: 12px;
        }

        .modal-form-container h3 {
          margin-bottom: 30px;
          font-size: 1.8rem;
          color: var(--neon-red);
        }

        .item-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.85rem;
          color: var(--muted-gray);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .form-group input, 
        .form-group select, 
        .form-group textarea {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          padding: 12px;
          border-radius: 6px;
          color: white;
          font-family: inherit;
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox-group input {
          width: 18px;
          height: 18px;
          accent-color: var(--neon-red);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 20px;
        }

        .cancel-btn {
          padding: 12px 24px;
          color: var(--muted-gray);
          font-weight: 600;
        }

        .save-btn {
          background: var(--neon-red);
          color: white;
          padding: 12px 30px;
          border-radius: 6px;
          font-weight: 700;
          text-transform: uppercase;
          transition: var(--transition);
        }

        .save-btn:hover {
          box-shadow: 0 0 15px var(--neon-red);
        }

        /* Site Settings Styles */
        .site-settings-container {
           width: 100%;
        }
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        .settings-card {
          padding: 30px;
          border-radius: 12px;
        }
        .settings-card h3 {
          margin-bottom: 25px;
          color: var(--neon-red);
          font-family: 'Anton', sans-serif;
          letter-spacing: 1px;
        }
        .contact-divider {
          margin: 30px 0 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--glass-border);
          color: var(--neon-red);
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .save-settings-btn {
          width: 100%;
          margin-top: 20px;
          background: var(--neon-red);
          color: white;
          padding: 12px;
          border-radius: 6px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .slides-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .slide-edit-row {
          display: flex;
          gap: 15px;
          align-items: center;
          padding: 15px;
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
          border: 1px solid var(--glass-border);
        }
        .slide-preview {
          width: 80px;
          height: 60px;
          border-radius: 4px;
          overflow: hidden;
        }
        .slide-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .slide-input {
          flex: 1;
        }
        .input-with-action {
          display: flex;
          gap: 10px;
          align-items: center;
          background: rgba(255,255,255,0.03);
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
        }
        .current-url-display {
          font-size: 0.75rem;
          color: var(--muted-gray);
          flex: 1;
        }
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        .logo-upload-control {
           flex: 1;
           padding: 0 10px;
        }
        .logo-upload-control .current-url-display {
           font-size: 0.85rem;
        }
        @media (max-width: 1200px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Upload Styling */
        .input-with-upload {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .input-with-upload input {
          flex: 1;
        }
        .upload-label {
          cursor: pointer;
        }
        .upload-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--muted-gray);
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;      /* Vertically center the icon */
          justify-content: center;   /* Horizontally center the icon */
          border-radius: 8px;
          transition: var(--transition);
        }
        .upload-btn:hover {
          background: rgba(255, 49, 49, 0.1);
          color: var(--neon-red);
          border-color: var(--neon-red);
        }
        .upload-btn.loading {
          opacity: 0.5;
          pointer-events: none;
          animation: pulse 1.5s infinite;
        }
        .upload-btn.min-btn {
           width: 40px;
           height: 40px;
        }

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
